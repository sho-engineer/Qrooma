/**
 * Verify Opus 4.8 API access.
 * Usage: ANTHROPIC_API_KEY=sk-ant-... node scripts/test-opus.mjs
 */
import Anthropic from '@anthropic-ai/sdk'

const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) {
  console.error('Set ANTHROPIC_API_KEY env var')
  process.exit(1)
}

const client = new Anthropic({ apiKey })

console.log('Testing claude-opus-4-8...')
try {
  const r = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 50,
    messages: [{ role: 'user', content: 'Reply with exactly: Opus 4.8 OK' }],
  })
  console.log('✓ Response:', r.content[0].text)
  console.log('✓ Model used:', r.model)
} catch (err) {
  console.error('✗ Error:', err.message)
  process.exit(1)
}
