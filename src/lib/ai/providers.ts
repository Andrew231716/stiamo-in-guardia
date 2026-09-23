import type { AiCoachMode } from "@/lib/ai/types";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ProviderChatResult {
  mode: Exclude<AiCoachMode, "local">;
  content: string;
  label: string;
}

function hasGroq(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}
function hasGemini(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim());
}
function hasOpenAI(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function listAvailableAiProviders(): Array<{ id: AiCoachMode; label: string }> {
  const list: Array<{ id: AiCoachMode; label: string }> = [{ id: "local", label: "Analisi locale (sempre disponibile)" }];
  if (hasGroq()) list.push({ id: "groq", label: "Groq (gratuito con API key)" });
  if (hasGemini()) list.push({ id: "gemini", label: "Google Gemini (piano gratuito)" });
  if (hasOpenAI()) list.push({ id: "openai", label: "OpenAI" });
  return list;
}

export function hasCloudAiProvider(): boolean {
  return hasGroq() || hasGemini() || hasOpenAI();
}

export async function chatWithAvailableProvider(
  messages: ChatMessage[],
): Promise<ProviderChatResult | null> {
  if (hasGroq()) {
    const model = process.env.GROQ_MODEL?.trim() || "llama-3.1-8b-instant";
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) throw new Error(`Groq error ${res.status}`);
    const payload = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return {
      mode: "groq",
      label: `Groq · ${model}`,
      content: payload.choices?.[0]?.message?.content ?? "{}",
    };
  }

  if (hasGemini()) {
    const key = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
    const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
    const system = messages.find((m) => m.role === "system")?.content ?? "";
    const user = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n\n");
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
        }),
      },
    );
    if (!res.ok) throw new Error(`Gemini error ${res.status}`);
    const payload = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const content = payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "{}";
    return { mode: "gemini", label: `Gemini · ${model}`, content };
  }

  if (hasOpenAI()) {
    const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
    const payload = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return {
      mode: "openai",
      label: `OpenAI · ${model}`,
      content: payload.choices?.[0]?.message?.content ?? "{}",
    };
  }

  return null;
}
