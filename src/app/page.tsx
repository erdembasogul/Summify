"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [structured, setStructured] = useState<{
    title: string;
    summary: string;
    bullets: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answerStyle, setAnswerStyle] = useState("short-answer");
  const [answerMode, setAnswerMode] = useState("text");

  async function handleSummarize() {
    setSummary("");
    setStructured(null);
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, answerStyle, mode: answerMode }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error || "Bir hata oluştu");
        return;
      }

      if (answerMode === "json") {
        const data = await res.json();
        setStructured(data);
        return;
      }

      if (!res.body) {
        throw new Error("Stream body yok");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setSummary((prev) => prev + chunk);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Summify</h1>
        <p className="mt-2 text-zinc-600">
          Metni yapıştır, özeti canlı izle.
        </p>
      </div>

      <textarea
        className="min-h-40 w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm outline-none focus:border-zinc-500"
        placeholder="Özetlemek istediğin metni buraya yapıştır..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200">
            <div
              className={`h-full rounded-full transition-all ${text.length > 400
                ? "bg-red-500"
                : text.length > 320
                  ? "bg-amber-500"
                  : "bg-zinc-900"
                }`}
              style={{
                width: `${Math.min((text.length / 400) * 100, 100)}%`,
              }}
            />
          </div>
          <span
            className={`shrink-0 text-xs tabular-nums ${text.length > 400 ? "font-medium text-red-600" : "text-zinc-500"
              }`}
          >
            {text.length} / 400
          </span>
        </div>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-zinc-700">Özet stili</span>
        <select
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-500"
          value={answerStyle}
          onChange={(e) => setAnswerStyle(e.target.value)}
          disabled={loading}
        >
          <option value="short-answer">Kısa</option>
          <option value="long-answer">Orta / uzun</option>
          <option value="bullet-answer">Madde madde</option>
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-zinc-700">Özet Modu</span>
        <select
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-500"
          value={answerMode}
          onChange={(e) => setAnswerMode(e.target.value)}
          disabled={loading}
        >
          <option value="text">Text</option>
          <option value="json">JSON</option>
        </select>
      </label>

      <button
        type="button"
        onClick={handleSummarize}
        disabled={loading || text.trim().length === 0}
        suppressHydrationWarning
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Özetleniyor..." : "Özetle"}
      </button>

      {answerMode === "text" && (summary || loading) && (
        <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <h2 className="mb-2 text-sm font-medium text-zinc-500">Özet</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-900">
            {summary}
            {loading && <span className="animate-pulse">▍</span>}
          </p>
        </section>
      )}

      {answerMode === "json" && structured && (
        <section className="flex flex-col gap-4">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <h2 className="text-lg font-semibold text-zinc-900">
              {structured.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-800">
              {structured.summary}
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-800">
              {structured.bullets.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <pre className="overflow-x-auto rounded-lg border border-zinc-200 bg-white p-4 text-xs leading-relaxed text-zinc-700">
            {JSON.stringify(structured, null, 2)}
          </pre>
        </section>
      )}

      {error && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setError("")}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-zinc-900">Hata</h2>
            <p className="mt-2 text-sm text-zinc-700">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </main>
  );
}