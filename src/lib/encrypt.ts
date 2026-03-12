import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters')
  }
  return Buffer.from(key, 'utf-8').slice(0, 32)
}

export function encrypt(text: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = (cipher as any).getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey()
  const parts = encryptedData.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format')
  }
  const [ivHex, authTagHex, encrypted] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  ;(decipher as any).setAuthTag(authTag)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
