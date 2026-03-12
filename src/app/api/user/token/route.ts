import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encrypt'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if ('error' in auth) return auth.error

    const body = await request.json()
    const { githubToken } = body

    if (!githubToken || typeof githubToken !== 'string' || githubToken.length < 10) {
      return NextResponse.json(
        { error: 'GitHub Token 格式无效' },
        { status: 400 }
      )
    }

    const encryptedToken = encrypt(githubToken)

    await prisma.user.update({
      where: { id: auth.user.userId },
      data: { githubToken: encryptedToken },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save token error:', error)
    return NextResponse.json({ error: '保存 Token 失败' }, { status: 500 })
  }
}
