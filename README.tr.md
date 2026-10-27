# Summify

[English](./README.md)

İki sayfalık küçük bir Next.js uygulaması: Türkçe metin özetleyici ve hava durumu soru-cevap. İkisi de Vercel AI SDK üzerinden Gemini kullanıyor. API key sadece sunucuda duruyor, tarayıcı sadece iki API route'una istek atıyor.

## Özet (`/`)

En fazla 400 karakterlik metni yapıştır, stil (kısa, orta, madde madde) ve mod seç:

- **Text**: `streamText`, özet üretildikçe ekrana akıyor.
- **JSON**: `generateText` + `Output.object` ve Zod şeması (`title`, `summary`, `bullets`). Arayüz hem kartı hem ham JSON'u gösteriyor.

400 karakter sınırı hem arayüzde hem API'de var. Prompt'ları küçük tutmak için bilerek konuldu.

## Hava (`/weather`)

"İstanbul'da hava nasıl?" gibi bir şey sor. Gemini'ye `getWeather` tool'u veriliyor; model şehri çıkarıyor, tool'un `execute` fonksiyonu [Open-Meteo](https://open-meteo.com/)'ya istek atıyor (önce koordinat, sonra anlık sıcaklık) ve model sonucu kısa bir Türkçe cümleye çeviriyor. Sıcaklığı model uydurmuyor.

## Kurulum

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` içine [Google AI Studio](https://aistudio.google.com) key'ini yaz. Open-Meteo key istemiyor.

## API

```bash
curl http://localhost:3000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"text":"Yapay zeka makinelerin insan benzeri işler yapmasını sağlar.","answerStyle":"short-answer","mode":"json"}'

curl http://localhost:3000/api/weather \
  -H "Content-Type: application/json" \
  -d '{"question":"İstanbul da hava nasıl?"}'
```

`answerStyle`: `short-answer`, `long-answer`, `bullet-answer`. `mode`: `text` veya `json`.

## Stack

Next.js 16, React 19, TypeScript, Tailwind 4, Vercel AI SDK, Gemini 3.5 Flash, Zod, Open-Meteo.
