import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAllUserStars, getRepoReadme } from '@/lib/github'
import { analyzeProject } from '@/lib/ai'
import { decrypt } from '@/lib/encrypt'
import { requireAuth } from '@/lib/auth'

const CONCURRENCY = 3

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request)
    if ('error' in auth) return auth.error

    const body = await request.json().catch(() => ({}))
    const force = body.force || false

    const user = await prisma.user.findUnique({
      where: { id: auth.user.userId },
    })

    if (!user?.githubToken) {
      return NextResponse.json(
        { error: '请先配置 GitHub Token' },
        { status: 400 }
      )
    }

    const token = decrypt(user.githubToken)
    const stars = await getAllUserStars(token)

    let newCount = 0
    let updatedCount = 0

    // Process in batches with concurrency control
    for (let i = 0; i < stars.length; i += CONCURRENCY) {
      const batch = stars.slice(i, i + CONCURRENCY)

      await Promise.all(
        batch.map(async (star) => {
          try {
            const existing = await prisma.project.findFirst({
              where: { userId: auth.user.userId, githubId: star.id },
            })

            if (existing && !force) return

            const [owner, repo] = star.full_name.split('/')
            const readme = await getRepoReadme(token, owner, repo)

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
                  userId: auth.user.userId,
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

              // Create tag associations
              for (const tag of analysis.tags) {
                try {
                  const tagRecord = await prisma.tag.upsert({
                    where: { slug: tag.name.toLowerCase().replace(/\s+/g, '-') },
                    create: {
                      name: tag.name,
                      slug: tag.name.toLowerCase().replace(/\s+/g, '-'),
                      category: tag.category,
                    },
                    update: {
                      count: { increment: 1 },
                    },
                  })

                  await prisma.projectTag.upsert({
                    where: {
                      projectId_tagId: { projectId: project.id, tagId: tagRecord.id },
                    },
                    create: { projectId: project.id, tagId: tagRecord.id },
                    update: {},
                  })
                } catch (tagError) {
                  console.error('Tag creation error:', (tagError as Error).message)
                }
              }

              newCount++
            }
          } catch (starError) {
            console.error(`Error processing ${star.full_name}:`, (starError as Error).message)
          }
        })
      )
    }

    // Update last synced timestamp
    await prisma.user.update({
      where: { id: auth.user.userId },
      data: { lastSyncedAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      data: { total: stars.length, newCount, updatedCount },
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: '同步失败' }, { status: 500 })
  }
}
