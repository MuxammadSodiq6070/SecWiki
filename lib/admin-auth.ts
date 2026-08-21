import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE = 'hoogle-admin-session'

function secret() {
  return process.env.ADMIN_SESSION_SECRET || 'development-only-change-me'
}

function signature(value: string) {
  return createHmac('sha256', secret()).update(value).digest('hex')
}

export function createAdminToken(username: string) {
  const payload = Buffer.from(JSON.stringify({ username, exp: Date.now() + 1000 * 60 * 60 * 12 })).toString('base64url')
  return `${payload}.${signature(payload)}`
}

export function isAdminTokenValid(token?: string) {
  if (!token) return false
  const [payload, provided] = token.split('.')
  if (!payload || !provided) return false

  try {
    const expected = signature(payload)
    if (provided.length !== expected.length || !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) return false
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { username?: string; exp?: number }
    return data.username === process.env.ADMIN_USERNAME && Boolean(data.exp && data.exp > Date.now())
  } catch {
    return false
  }
}

export function isAdminRequest() {
  return isAdminTokenValid(cookies().get(ADMIN_COOKIE)?.value)
}

export function adminUsername() {
  return process.env.ADMIN_USERNAME || ''
}
