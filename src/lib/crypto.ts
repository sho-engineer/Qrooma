import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be set to a 64 hex char string (32 bytes)')
  }
  return Buffer.from(hex, 'hex')
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a colon-delimited string: base64(iv):base64(authTag):base64(ciphertext)
 * Never call this client-side.
 */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(12) // 96-bit IV for GCM
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()
  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':')
}

/**
 * Decrypt a value produced by encrypt().
 * Never call this client-side.
 */
export function decrypt(stored: string): string {
  const key = getKey()
  const parts = stored.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted value format')
  }
  const [ivB64, tagB64, dataB64] = parts
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(tagB64, 'base64')
  const encrypted = Buffer.from(dataB64, 'base64')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8')
}
