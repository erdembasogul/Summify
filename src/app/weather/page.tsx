"use client";

import { useState } from "react";

export default function WeatherPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk() {
    setAnswer("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error || "Bir hata oluştu");
        return;
      }

      const data = (await res.json()) as { answer?: string };
      setAnswer(data.answer || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Hava</h1>
        <p className="mt-2 text-zinc-600">
          Şehir sor, güncel sıcaklığı öğren. Veri: Open-Meteo.
        </p>
      </div>

      <textarea
        className="min-h-24 w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm outline-none focus:border-zinc-500"
        placeholder="Örn. İstanbul'da hava nasıl?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button
        type="button"
        onClick={handleAsk}
        disabled={loading || question.trim().length === 0}
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Soruluyor..." : "Sor"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {answer && (
        <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-sm leading-relaxed text-zinc-900">{answer}</p>
        </section>
      )}
    </main>
  );
}