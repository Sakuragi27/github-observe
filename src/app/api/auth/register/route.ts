import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(8, '密码至少8位'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已注册' },
        { status: 400 }
      )
    }

    const passwordHash = await hash(password, 12)

    const user = await prisma.user.create({
      data: { email, passwordHash },
    })

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Register error:', error)
    return NextResponse.json({ error: '注册失败' }, { status: 500 })
  }
}
