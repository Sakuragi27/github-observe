import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/next-auth'

export interface AuthUser {
  userId: string
  email: string
}

/**
 * Get user from NextAuth session.
 */
export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return null
    return {
      userId: (session.user as any).id,
      email: session.user.email,
    }
  } catch {
    return null
  }
}

/**
 * Require authentication. Returns AuthUser or error response.
 */
export async function requireAuth(): Promise<{ user: AuthUser } | { error: NextResponse }> {
  const user = await getSessionUser()
  if (!user) {
    return {
      error: NextResponse.json({ error: '未授权，请重新登录' }, { status: 401 }),
    }
  }
  return { user }
}
