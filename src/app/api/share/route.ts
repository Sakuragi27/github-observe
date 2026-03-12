import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { nanoid } from 'nanoid'

// 生成分享链接
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if ('error' in auth) return auth.error

    const body = await request.json()
    const { projectId, expiresInDays = 7 } = body

    if (!projectId) {
      return NextResponse.json(
        { error: '缺少项目ID' },
        { status: 400 }
      )
    }

    // 验证项目属于当前用户
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: auth.user.userId,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      )
    }

    // 生成唯一分享码
    const shareCode = nanoid(10)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // 创建分享记录
    const share = await prisma.share.create({
      data: {
        projectId,
        shareCode,
        expiresAt,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        shareUrl: `/share/${shareCode}`,
        expiresAt: expiresAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Share error:', error)
    return NextResponse.json(
      { error: '创建分享失败' },
      { status: 500 }
    )
  }
}

// 获取分享信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shareCode = searchParams.get('code')

    if (!shareCode) {
      return NextResponse.json(
        { error: '缺少分享码' },
        { status: 400 }
      )
    }

    const share = await prisma.share.findUnique({
      where: { shareCode },
      include: {
        project: true,
      },
    })

    if (!share) {
      return NextResponse.json(
        { error: '分享不存在' },
        { status: 404 }
      )
    }

    // 检查是否过期
    if (new Date() > share.expiresAt) {
      return NextResponse.json(
        { error: '分享已过期' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        project: {
          name: share.project.name,
          fullName: share.project.fullName,
          description: share.project.description,
          htmlUrl: share.project.htmlUrl,
          stargazersCount: share.project.stargazersCount,
          language: share.project.language,
        },
        expiresAt: share.expiresAt,
      },
    })
  } catch (error) {
    console.error('Get share error:', error)
    return NextResponse.json(
      { error: '获取分享信息失败' },
      { status: 500 }
    )
  }
}
