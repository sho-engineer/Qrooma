import { callOpenAI } from './openai'
import { callAnthropic } from './anthropic'
import { callGoogle } from './google'
import type { Provider, ChatMessage, SideConfig } from './types'

export async function callProvider(
  provider: Provider,
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<string> {
  switch (provider) {
    case 'openai':
      return callOpenAI(apiKey, model, messages)
    case 'anthropic':
      return callAnthropic(apiKey, model, messages)
    case 'google':
      return callGoogle(apiKey, model, messages)
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

export async function callSide(
  config: SideConfig,
  messages: ChatMessage[]
): Promise<string> {
  return callProvider(config.provider, config.apiKey, config.model, messages)
}

export * from './types'
