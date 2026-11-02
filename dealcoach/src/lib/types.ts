export type Speaker = "rep" | "customer";

export interface Utterance {
  id: string;
  speaker: Speaker;
  text: string;
  /** ms since session start, when the utterance was finalized */
  t: number;
}

export type CardType = "answer" | "question" | "behavior";

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
}

export interface CoachCard {
  id: string;
  type: CardType;
  title: string;
  bullets: string[];
  sourceIds: string[];
  missingInfo: string | null;
  confidence: number;
  /** ms since session start: the utterance that triggered the card */
  triggerT: number;
  /** ms since session start: when the card became visible */
  shownT: number;
  latencyMs: number;
  origin: "ai" | "local";
  rating?: "up" | "down";
  snoozed?: boolean;
}

export type CallType = "discovery" | "demo" | "objection";

export interface CoachSettings {
  callType: CallType;
  enabled: Record<CardType, boolean>;
  /** minimum seconds between two cards */
  minGapSec: number;
  /** 0..1 – cards below this model confidence stay hidden */
  minConfidence: number;
  /** keep the transcript after the call (default off: process only) */
  storeTranscript: boolean;
}

/** What the model returns for one coaching decision. */
export interface CoachDecision {
  show: boolean;
  type: CardType;
  title: string;
  bullets: string[];
  sourceIds: string[];
  missingInfo: string | null;
  confidence: number;
  urgency: number;
}

export interface SessionReport {
  id: string;
  startedAt: string;
  durationMs: number;
  callType: CallType;
  cards: CoachCard[];
  talkShareRep: number;
  transcript: Utterance[] | null;
}
