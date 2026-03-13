import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if ('error' in auth) return auth.error

    const { sourceId, targetId } = await request.json()

    if (!sourceId || !targetId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    if (sourceId === targetId) {
      return NextResponse.json({ error: '不能合并到自身' }, { status: 400 })
    }

    // Get all ProjectTag associations for the source tag
    const sourceProjectTags = await prisma.projectTag.findMany({
      where: { tagId: sourceId },
    })

    // Get existing ProjectTag associations for the target tag
    const targetProjectTags = await prisma.projectTag.findMany({
      where: { tagId: targetId },
    })
    const targetProjectIds = new Set(targetProjectTags.map((pt) => pt.projectId))

    // Transfer associations to target (skip already existing)
    for (const pt of sourceProjectTags) {
      if (!targetProjectIds.has(pt.projectId)) {
        await prisma.projectTag.create({
          data: { projectId: pt.projectId, tagId: targetId },
        })
      }
    }

    // Delete source ProjectTags and Tag
    await prisma.projectTag.deleteMany({ where: { tagId: sourceId } })
    await prisma.tag.delete({ where: { id: sourceId } })

    // Update target count
    const count = await prisma.projectTag.count({ where: { tagId: targetId } })
    await prisma.tag.update({ where: { id: targetId }, data: { count } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Merge tags error:', error)
    return NextResponse.json({ error: '合并标签失败' }, { status: 500 })
  }
}
