import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateEmbedding } from '@/lib/embedding'

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if ('error' in auth) return auth.error

  const query = req.nextUrl.searchParams.get('q')
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20'), 50)

  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 })
  }

  // Generate embedding for the search query
  const queryEmbedding = await generateEmbedding(query)

  if (!queryEmbedding) {
    // Fallback to text search if embedding fails
    const projects = await prisma.project.findMany({
      where: {
        userId: auth.user.userId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { solvedProblem: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: { tags: { include: { tag: true } } },
    })
    return NextResponse.json({ data: projects.map(formatProject), mode: 'text' })
  }

  // Semantic search using pgvector
  const results = await prisma.$queryRaw`
    SELECT p.*, 1 - (p."embedding" <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity
    FROM "Project" p
    WHERE p."userId" = ${auth.user.userId}
      AND p."embedding" IS NOT NULL
    ORDER BY p."embedding" <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT ${limit}
  ` as any[]

  // Format results
  const formattedResults = results.map((p: any) => ({
    id: p.id,
    name: p.name,
    fullName: p.fullName,
    description: p.description,
    htmlUrl: p.htmlUrl,
    stargazersCount: p.stargazersCount,
    language: p.language,
    topics: p.topics ? JSON.parse(p.topics) : [],
    analysis: p.analysis ? JSON.parse(p.analysis) : null,
    solvedProblem: p.solvedProblem,
    isFavorite: p.isFavorite,
    similarity: parseFloat(p.similarity?.toFixed(4) || '0'),
  }))

  return NextResponse.json({ data: formattedResults, mode: 'semantic' })
}

function formatProject(p: any) {
  return {
    id: p.id,
    name: p.name,
    fullName: p.fullName,
    description: p.description,
    htmlUrl: p.htmlUrl,
    stargazersCount: p.stargazersCount,
    language: p.language,
    topics: p.topics ? JSON.parse(p.topics) : [],
    analysis: p.analysis ? JSON.parse(p.analysis) : null,
    solvedProblem: p.solvedProblem,
    isFavorite: p.isFavorite,
    tags: p.tags?.map((pt: any) => pt.tag) || [],
    similarity: null,
  }
}
