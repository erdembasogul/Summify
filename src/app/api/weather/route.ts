import { generateText, tool, isStepCount } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export async function POST(req: Request) {
  const { question } = await req.json();

  if (!question || typeof question !== "string") {
    return Response.json(
      { error: "question alanı zorunlu (string)" },
      { status: 400 }
    );
  }

  const { text } = await generateText({
    model: google("gemini-3.5-flash"),
    prompt: question,
    tools: {
      getWeather: tool({
        description:
          "Get the current temperature for a city. Use when the user asks about weather or degrees.",
        inputSchema: z.object({
          location: z.string().describe("City name, e.g. Istanbul"),
        }),
        execute: async ({ location }) => {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=tr`
          );
          const geo = await geoRes.json();
          const place = geo.results?.[0];
          if (!place) {
            return { error: "City not found", location };
          }
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m&timezone=auto`
          );
          const weather = await weatherRes.json();
          return {
            location: place.name,
            country: place.country,
            temperatureC: weather.current.temperature_2m,
          };
        },
      }),
    },
    stopWhen: isStepCount(5),
    system:
      "You are a weather assistant. Be brief. Always use the getWeather tool for temperatures; do not invent numbers. Reply in Turkish.",
  });
  return Response.json({ answer: text });
}