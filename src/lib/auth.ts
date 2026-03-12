import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

export interface AuthUser {
  userId: string
  email: string
}

function getJwtSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET environment variable is required')
  }
  return secret
}

export function getUserFromRequest(request: NextRequest): AuthUser | null {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const payload = verify(token, getJwtSecret()) as AuthUser
    return payload
  } catch {
    return null
  }
}

/**
 * Helper to require authentication. Returns AuthUser or error response.
 */
export function requireAuth(request: NextRequest): { user: AuthUser } | { error: NextResponse } {
  const user = getUserFromRequest(request)
  if (!user) {
    return {
      error: NextResponse.json({ error: '未授权，请重新登录' }, { status: 401 }),
    }
  }
  return { user }
}

export { getJwtSecret }
