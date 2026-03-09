import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAllUserStars, getRepoReadme } from '@/lib/github'
import { analyzeProject } from '@/lib/ai'
import { decrypt } from '@/lib/encrypt'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 优先从 token 获取 userId
    const authUser = getUserFromRequest(request)
    const userId = authUser?.userId || body.userId
    const force = body.force || false

    if (!userId) {
      return NextResponse.json(
        { error: '未授权或缺少用户ID' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.githubToken) {
      return NextResponse.json(
        { error: '请先配置 GitHub Token' },
        { status: 400 }
      )
    }

    const token = decrypt(user.githubToken)
    const stars = await getAllUserStars(token)

    let newCount = 0
    let updatedCount = 0

    for (const star of stars) {
      const existing = await prisma.project.findFirst({
        where: {
          userId,
          githubId: star.id,
        },
      })

      if (existing && !force) {
        continue
      }

      // 获取 README
      const [owner, repo] = star.full_name.split('/')
      const readme = await getRepoReadme(token, owner, repo)

      // AI 分析
      const analysis = await analyzeProject(
        star.name,
        star.description,
        star.language,
        star.topics,
        readme
      )

      if (existing) {
        await prisma.project.update({
          where: { id: existing.id },
          data: {
            description: star.description,
            stargazersCount: star.stargazers_count,
            language: star.language,
            topics: JSON.stringify(star.topics),
            analysis: JSON.stringify(analysis),
            solvedProblem: analysis.solvedProblem,
            syncedAt: new Date(),
          },
        })
        updatedCount++
      } else {
        const project = await prisma.project.create({
          data: {
            userId,
            githubId: star.id,
            name: star.name,
            fullName: star.full_name,
            description: star.description,
            htmlUrl: star.html_url,
            stargazersCount: star.stargazers_count,
            language: star.language,
            topics: JSON.stringify(star.topics),
            analysis: JSON.stringify(analysis),
            solvedProblem: analysis.solvedProblem,
            starredAt: star.starred_at ? new Date(star.starred_at) : null,
            syncedAt: new Date(),
          },
        })

        // 创建标签关联
        for (const tag of analysis.tags) {
          const tagRecord = await prisma.tag.upsert({
            where: { slug: tag.name.toLowerCase() },
            create: {
              name: tag.name,
              slug: tag.name.toLowerCase(),
              category: tag.category,
            },
            update: {
              count: { increment: 1 },
            },
          })

          await prisma.projectTag.create({
            data: {
              projectId: project.id,
              tagId: tagRecord.id,
            },
          })
        }

        newCount++
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: stars.length,
        newCount,
        updatedCount,
      },
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: '同步失败' },
      { status: 500 }
    )
  }
}
