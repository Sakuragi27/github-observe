import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request)
    if ('error' in auth) return auth.error

    const userId = auth.user.userId

    const [
      totalProjects,
      taggedCount,
      favoriteCount,
      user,
      projects,
      tags,
    ] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({
        where: { userId, tags: { some: {} } },
      }),
      prisma.project.count({
        where: { userId, isFavorite: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { lastSyncedAt: true },
      }),
      prisma.project.findMany({
        where: { userId },
        select: { language: true },
      }),
      prisma.tag.findMany({
        where: { projects: { some: { project: { userId } } } },
        include: { _count: { select: { projects: true } } },
        orderBy: { count: 'desc' },
        take: 20,
      }),
    ])

    // Language distribution
    const langMap: Record<string, number> = {}
    projects.forEach((p) => {
      const lang = p.language || '未知'
      langMap[lang] = (langMap[lang] || 0) + 1
    })
    const languageDistribution = Object.entries(langMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // Tag distribution
    const tagDistribution = tags.map((t) => ({
      name: t.name,
      value: t._count.projects,
    }))

    // Recent projects
    const recentProjects = await prisma.project.findMany({
      where: { userId },
      include: { tags: { include: { tag: true } } },
      orderBy: { starredAt: 'desc' },
      take: 6,
    })

    const recentList = recentProjects.map((p) => ({
      id: p.id,
      name: p.name,
      fullName: p.fullName,
      description: p.description,
      htmlUrl: p.htmlUrl,
      stargazersCount: p.stargazersCount,
      language: p.language,
      isFavorite: p.isFavorite,
      tags: p.tags.map((t) => t.tag),
      starredAt: p.starredAt,
    }))

    return NextResponse.json({
      success: true,
      data: {
        totalProjects,
        taggedCount,
        favoriteCount,
        analyzedCount: taggedCount,
        lastSyncedAt: user?.lastSyncedAt,
        languageDistribution,
        tagDistribution,
        recentProjects: recentList,
      },
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 })
  }
}
