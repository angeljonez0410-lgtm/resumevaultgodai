import OpenAI from "openai";

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function invokeLLM(prompt: string, options?: { jsonSchema?: Record<string, unknown> }) {
  const openai = getOpenAI();

  if (options?.jsonSchema) {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4096,
    });
    const text = res.choices[0]?.message?.content || "{}";
    return JSON.parse(text);
  }

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 4096,
  });
  return res.choices[0]?.message?.content || "";
}

export async function invokeLLMPremium(prompt: string) {
  const openai = getOpenAI();

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 8192,
  });
  return res.choices[0]?.message?.content || "";
}
