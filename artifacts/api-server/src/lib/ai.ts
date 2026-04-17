/**
 * AI Provider abstraction
 * Supports OpenAI, Anthropic, and Google Gemini
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type Provider = "openai" | "anthropic" | "google";

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CallAIParams {
  provider: Provider;
  model: string;
  systemPrompt: string;
  messages: AIMessage[];
  apiKey: string;
}

export async function callAI({ provider, model, systemPrompt, messages, apiKey }: CallAIParams): Promise<string> {
  if (provider === "openai") {
    const client = new OpenAI({ apiKey });
    const res = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 400,
      temperature: 0.7,
    });
    return res.choices[0]?.message?.content?.trim() ?? "";
  }

  if (provider === "anthropic") {
    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
      model,
      max_tokens: 400,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });
    const block = res.content[0];
    return block?.type === "text" ? block.text.trim() : "";
  }

  if (provider === "google") {
    const genAI = new GoogleGenerativeAI(apiKey);
    const gemini = genAI.getGenerativeModel({
      model,
      systemInstruction: systemPrompt,
    });
    // Build chat history (all but last message)
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));
    const chat = gemini.startChat({ history });
    const lastMsg = messages[messages.length - 1];
    const res = await chat.sendMessage(lastMsg?.content ?? "");
    return res.response.text().trim();
  }

  throw new Error(`Unknown provider: ${provider}`);
}
