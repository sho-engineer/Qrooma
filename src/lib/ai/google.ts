import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ChatMessage } from './types'

export async function callGoogle(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const geminiModel = genAI.getGenerativeModel({ model })

  // Separate system prompt
  const systemMessages = messages.filter((m) => m.role === 'system')
  const chatMessages = messages.filter((m) => m.role !== 'system')

  const systemInstruction = systemMessages.map((m) => m.content).join('\n') || undefined

  const modelWithSystem = systemInstruction
    ? genAI.getGenerativeModel({ model, systemInstruction })
    : geminiModel

  // Build Gemini history (all but last message)
  const history = chatMessages.slice(0, -1).map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))

  const lastMessage = chatMessages[chatMessages.length - 1]
  if (!lastMessage) throw new Error('No messages provided')

  const chat = modelWithSystem.startChat({ history })
  const result = await chat.sendMessage(lastMessage.content)
  const text = result.response.text()
  if (!text) throw new Error('Google returned empty response')
  return text
}
