import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAllUserStars, getRepoReadme } from '@/lib/github'
import { analyzeProject } from '@/lib/ai'
import { decrypt } from '@/lib/encrypt'
import { requireAuth } from '@/lib/auth'
import { checkSyncRateLimit } from '@/lib/rate-limit'
import { generateEmbedding, buildProjectSearchText } from '@/lib/embedding'

const CONCURRENCY = 3

export interface SyncProgressEvent {
  type: 'progress'
  phase: 'fetching' | 'analyzing'
  current: number
  total: number
  projectName?: string
}

export interface SyncCompleteEvent {
  type: 'complete'
  total: number
  newCount: number
  updatedCount: number
}

export interface SyncErrorEvent {
  type: 'error'
  message: string
}

export type SyncSSEEvent = SyncProgressEvent | SyncCompleteEvent | SyncErrorEvent

export async function POST(request: NextRequest) {
  // Auth check - return JSON for auth errors (before SSE stream starts)
  const auth = await requireAuth()
  if ('error' in auth) return auth.error

  // Rate limit check - return JSON for rate limit errors (before SSE stream starts)
  const rateLimit = checkSyncRateLimit(auth.user.userId)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: '同步频率超限，请稍后再试', retryAfterMs: rateLimit.retryAfterMs },
      { status: 429 }
    )
  }

  const body = await request.json().catch(() => ({}))
  const force = body.force || false

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: SyncSSEEvent) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      try {
        const user = await prisma.user.findUnique({
          where: { id: auth.user.userId },
        })

        if (!user?.githubToken) {
          send({ type: 'error', message: '请先配置 GitHub Token' })
          controller.close()
          return
        }

        const token = decrypt(user.githubToken)

        // Phase: fetching
        send({ type: 'progress', phase: 'fetching', current: 0, total: 0 })

        const stars = await getAllUserStars(token)
        const total = stars.length

        send({ type: 'progress', phase: 'fetching', current: total, total })

        let newCount = 0
        let updatedCount = 0
        let processed = 0

        // Phase: analyzing
        for (let i = 0; i < stars.length; i += CONCURRENCY) {
          const batch = stars.slice(i, i + CONCURRENCY)

          await Promise.all(
            batch.map(async (star) => {
              try {
                const existing = await prisma.project.findFirst({
                  where: { userId: auth.user.userId, githubId: star.id },
                })

                if (existing && !force) {
                  processed++
                  send({
                    type: 'progress',
                    phase: 'analyzing',
                    current: processed,
                    total,
                    projectName: star.full_name,
                  })
                  return
                }

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
                      readme: readme || null,
                      syncedAt: new Date(),
                    },
                  })

                  // Generate and store embedding
                  const searchText = buildProjectSearchText({
                    name: star.name,
                    fullName: star.full_name,
                    description: star.description,
                    analysis: JSON.stringify(analysis),
                    readme: readme,
                  })
                  const embedding = await generateEmbedding(searchText)
                  if (embedding) {
                    await prisma.$executeRaw`UPDATE "Project" SET "embedding" = ${JSON.stringify(embedding)}::vector WHERE "id" = ${existing.id}`
                  }

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
                      readme: readme || null,
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

                  // Generate and store embedding
                  const searchText = buildProjectSearchText({
                    name: star.name,
                    fullName: star.full_name,
                    description: star.description,
                    analysis: JSON.stringify(analysis),
                    readme: readme,
                  })
                  const embedding = await generateEmbedding(searchText)
                  if (embedding) {
                    await prisma.$executeRaw`UPDATE "Project" SET "embedding" = ${JSON.stringify(embedding)}::vector WHERE "id" = ${project.id}`
                  }

                  newCount++
                }

                processed++
                send({
                  type: 'progress',
                  phase: 'analyzing',
                  current: processed,
                  total,
                  projectName: star.full_name,
                })
              } catch (starError) {
                console.error(`Error processing ${star.full_name}:`, (starError as Error).message)
                processed++
                send({
                  type: 'progress',
                  phase: 'analyzing',
                  current: processed,
                  total,
                  projectName: star.full_name,
                })
              }
            })
          )
        }

        // Update last synced timestamp
        await prisma.user.update({
          where: { id: auth.user.userId },
          data: { lastSyncedAt: new Date() },
        })

        send({ type: 'complete', total, newCount, updatedCount })
        controller.close()
      } catch (error) {
        console.error('Sync error:', error)
        send({ type: 'error', message: '同步失败' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
