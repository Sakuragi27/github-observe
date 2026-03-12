import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request)
    if ('error' in auth) return auth.error
    const { user } = auth

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const search = searchParams.get('search') || ''
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const language = searchParams.get('language') || ''
    const favorite = searchParams.get('favorite')
    const sort = searchParams.get('sort') || 'starredAt'
    const order = searchParams.get('order') || 'desc'

    const skip = (page - 1) * limit

    const where: any = { userId: user.userId }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { solvedProblem: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (tags.length > 0) {
      where.tags = {
        some: { tag: { slug: { in: tags } } },
      }
    }

    if (language) {
      where.language = language
    }

    if (favorite === 'true') {
      where.isFavorite = true
    }

    const orderBy: any = {}
    if (['starredAt', 'stargazersCount', 'name', 'createdAt', 'updatedAt'].includes(sort)) {
      orderBy[sort] = order === 'asc' ? 'asc' : 'desc'
    } else {
      orderBy.starredAt = 'desc'
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          tags: { include: { tag: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ])

    const projectList = projects.map((p) => ({
      id: p.id,
      name: p.name,
      fullName: p.fullName,
      description: p.description,
      htmlUrl: p.htmlUrl,
      stargazersCount: p.stargazersCount,
      language: p.language,
      topics: p.topics ? JSON.parse(p.topics) : [],
      solvedProblem: p.solvedProblem,
      isFavorite: p.isFavorite,
      userNotes: p.userNotes,
      tags: p.tags.map((t) => t.tag),
      starredAt: p.starredAt,
      analysis: p.analysis ? JSON.parse(p.analysis) : null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        projects: projectList,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    })
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json({ error: '获取项目失败' }, { status: 500 })
  }
}
