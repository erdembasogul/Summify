# Summify

[Türkçe](./README.tr.md)

A small Next.js app with two pages: a Turkish text summarizer and a weather Q&A. Both use Gemini through the Vercel AI SDK. The API key only lives on the server, the browser just calls two API routes.

## Summarizer (`/`)

Paste up to 400 characters of text, pick a style (short, medium, bullets) and a mode:

- **Text**: `streamText`, the summary streams in as it's generated.
- **JSON**: `generateText` + `Output.object` with a Zod schema (`title`, `summary`, `bullets`). The UI renders the card and the raw object.

The 400 character limit is enforced both in the UI and in the API. It's there on purpose to keep prompts small.

## Weather (`/weather`)

Ask something like "İstanbul'da hava nasıl?". Gemini gets a `getWeather` tool; it extracts the city, the tool's `execute` calls [Open-Meteo](https://open-meteo.com/) (geocoding, then current temperature) and the model turns the result into a short Turkish answer. The model never makes up the temperature itself.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Put your [Google AI Studio](https://aistudio.google.com) key into `.env.local`. Open-Meteo doesn't need a key.

## API

```bash
curl http://localhost:3000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"text":"Yapay zeka makinelerin insan benzeri işler yapmasını sağlar.","answerStyle":"short-answer","mode":"json"}'

curl http://localhost:3000/api/weather \
  -H "Content-Type: application/json" \
  -d '{"question":"İstanbul da hava nasıl?"}'
```

`answerStyle`: `short-answer`, `long-answer`, `bullet-answer`. `mode`: `text` or `json`.

## Stack

Next.js 16, React 19, TypeScript, Tailwind 4, Vercel AI SDK, Gemini 3.5 Flash, Zod, Open-Meteo.
