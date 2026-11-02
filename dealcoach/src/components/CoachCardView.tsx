"use client";

import type { CardType, CoachCard, KnowledgeItem } from "@/lib/types";

export const TYPE_META: Record<CardType, { label: string; color: string; border: string }> = {
  answer: { label: "Antwort", color: "text-answer", border: "border-l-answer" },
  question: { label: "Nächste Frage", color: "text-question", border: "border-l-question" },
  behavior: { label: "Gesprächsverhalten", color: "text-behavior", border: "border-l-behavior" },
};

export function fmtTime(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function CoachCardView({
  card,
  knowledge,
  onUpdate,
  faded,
}: {
  card: CoachCard;
  knowledge: KnowledgeItem[];
  onUpdate?: (patch: Partial<CoachCard>) => void;
  faded?: boolean;
}) {
  const meta = TYPE_META[card.type];
  const sources = card.sourceIds
    .map((id) => knowledge.find((k) => k.id === id)?.title ?? id);

  return (
    <article
      className={`card-in rounded-lg border border-line border-l-4 ${meta.border} bg-surface p-4 shadow-sm transition-opacity ${faded ? "opacity-55" : ""}`}
    >
      <header className="mb-2 flex items-baseline justify-between gap-2 text-xs">
        <span className={`font-semibold uppercase tracking-wide ${meta.color}`}>{meta.label}</span>
        <span className="font-mono text-muted" title="Zeit vom Gesprächsmoment bis zur Anzeige">
          {fmtTime(card.triggerT)} · {(card.latencyMs / 1000).toFixed(1)} s
        </span>
      </header>
      <h3 className="mb-1.5 text-[15px] font-semibold leading-snug">{card.title}</h3>
      <ul className="space-y-1 text-sm leading-relaxed">
        {card.bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-muted">–</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      {card.missingInfo && (
        <p className="mt-2 rounded bg-question/10 px-2 py-1.5 text-xs leading-relaxed">
          <span className="font-semibold">Nicht in der Wissensbasis:</span> {card.missingInfo}
        </p>
      )}
      {sources.length > 0 && (
        <p className="mt-2 text-xs text-muted">Quelle: {sources.join(", ")}</p>
      )}
      {card.origin === "local" && (
        <p className="mt-2 text-xs text-muted">Geschätzt aus Sprecherzuordnung – kann ungenau sein.</p>
      )}
      {onUpdate && (
        <footer className="mt-3 flex items-center gap-1 text-xs">
          <RateButton active={card.rating === "up"} onClick={() => onUpdate({ rating: card.rating === "up" ? undefined : "up" })}>
            Hilfreich
          </RateButton>
          <RateButton active={card.rating === "down"} onClick={() => onUpdate({ rating: card.rating === "down" ? undefined : "down" })}>
            Nicht hilfreich
          </RateButton>
          <button
            className="ml-auto rounded px-2 py-1 text-muted hover:bg-line/60"
            onClick={() => onUpdate({ snoozed: !card.snoozed })}
          >
            {card.snoozed ? "Zurückholen" : "Später"}
          </button>
        </footer>
      )}
    </article>
  );
}

function RateButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded border px-2 py-1 ${active ? "border-ink bg-ink text-background" : "border-line hover:bg-line/60"}`}
    >
      {children}
    </button>
  );
}
