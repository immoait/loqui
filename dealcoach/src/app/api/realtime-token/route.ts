const TRANSCRIBE_MODEL = process.env.TRANSCRIBE_MODEL ?? "gpt-4o-transcribe";

/**
 * Gibt der Mac-App ein kurzlebiges Token für die OpenAI Realtime-Transkription.
 * Der eigentliche API-Key verlässt das Backend nie.
 */
export async function POST() {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "Kein OPENAI_API_KEY gesetzt – siehe .env.example." }, { status: 500 });
  }

  const res = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      expires_after: { anchor: "created_at", seconds: 600 },
      session: {
        type: "transcription",
        audio: {
          input: {
            format: { type: "audio/pcm", rate: 24000 },
            // Bewusst ohne `prompt`: Bei Beinahe-Stille gibt das Modell sonst den Prompt als
            // angebliches Gesagtes zurück (im Test: Begriffsliste aus der Wissensbasis).
            transcription: { model: TRANSCRIBE_MODEL, language: "de" },
            noise_reduction: { type: "near_field" },
            turn_detection: { type: "server_vad", threshold: 0.6, silence_duration_ms: 500, prefix_padding_ms: 300 },
          },
        },
      },
    }),
  });
  const data = (await res.json()) as { value?: string; expires_at?: number; error?: { message: string } };
  if (!res.ok || !data.value) {
    return Response.json({ error: data.error?.message ?? `Token-Fehler ${res.status}` }, { status: 502 });
  }
  return Response.json({ value: data.value, expiresAt: data.expires_at });
}
