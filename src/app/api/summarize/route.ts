import { streamText, generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const summarySchema = z.object({
  title: z.string().describe("Metne uygun kısa başlık"),
  summary: z.string().describe("2-3 cümlelik özet"),
  bullets: z.array(z.string()).describe("3-6 ana nokta, her biri tek cümle"),
});

export async function POST(req: Request) {
  const { text, answerStyle, mode } = await req.json();

  if (!text || typeof text !== "string") {
    return Response.json(
      { error: "text alanı zorunlu (string)" },
      { status: 400 }
    );
  }

  if (text.length > 400) {
    return Response.json(
      { error: "text alanı en fazla 400 karakter olmalıdır" },
      { status: 400 }
    );
  }

  const systemPrompts: Record<string, string> = {
    "short-answer":
      "Sen bir özetleyicisin. Verilen metni Türkçe olarak en fazla 1-2 cümlede özetle. Sadece özeti yaz; giriş cümlesi, başlık veya ek açıklama ekleme.",
    "long-answer":
      "Sen bir özetleyicisin. Verilen metni Türkçe olarak orta uzunlukta, 1 kısa paragraf halinde özetle (yaklaşık 4-6 cümle). Ana fikirleri koru; gereksiz detayları çıkar. Sadece özeti yaz; giriş cümlesi veya başlık ekleme.",
    "bullet-answer":
      "Sen bir özetleyicisin. Verilen metni Türkçe olarak madde madde özetle. Her madde tek satır olsun ve '- ' ile başlasın. 4-7 madde yaz. Sadece listeyi yaz; giriş cümlesi veya kapanış ekleme.",
  };

  const system =
    systemPrompts[answerStyle] ?? systemPrompts["short-answer"];

  if (mode === "json") {
    const { output } = await generateText({
      model: google("gemini-3.5-flash"),
      system: "Sen bir özetleyicisin. Verilen metni Türkçe olarak yapılandırılmış özetle.",
      prompt: text,
      output: Output.object({
        schema: summarySchema,
      }),
    });
    return Response.json(output);
  } else {
    const result = streamText({
      model: google("gemini-3.5-flash"),
      system,
      prompt: text,
    });

    return result.toTextStreamResponse();
  }

}