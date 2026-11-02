"use client";

import type { CallType, CardType, CoachSettings } from "@/lib/types";
import { TYPE_META } from "./CoachCardView";

const CALL_TYPES: { id: CallType; label: string }[] = [
  { id: "discovery", label: "Discovery" },
  { id: "demo", label: "Produktdemo" },
  { id: "objection", label: "Einwandbehandlung" },
];

export function SettingsView({
  settings,
  onChange,
  onDeleteAll,
}: {
  settings: CoachSettings;
  onChange: (s: CoachSettings) => void;
  onDeleteAll: () => void;
}) {
  const set = (patch: Partial<CoachSettings>) => onChange({ ...settings, ...patch });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <Section title="Gesprächstyp">
        <div className="flex flex-wrap gap-2">
          {CALL_TYPES.map((c) => (
            <button
              key={c.id}
              onClick={() => set({ callType: c.id })}
              className={`rounded-md px-3 py-1.5 text-sm ${settings.callType === c.id ? "bg-ink text-background" : "border border-line"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Impulsarten">
        {(Object.keys(TYPE_META) as CardType[]).map((t) => (
          <label key={t} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.enabled[t]}
              onChange={(e) => set({ enabled: { ...settings.enabled, [t]: e.target.checked } })}
            />
            <span className={TYPE_META[t].color}>{TYPE_META[t].label}</span>
          </label>
        ))}
      </Section>

      <Section title="Häufigkeit und Empfindlichkeit">
        <Slider
          label="Mindestabstand zwischen Impulsen"
          value={settings.minGapSec}
          min={0}
          max={90}
          step={5}
          format={(v) => `${v} s`}
          onChange={(v) => set({ minGapSec: v })}
          hint="Dringende Antworten auf Kundenfragen dürfen den Abstand unterschreiten."
        />
        <Slider
          label="Mindest-Sicherheit"
          value={settings.minConfidence}
          min={0.3}
          max={0.9}
          step={0.05}
          format={(v) => `${Math.round(v * 100)} %`}
          onChange={(v) => set({ minConfidence: v })}
          hint="Höher = weniger, dafür sicherere Impulse."
        />
      </Section>

      <Section title="Datenschutz">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={settings.storeTranscript}
            onChange={(e) => set({ storeTranscript: e.target.checked })}
          />
          <span>
            Transkript nach dem Call im Nachbericht speichern
            <span className="block text-xs text-muted">
              Standard: aus. Dann wird das Gespräch nur live verarbeitet; gespeichert werden nur die gezeigten Impulse und Bewertungen.
            </span>
          </span>
        </label>
        <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed text-muted">
          <li>Audio wird nie gespeichert. Die Spracherkennung läuft über den Browser (Chrome: Google-Server).</li>
          <li>Für jeden Impuls werden die letzten Äußerungen und die Wissensbasis an die Claude API gesendet.</li>
          <li>Berichte, Wissensbasis und Einstellungen liegen nur lokal in diesem Browser.</li>
        </ul>
        <button
          onClick={() => confirm("Alle lokal gespeicherten Daten (Berichte, Wissensbasis, Einstellungen) endgültig löschen?") && onDeleteAll()}
          className="rounded-md border border-live px-3 py-1.5 text-sm text-live hover:bg-live/10"
        >
          Alle Daten löschen
        </button>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-line bg-surface p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
      {children}
    </section>
  );
}

function Slider(props: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void; hint: string;
}) {
  return (
    <label className="block text-sm">
      <span className="flex justify-between">
        {props.label}
        <span className="font-mono">{props.format(props.value)}</span>
      </span>
      <input
        type="range"
        className="mt-1 w-full accent-[var(--ink)]"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
      <span className="text-xs text-muted">{props.hint}</span>
    </label>
  );
}
