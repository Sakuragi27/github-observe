import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encrypt'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 优先从 token 获取 userId
    const authUser = getUserFromRequest(request)
    const userId = authUser?.userId || body.userId
    const githubToken = body.githubToken

    if (!userId) {
      return NextResponse.json(
        { error: '未授权或缺少用户ID' },
        { status: 401 }
      )
    }

    if (!githubToken) {
      return NextResponse.json(
        { error: '缺少 GitHub Token' },
        { status: 400 }
      )
    }

    const encryptedToken = encrypt(githubToken)

    await prisma.user.update({
      where: { id: userId },
      data: { githubToken: encryptedToken },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save token error:', error)
    return NextResponse.json(
      { error: '保存 Token 失败' },
      { status: 500 }
    )
  }
}
