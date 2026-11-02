"use client";

import { DEFAULT_KNOWLEDGE } from "@/lib/defaults";
import type { KnowledgeItem } from "@/lib/types";

export function KnowledgeView({ items, onChange }: { items: KnowledgeItem[]; onChange: (items: KnowledgeItem[]) => void }) {
  const update = (id: string, patch: Partial<KnowledgeItem>) =>
    onChange(items.map((k) => (k.id === id ? { ...k, ...patch } : k)));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Wissensbasis</h2>
          <p className="text-sm text-muted">
            Freigegebenes Produkt- und Unternehmenswissen. Antwortvorschläge stützen sich nur hierauf und nennen den Eintrag als Quelle.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => confirm("Wissensbasis auf das Beispiel zurücksetzen?") && onChange(DEFAULT_KNOWLEDGE)}
            className="rounded-md border border-line px-3 py-1.5 hover:bg-line/50"
          >
            Beispiel laden
          </button>
          <button
            onClick={() => onChange([...items, { id: `kb-${Date.now().toString(36)}`, title: "Neuer Eintrag", content: "" }])}
            className="rounded-md bg-ink px-3 py-1.5 text-background"
          >
            Eintrag hinzufügen
          </button>
        </div>
      </div>

      {items.map((k) => (
        <div key={k.id} className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-2 flex items-center gap-2">
            <input
              value={k.title}
              onChange={(e) => update(k.id, { title: e.target.value })}
              className="flex-1 rounded bg-transparent text-[15px] font-semibold outline-none focus:bg-background"
            />
            <span className="font-mono text-xs text-muted">{k.id}</span>
            <button onClick={() => onChange(items.filter((x) => x.id !== k.id))} className="text-xs text-muted hover:text-live">
              Entfernen
            </button>
          </div>
          <textarea
            value={k.content}
            onChange={(e) => update(k.id, { content: e.target.value })}
            rows={3}
            placeholder="Fakten, Preise, freigegebene Formulierungen, Belege …"
            className="w-full resize-y rounded-md border border-line bg-background p-2 text-sm leading-relaxed outline-none focus:border-ink"
          />
        </div>
      ))}
    </div>
  );
}
