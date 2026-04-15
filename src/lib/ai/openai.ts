import OpenAI from 'openai'
import type { ChatMessage } from './types'

export async function callOpenAI(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<string> {
  const client = new OpenAI({ apiKey })

  const response = await client.chat.completions.create({
    model,
    messages: messages.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    })),
    max_tokens: 2000,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('OpenAI returned empty response')
  return content
}
