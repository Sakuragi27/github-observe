import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * POST /api/tags/cleanup
 * Merge duplicate/similar tags and remove low-value tags.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if ('error' in auth) return auth.error

    const allTags = await prisma.tag.findMany({
      include: { _count: { select: { projects: true } } },
    })

    let mergedCount = 0
    let deletedCount = 0

    // Step 1: Merge case-insensitive duplicates (e.g., "React" and "react" and "React.js")
    const tagsByNormalizedName = new Map<string, typeof allTags>()
    for (const tag of allTags) {
      // Normalize: lowercase, remove .js/.ts suffixes, trim spaces
      const normalized = tag.name
        .toLowerCase()
        .replace(/\.js$|\.ts$|\.jsx$|\.tsx$/i, '')
        .replace(/[-_]/g, '')
        .trim()

      const group = tagsByNormalizedName.get(normalized) || []
      group.push(tag)
      tagsByNormalizedName.set(normalized, group)
    }

    for (const [, group] of Array.from(tagsByNormalizedName.entries())) {
      if (group.length <= 1) continue

      // Keep the tag with the most projects, merge others into it
      group.sort((a, b) => b._count.projects - a._count.projects)
      const target = group[0]

      for (let i = 1; i < group.length; i++) {
        const source = group[i]

        // Move all project associations from source to target
        const sourceAssociations = await prisma.projectTag.findMany({
          where: { tagId: source.id },
        })

        for (const assoc of sourceAssociations) {
          const exists = await prisma.projectTag.findUnique({
            where: {
              projectId_tagId: { projectId: assoc.projectId, tagId: target.id },
            },
          })
          if (!exists) {
            await prisma.projectTag.create({
              data: { projectId: assoc.projectId, tagId: target.id },
            })
          }
        }

        // Delete source
        await prisma.projectTag.deleteMany({ where: { tagId: source.id } })
        await prisma.tag.delete({ where: { id: source.id } })
        mergedCount++
      }

      // Update target count
      const count = await prisma.projectTag.count({ where: { tagId: target.id } })
      await prisma.tag.update({ where: { id: target.id }, data: { count } })
    }

    // Step 2: Remove low-value generic tags
    const genericNames = new Set([
      '开源', '工具', '库', '框架', '项目', '软件', '应用',
      'open-source', 'tool', 'library', 'framework', 'project',
      'software', 'application', 'app', '待分类',
    ])

    const genericTags = await prisma.tag.findMany({
      where: {
        OR: [
          { slug: { in: Array.from(genericNames) } },
          { name: { in: Array.from(genericNames) } },
        ],
      },
    })

    for (const tag of genericTags) {
      await prisma.projectTag.deleteMany({ where: { tagId: tag.id } })
      await prisma.tag.delete({ where: { id: tag.id } })
      deletedCount++
    }

    // Step 3: Remove orphaned tags (0 projects)
    const orphans = await prisma.tag.findMany({
      where: {
        projects: { none: {} },
      },
    })

    for (const tag of orphans) {
      await prisma.tag.delete({ where: { id: tag.id } })
      deletedCount++
    }

    return NextResponse.json({
      success: true,
      data: { mergedCount, deletedCount },
    })
  } catch (error) {
    console.error('Tag cleanup error:', error)
    return NextResponse.json({ error: '标签清理失败' }, { status: 500 })
  }
}
