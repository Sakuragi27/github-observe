import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encrypt'
import { z } from 'zod'

const tokenSchema = z.object({
  userId: z.string(),
  githubToken: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, githubToken } = tokenSchema.parse(body)

    const encryptedToken = encrypt(githubToken)

    await prisma.user.update({
      where: { id: userId },
      data: { githubToken: encryptedToken },
    })

    return NextResponse.json({ success: true, message: 'Token 保存成功' })
  } catch (error) {
    console.error('Save token error:', error)
    return NextResponse.json({ error: '保存失败' }, { status: 500 })
  }
}
