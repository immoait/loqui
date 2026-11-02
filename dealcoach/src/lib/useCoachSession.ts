"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEMO_SCRIPT } from "./defaults";
import type {
  CoachCard,
  CoachDecision,
  CoachSettings,
  KnowledgeItem,
  SessionReport,
  Speaker,
  Utterance,
} from "./types";

export type SessionMode = "idle" | "mic" | "demo";

const LOCAL_HINT_COOLDOWN_MS = 90_000;
/** Ein Impuls, der länger braucht, gehört nicht mehr zum Moment. */
const STALE_AFTER_MS = 12_000;

const uid = () => Math.random().toString(36).slice(2, 10);
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export function talkShare(transcript: Utterance[], sinceT = 0) {
  let rep = 0;
  let total = 0;
  for (const u of transcript) {
    if (u.t < sinceT) continue;
    const w = words(u.text);
    total += w;
    if (u.speaker === "rep") rep += w;
  }
  return { rep, total, share: total ? rep / total : 0 };
}

// Minimale Typen für die Web Speech API (nur Chromium/Safari).
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}

function getRecognition(): SpeechRecognitionLike | null {
  const w = window as unknown as Record<string, new () => SpeechRecognitionLike>;
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function useCoachSession(settings: CoachSettings, knowledge: KnowledgeItem[], onFinish: (r: SessionReport) => void) {
  const [mode, setMode] = useState<SessionMode>("idle");
  const [transcript, setTranscript] = useState<Utterance[]>([]);
  const [interim, setInterim] = useState("");
  const [cards, setCards] = useState<CoachCard[]>([]);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speaker, setSpeaker] = useState<Speaker>("rep");
  const [elapsed, setElapsed] = useState(0);

  const startRef = useRef(0);
  const startedAtRef = useRef("");
  const transcriptRef = useRef<Utterance[]>([]);
  const cardsRef = useRef<CoachCard[]>([]);
  const speakerRef = useRef<Speaker>("rep");
  const settingsRef = useRef(settings);
  const knowledgeRef = useRef(knowledge);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastLocalHintRef = useRef(-Infinity);
  const inFlightRef = useRef(0);
  const modeRef = useRef<SessionMode>("idle");

  useEffect(() => {
    settingsRef.current = settings;
    knowledgeRef.current = knowledge;
  }, [settings, knowledge]);

  useEffect(() => {
    speakerRef.current = speaker;
  }, [speaker]);

  useEffect(() => {
    if (mode === "idle") return;
    const id = setInterval(() => setElapsed(Date.now() - startRef.current), 1000);
    return () => clearInterval(id);
  }, [mode]);

  const now = () => Date.now() - startRef.current;

  const pushCard = useCallback((card: CoachCard) => {
    cardsRef.current = [card, ...cardsRef.current];
    setCards(cardsRef.current);
  }, []);

  const lastVisibleCardT = () => {
    const c = cardsRef.current.find((c) => !c.snoozed);
    return c ? c.shownT : -Infinity;
  };

  /** Deterministische Verhaltenshinweise: schnell, billig und vorsichtig formuliert. */
  const checkLocalHints = useCallback((latest: Utterance) => {
    const s = settingsRef.current;
    if (!s.enabled.behavior || latest.speaker !== "rep") return;
    const t = now();
    if (t - lastLocalHintRef.current < LOCAL_HINT_COOLDOWN_MS) return;

    const recent = talkShare(transcriptRef.current, t - 120_000);
    let card: Omit<CoachCard, "id" | "triggerT" | "shownT" | "latencyMs" | "origin"> | null = null;
    if (words(latest.text) >= 45) {
      card = {
        type: "behavior",
        title: "Lass kurz Raum für eine Antwort",
        bullets: ["Langer Redeanteil am Stück. Eine offene Frage gibt dem Kunden das Wort zurück."],
        sourceIds: [],
        missingInfo: null,
        confidence: 0.7,
      };
    } else if (recent.total >= 80 && recent.share > 0.7) {
      card = {
        type: "behavior",
        title: "Du sprichst gerade deutlich mehr",
        bullets: [`Geschätzter Redeanteil der letzten 2 Min.: ${Math.round(recent.share * 100)} %. Zuhören lohnt sich jetzt.`],
        sourceIds: [],
        missingInfo: null,
        confidence: 0.65,
      };
    }
    if (!card) return;
    lastLocalHintRef.current = t;
    pushCard({ ...card, id: uid(), triggerT: latest.t, shownT: t, latencyMs: t - latest.t, origin: "local" });
  }, [pushCard]);

  const askCoach = useCallback(async (latest: Utterance) => {
    const s = settingsRef.current;
    const seq = ++inFlightRef.current;
    setThinking(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcriptRef.current,
          knowledge: knowledgeRef.current,
          recentCards: cardsRef.current.slice(0, 5).map((c) => ({ type: c.type, title: c.title })),
          enabled: s.enabled,
          callType: s.callType,
        }),
      });
      const data = (await res.json()) as { decision?: CoachDecision | null; error?: string };
      if (modeRef.current === "idle") return;
      if (!res.ok) {
        setError(data.error ?? `Fehler ${res.status}`);
        return;
      }
      setError(null);
      const d = data.decision;
      if (!d || !d.show) return;

      const t = now();
      if (t - latest.t > STALE_AFTER_MS) return; // Moment vorbei – lieber schweigen.
      if (d.confidence < s.minConfidence) return;
      // Frequenzgrenze; zeitkritische Antworten auf Kundenfragen dürfen sie durchbrechen.
      const urgentAnswer = d.type === "answer" && d.urgency >= 0.7;
      if (!urgentAnswer && t - lastVisibleCardT() < s.minGapSec * 1000) return;

      pushCard({
        id: uid(),
        type: d.type,
        title: d.title,
        bullets: d.bullets.slice(0, 3),
        sourceIds: d.sourceIds,
        missingInfo: d.missingInfo,
        confidence: d.confidence,
        triggerT: latest.t,
        shownT: t,
        latencyMs: t - latest.t,
        origin: "ai",
      });
    } catch {
      setError("Coach nicht erreichbar.");
    } finally {
      if (seq === inFlightRef.current) setThinking(false);
    }
  }, [pushCard]);

  const addUtterance = useCallback((speaker: Speaker, text: string) => {
    const clean = text.trim();
    if (!clean || modeRef.current === "idle") return;
    const u: Utterance = { id: uid(), speaker, text: clean, t: now() };
    transcriptRef.current = [...transcriptRef.current, u];
    setTranscript(transcriptRef.current);
    checkLocalHints(u);
    void askCoach(u);
  }, [askCoach, checkLocalHints]);

  const begin = (m: SessionMode) => {
    startRef.current = Date.now();
    startedAtRef.current = new Date().toISOString();
    transcriptRef.current = [];
    cardsRef.current = [];
    lastLocalHintRef.current = -Infinity;
    setTranscript([]);
    setCards([]);
    setError(null);
    setElapsed(0);
    modeRef.current = m;
    setMode(m);
  };

  const startMic = useCallback(() => {
    const rec = getRecognition();
    if (!rec) {
      setError("Spracherkennung wird von diesem Browser nicht unterstützt. Bitte Chrome oder Edge nutzen – oder den Demo-Modus.");
      return;
    }
    begin("mic");
    rec.lang = "de-DE";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) addUtterance(speakerRef.current, r[0].transcript);
        else interimText += r[0].transcript;
      }
      setInterim(interimText);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed") setError("Mikrofonzugriff wurde verweigert.");
    };
    // Chrome beendet die Erkennung nach Pausen – solange die Sitzung läuft, neu starten.
    rec.onend = () => {
      if (modeRef.current === "mic") {
        try { rec.start(); } catch { /* läuft bereits */ }
      }
    };
    recRef.current = rec;
    rec.start();
  }, [addUtterance]);

  const startDemo = useCallback(() => {
    begin("demo");
    let at = 800;
    for (const line of DEMO_SCRIPT) {
      timersRef.current.push(setTimeout(() => addUtterance(line.speaker, line.text), at));
      at += line.pauseMs;
    }
  }, [addUtterance]);

  const stop = useCallback(() => {
    if (modeRef.current === "idle") return;
    modeRef.current = "idle";
    setMode("idle");
    setInterim("");
    setThinking(false);
    recRef.current?.stop();
    recRef.current = null;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    onFinish({
      id: uid(),
      startedAt: startedAtRef.current,
      durationMs: now(),
      callType: settingsRef.current.callType,
      cards: cardsRef.current,
      talkShareRep: talkShare(transcriptRef.current).share,
      transcript: settingsRef.current.storeTranscript ? transcriptRef.current : null,
    });
    // Transkript nur im Speicher; nach dem Call verwerfen, wenn nicht gespeichert werden soll.
    if (!settingsRef.current.storeTranscript) {
      transcriptRef.current = [];
      setTranscript([]);
    }
  }, [onFinish]);

  useEffect(() => () => {
    recRef.current?.stop();
    timersRef.current.forEach(clearTimeout);
  }, []);

  const updateCard = useCallback((id: string, patch: Partial<CoachCard>) => {
    cardsRef.current = cardsRef.current.map((c) => (c.id === id ? { ...c, ...patch } : c));
    setCards(cardsRef.current);
  }, []);

  return {
    mode, transcript, interim, cards, thinking, error, elapsed,
    speaker, setSpeaker, startMic, startDemo, stop, addUtterance, updateCard,
  };
}
