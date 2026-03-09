import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const authUser = getUserFromRequest(request)
    const userId = authUser?.userId || searchParams.get('userId')
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []

    if (!userId) {
      return NextResponse.json(
        { error: '未授权或缺少用户ID' },
        { status: 401 }
      )
    }

    const skip = (page - 1) * limit

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

    const projectList = projects.map((p: any) => ({
      id: p.id,
      name: p.name,
      fullName: p.fullName,
      description: p.description,
      htmlUrl: p.htmlUrl,
      stargazersCount: p.stargazersCount,
      language: p.language,
      topics: p.topics ? JSON.parse(p.topics) : [],
      solvedProblem: p.solvedProblem,
      tags: p.tags.map((t: any) => t.tag),
      starredAt: p.starredAt,
    }))

    return NextResponse.json({
      success: true,
      data: {
        projects: projectList,
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
