"use client";

import { useEffect, useRef, useState } from "react";
import { talkShare, type useCoachSession } from "@/lib/useCoachSession";
import type { KnowledgeItem } from "@/lib/types";
import { CoachCardView, fmtTime } from "./CoachCardView";

type Session = ReturnType<typeof useCoachSession>;

export function LiveView({ session, knowledge }: { session: Session; knowledge: KnowledgeItem[] }) {
  const { mode, transcript, interim, cards, thinking, error, elapsed, speaker, setSpeaker } = session;
  const [consent, setConsent] = useState(false);
  const [manual, setManual] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const live = mode !== "idle";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript.length, interim]);

  // Leertaste wechselt im Mikrofon-Modus den Sprecher (außer beim Tippen).
  useEffect(() => {
    if (mode !== "mic") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || (e.target as HTMLElement).closest("input,textarea")) return;
      e.preventDefault();
      setSpeaker(speaker === "rep" ? "customer" : "rep");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, speaker, setSpeaker]);

  const visible = cards.filter((c) => !c.snoozed);
  const snoozed = cards.filter((c) => c.snoozed);
  const share = talkShare(transcript);
  const aiCards = cards.filter((c) => c.origin === "ai");
  const avgLatency = aiCards.length ? aiCards.reduce((s, c) => s + c.latencyMs, 0) / aiCards.length : null;

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* Gesprächsseite */}
      <section className="flex min-h-[60vh] flex-col rounded-xl border border-line bg-surface">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          {!live ? (
            <>
              <button
                disabled={!consent}
                onClick={session.startMic}
                className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-background disabled:opacity-40"
              >
                Live-Coaching starten
              </button>
              <button onClick={session.startDemo} className="rounded-md border border-line px-4 py-2 text-sm hover:bg-line/50">
                Übungsgespräch abspielen
              </button>
              <label className="flex basis-full items-start gap-2 text-xs leading-relaxed text-muted">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
                Ich habe alle Gesprächsteilnehmenden informiert, dass ein KI-Coach mithört. Audio wird über die
                Spracherkennung des Browsers verarbeitet (bei Chrome über Google-Server).
              </label>
            </>
          ) : (
            <>
              <span className="flex items-center gap-2 rounded-full bg-live/10 px-3 py-1 text-sm font-medium text-live">
                <span className="h-2 w-2 animate-pulse rounded-full bg-live" />
                {mode === "mic" ? "Live · Mikrofon aktiv" : "Übungsgespräch läuft"}
              </span>
              <span className="font-mono text-sm text-muted">{fmtTime(elapsed)}</span>
              <button onClick={session.stop} className="ml-auto rounded-md border border-live px-4 py-2 text-sm text-live hover:bg-live/10">
                Beenden
              </button>
            </>
          )}
        </div>

        {mode === "mic" && (
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2 text-sm">
            <span className="text-muted">Es spricht:</span>
            {(["rep", "customer"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeaker(s)}
                className={`rounded-md px-3 py-1 ${speaker === s ? "bg-ink text-background" : "border border-line"}`}
              >
                {s === "rep" ? "Ich" : "Kunde"}
              </button>
            ))}
            <span className="text-xs text-muted">Leertaste wechselt</span>
          </div>
        )}

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {transcript.length === 0 && !interim && (
            <p className="mx-auto mt-16 max-w-sm text-center text-sm text-muted">
              {live
                ? "Warte auf das Gespräch …"
                : "Starte eine Sitzung. Das Transkript erscheint hier, die Impulse rechts. Ohne Mikrofon kannst du mit dem Übungsgespräch testen."}
            </p>
          )}
          {transcript.map((u) => (
            <div key={u.id} className={`flex gap-3 text-sm ${u.speaker === "rep" ? "" : "flex-row-reverse text-right"}`}>
              <span className="mt-0.5 w-12 shrink-0 font-mono text-xs text-muted">{fmtTime(u.t)}</span>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 ${u.speaker === "rep" ? "bg-background" : "bg-answer/10"}`}>
                <div className="mb-0.5 text-xs font-medium text-muted">{u.speaker === "rep" ? "Ich" : "Kunde"}</div>
                {u.text}
              </div>
            </div>
          ))}
          {interim && <p className="pl-15 text-sm italic text-muted">{interim}</p>}
        </div>

        {live && (
          <form
            className="flex gap-2 border-t border-line p-3"
            onSubmit={(e) => {
              e.preventDefault();
              session.addUtterance("customer", manual);
              setManual("");
            }}
          >
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="Kundenäußerung manuell eintippen (z. B. bei Telefon-Calls)"
              className="flex-1 rounded-md border border-line bg-background px-3 py-2 text-sm outline-none focus:border-ink"
            />
            <button className="rounded-md border border-line px-3 text-sm hover:bg-line/50">Senden</button>
          </form>
        )}
      </section>

      {/* Coach-Seitenleiste */}
      <aside className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Mein Redeanteil" value={share.total ? `${Math.round(share.share * 100)} %` : "–"} />
          <Stat label="Ø Latenz" value={avgLatency !== null ? `${(avgLatency / 1000).toFixed(1)} s` : "–"} />
          <Stat label="Impulse" value={String(visible.length)} />
        </div>

        <div className="flex items-center justify-between text-xs text-muted">
          <span className="font-semibold uppercase tracking-wide">Coach</span>
          {thinking && <span className="animate-pulse">hört zu …</span>}
        </div>

        {error && <p className="rounded-md border border-live/40 bg-live/5 p-3 text-sm text-live">{error}</p>}

        {visible.length === 0 && (
          <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-muted">
            Der Coach meldet sich nur, wenn ein Impuls wirklich hilft.
          </p>
        )}

        <div className="space-y-3">
          {visible.slice(0, 3).map((c, i) => (
            <CoachCardView key={c.id} card={c} knowledge={knowledge} faded={i > 0} onUpdate={(p) => session.updateCard(c.id, p)} />
          ))}
        </div>

        {(visible.length > 3 || snoozed.length > 0) && (
          <details className="text-sm">
            <summary className="cursor-pointer text-muted">
              Ältere ({Math.max(0, visible.length - 3)}) · Zurückgestellt ({snoozed.length})
            </summary>
            <div className="mt-3 space-y-3">
              {[...snoozed, ...visible.slice(3)].map((c) => (
                <CoachCardView key={c.id} card={c} knowledge={knowledge} faded onUpdate={(p) => session.updateCard(c.id, p)} />
              ))}
            </div>
          </details>
        )}
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-2 py-2">
      <div className="font-mono text-lg font-semibold">{value}</div>
      <div className="text-[11px] text-muted">{label}</div>
    </div>
  );
}
