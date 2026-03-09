import { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

export interface AuthUser {
  userId: string
  email: string
}

export function getUserFromRequest(request: NextRequest): AuthUser | null {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const secret = process.env.NEXTAUTH_SECRET || 'your-secret-key'
    
    const payload = verify(token, secret) as AuthUser
    return payload
  } catch (error) {
    return null
  }
}
