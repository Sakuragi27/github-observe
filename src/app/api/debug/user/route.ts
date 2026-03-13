import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  try {
    const auth = await requireAuth()
    if ('error' in auth) return auth.error

    const user = await prisma.user.findUnique({
      where: { id: auth.user.userId },
      select: {
        id: true,
        email: true,
        githubToken: true,
        _count: {
          select: { projects: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      hasGithubToken: !!user.githubToken,
      tokenLength: user.githubToken?.length || 0,
      projectCount: user._count.projects,
    })
  } catch (error: any) {
    console.error('Debug user error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
