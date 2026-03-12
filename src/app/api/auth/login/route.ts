import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import { getJwtSecret } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !(await compare(password, user.passwordHash))) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 400 }
      )
    }

    const token = sign(
      { userId: user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      success: true,
      token,
      user: { id: user.id, email: user.email },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Login error:', error)
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
}
