"use client";

import { useCallback, useEffect, useState } from "react";
import { KnowledgeView } from "@/components/KnowledgeView";
import { LiveView } from "@/components/LiveView";
import { ReportsView } from "@/components/ReportsView";
import { SettingsView } from "@/components/SettingsView";
import { DEFAULT_KNOWLEDGE, DEFAULT_SETTINGS } from "@/lib/defaults";
import { clearAll, load, save } from "@/lib/storage";
import type { CoachSettings, KnowledgeItem, SessionReport } from "@/lib/types";
import { useCoachSession } from "@/lib/useCoachSession";

type Tab = "live" | "knowledge" | "settings" | "reports";
const TABS: { id: Tab; label: string }[] = [
  { id: "live", label: "Live" },
  { id: "knowledge", label: "Wissen" },
  { id: "settings", label: "Einstellungen" },
  { id: "reports", label: "Nachberichte" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("live");
  // Nur im Browser gerendert (siehe page.tsx), daher direkt aus localStorage initialisieren.
  const [settings, setSettings] = useState<CoachSettings>(() => ({ ...DEFAULT_SETTINGS, ...load("settings", DEFAULT_SETTINGS) }));
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>(() => load("knowledge", DEFAULT_KNOWLEDGE));
  const [reports, setReports] = useState<SessionReport[]>(() => load("reports", []));

  useEffect(() => save("settings", settings), [settings]);
  useEffect(() => save("knowledge", knowledge), [knowledge]);
  useEffect(() => save("reports", reports), [reports]);

  const onFinish = useCallback((r: SessionReport) => {
    setReports((prev) => [r, ...prev]);
    setTab("reports");
  }, []);

  const session = useCoachSession(settings, knowledge, onFinish);
  const live = session.mode !== "idle";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-semibold tracking-tight">Dealcoach</span>
            {live && <span className="h-2 w-2 animate-pulse rounded-full bg-live" title="Sitzung läuft" />}
          </div>
          <nav className="flex gap-1 text-sm">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-md px-3 py-1.5 ${tab === t.id ? "bg-background font-medium" : "text-muted hover:text-ink"}`}
              >
                {t.label}
                {t.id === "reports" && reports.length > 0 && <span className="ml-1 text-xs text-muted">{reports.length}</span>}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">
        {/* LiveView bleibt gemountet, damit eine laufende Sitzung beim Tab-Wechsel weiterläuft. */}
        <div className={tab === "live" ? "flex flex-1 flex-col" : "hidden"}>
          <LiveView session={session} knowledge={knowledge} />
        </div>
        {tab === "knowledge" && <KnowledgeView items={knowledge} onChange={setKnowledge} />}
        {tab === "settings" && (
          <SettingsView
            settings={settings}
            onChange={setSettings}
            onDeleteAll={() => {
              clearAll();
              setReports([]);
              setKnowledge(DEFAULT_KNOWLEDGE);
              setSettings(DEFAULT_SETTINGS);
            }}
          />
        )}
        {tab === "reports" && (
          <ReportsView reports={reports} knowledge={knowledge} onDelete={(id) => setReports((p) => p.filter((r) => r.id !== id))} />
        )}
      </main>
    </div>
  );
}
