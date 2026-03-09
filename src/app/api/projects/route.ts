import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []

    if (!userId) {
      return NextResponse.json(
        { error: '缺少 userId' },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = { userId }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { solvedProblem: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            slug: { in: tags },
          },
        },
      }
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          starredAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          fullName: p.fullName,
          description: p.description,
          htmlUrl: p.htmlUrl,
          stargazersCount: p.stargazersCount,
          language: p.language,
          topics: p.topics ? JSON.parse(p.topics) : [],
          solvedProblem: p.solvedProblem,
          tags: p.tags.map((t) => t.tag),
          starredAt: p.starredAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: '获取项目失败' },
      { status: 500 }
    )
  }
}
