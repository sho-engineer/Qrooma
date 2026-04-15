import Anthropic from '@anthropic-ai/sdk'
import type { ChatMessage } from './types'

export async function callAnthropic(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<string> {
  const client = new Anthropic({ apiKey })

  // Anthropic separates system from messages
  const systemMessages = messages.filter((m) => m.role === 'system')
  const chatMessages = messages.filter((m) => m.role !== 'system')

  const system = systemMessages.map((m) => m.content).join('\n') || undefined

  const response = await client.messages.create({
    model,
    max_tokens: 2000,
    system,
    messages: chatMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  })

  const content = response.content[0]
  if (!content || content.type !== 'text') throw new Error('Anthropic returned empty response')
  return content.text
}
