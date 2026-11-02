"use client";

import type { CardType, KnowledgeItem, SessionReport } from "@/lib/types";
import { CoachCardView, fmtTime, TYPE_META } from "./CoachCardView";

const CALL_LABEL = { discovery: "Discovery", demo: "Produktdemo", objection: "Einwandbehandlung" };

function median(xs: number[]) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

export function ReportsView({
  reports,
  knowledge,
  onDelete,
}: {
  reports: SessionReport[];
  knowledge: KnowledgeItem[];
  onDelete: (id: string) => void;
}) {
  if (reports.length === 0) {
    return <p className="mt-16 text-center text-sm text-muted">Noch keine Sitzungen. Nach dem Beenden eines Calls erscheint hier der Nachbericht.</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {reports.map((r) => {
        const rated = r.cards.filter((c) => c.rating);
        const helpful = r.cards.filter((c) => c.rating === "up").length;
        const ai = r.cards.filter((c) => c.origin === "ai");
        const med = median(ai.map((c) => c.latencyMs));
        const perMin = r.durationMs > 0 ? r.cards.length / (r.durationMs / 60000) : 0;
        const byType = (Object.keys(TYPE_META) as CardType[]).map((t) => [t, r.cards.filter((c) => c.type === t).length] as const);

        return (
          <section key={r.id} className="space-y-4 rounded-xl border border-line bg-surface p-5">
            <header className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="font-semibold">
                  {CALL_LABEL[r.callType]} · {new Date(r.startedAt).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })}
                </h2>
                <p className="text-sm text-muted">Dauer {fmtTime(r.durationMs)}</p>
              </div>
              <button onClick={() => onDelete(r.id)} className="text-xs text-muted hover:text-live">Bericht löschen</button>
            </header>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi label="Impulse" value={`${r.cards.length}`} sub={`${perMin.toFixed(1)} pro Min.`} />
              <Kpi label="Hilfreich" value={rated.length ? `${Math.round((helpful / rated.length) * 100)} %` : "–"} sub={`${rated.length} bewertet`} />
              <Kpi label="Median-Latenz" value={med !== null ? `${(med / 1000).toFixed(1)} s` : "–"} sub="Moment → Karte" />
              <Kpi label="Mein Redeanteil" value={`${Math.round(r.talkShareRep * 100)} %`} sub="geschätzt" />
            </div>

            <p className="text-xs text-muted">
              {byType.map(([t, n]) => `${TYPE_META[t].label}: ${n}`).join(" · ")}
            </p>

            <div className="space-y-3">
              {[...r.cards].reverse().map((c) => (
                <CoachCardView key={c.id} card={c} knowledge={knowledge} />
              ))}
            </div>

            {r.transcript && (
              <details className="text-sm">
                <summary className="cursor-pointer text-muted">Transkript ({r.transcript.length} Äußerungen)</summary>
                <div className="mt-2 space-y-1">
                  {r.transcript.map((u) => (
                    <p key={u.id}>
                      <span className="font-mono text-xs text-muted">{fmtTime(u.t)}</span>{" "}
                      <span className="font-medium">{u.speaker === "rep" ? "Ich" : "Kunde"}:</span> {u.text}
                    </p>
                  ))}
                </div>
              </details>
            )}
          </section>
        );
      })}
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-line px-3 py-2">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="font-mono text-lg font-semibold">{value}</div>
      <div className="text-[11px] text-muted">{sub}</div>
    </div>
  );
}
