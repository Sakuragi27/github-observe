import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request)
    
    if (!authUser?.userId) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
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
