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

function supportsJsonObjectMode(model: string): boolean {
  // gpt-oss su Groq supporta spesso response_format; i llama storici a volte no
  return model.includes("gpt-oss") || model.includes("qwen") || model.startsWith("openai/");
}

async function chatGroq(messages: ChatMessage[]): Promise<ProviderChatResult> {
  const configured = process.env.GROQ_MODEL?.trim();
  const candidates = [
    configured,
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "meta-llama/llama-4-scout-17b-16e-instruct",
  ].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

  let lastError = "Groq: nessun modello disponibile";
  for (const model of candidates) {
    const body: Record<string, unknown> = {
      model,
      messages,
      temperature: 0.2,
    };
    if (supportsJsonObjectMode(model)) {
      body.response_format = { type: "json_object" };
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 240);
      lastError = `Groq error ${res.status} (${model}): ${detail}`;
      if (res.status === 404 || res.status === 403) continue;
      // Se json_object non è supportato, riprova senza
      if (res.status === 400 && body.response_format) {
        const retry = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ model, messages, temperature: 0.2 }),
        });
        if (!retry.ok) {
          lastError = `Groq error ${retry.status} (${model}): ${(await retry.text()).slice(0, 240)}`;
          continue;
        }
        const payload = (await retry.json()) as { choices?: Array<{ message?: { content?: string } }> };
        return {
          mode: "groq",
          label: `Groq · ${model}`,
          content: payload.choices?.[0]?.message?.content ?? "{}",
        };
      }
      throw new Error(lastError);
    }
    const payload = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return {
      mode: "groq",
      label: `Groq · ${model}`,
      content: payload.choices?.[0]?.message?.content ?? "{}",
    };
  }
  throw new Error(lastError);
}

export async function chatWithAvailableProvider(
  messages: ChatMessage[],
): Promise<ProviderChatResult | null> {
  if (hasGroq()) return chatGroq(messages);

  if (hasGemini()) {
    const key = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
    const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
    const system = messages.find((m) => m.role === "system")?.content ?? "";
    const user = messages.filter((m) => m.role !== "system").map((m) => `${m.role}: ${m.content}`).join("\n\n");
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
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
        temperature: 0.2,
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
