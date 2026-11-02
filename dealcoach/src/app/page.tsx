"use client";

import dynamic from "next/dynamic";

// Die App lebt vollständig im Browser (Mikrofon, lokale Speicherung) – kein SSR.
const App = dynamic(() => import("@/components/App"), { ssr: false });

export default function Page() {
  return <App />;
}
