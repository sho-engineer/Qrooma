export type Side = 'a' | 'b' | 'c' | 'judge'
export type Provider = 'openai' | 'anthropic' | 'google'

export interface SideConfig {
  side: 'a' | 'b' | 'c'
  provider: Provider
  model: string
  apiKey: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ConclusionCard {
  conclusion: string
  rationale: string
  risks: string[]
  disagreements: string[]
  unknowns: string[]
  next_actions: string[]
}

export const MODELS_BY_PROVIDER: Record<Provider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o1-mini'],
  anthropic: ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-4-5-20251001'],
  google: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'],
}

export const DEFAULT_MODELS: Record<Provider, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-opus-4-5',
  google: 'gemini-1.5-pro',
}
