import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth()
    if ('error' in auth) return auth.error

    const { id: projectId } = await params
    const body = await request.json()
    const { tagId, tagName } = body

    // Verify project belongs to current user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: auth.user.userId },
    })
    if (!project) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 })
    }

    let resolvedTagId = tagId

    // If tagName provided, upsert the tag
    if (tagName && !tagId) {
      const name = tagName.trim()
      if (!name) {
        return NextResponse.json({ error: '标签名称不能为空' }, { status: 400 })
      }
      const slug = name.toLowerCase().replace(/\s+/g, '-')
      const tag = await prisma.tag.upsert({
        where: { slug },
        create: { name, slug },
        update: {},
      })
      resolvedTagId = tag.id
    }

    if (!resolvedTagId) {
      return NextResponse.json({ error: '缺少标签参数' }, { status: 400 })
    }

    // Create ProjectTag association (upsert to prevent duplicates)
    await prisma.projectTag.upsert({
      where: {
        projectId_tagId: { projectId, tagId: resolvedTagId },
      },
      create: { projectId, tagId: resolvedTagId },
      update: {},
    })

    // Update tag count
    const count = await prisma.projectTag.count({ where: { tagId: resolvedTagId } })
    await prisma.tag.update({ where: { id: resolvedTagId }, data: { count } })

    // Return all tags for this project
    const projectTags = await prisma.projectTag.findMany({
      where: { projectId },
      include: { tag: true },
    })

    return NextResponse.json({
      success: true,
      data: projectTags.map((pt) => pt.tag),
    })
  } catch (error) {
    console.error('Add project tag error:', error)
    return NextResponse.json({ error: '添加标签失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth()
    if ('error' in auth) return auth.error

    const { id: projectId } = await params
    const tagId = new URL(request.url).searchParams.get('tagId')

    if (!tagId) {
      return NextResponse.json({ error: '缺少 tagId 参数' }, { status: 400 })
    }

    // Verify project belongs to current user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: auth.user.userId },
    })
    if (!project) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 })
    }

    // Delete the ProjectTag association
    await prisma.projectTag.deleteMany({
      where: { projectId, tagId },
    })

    // Update tag count
    const count = await prisma.projectTag.count({ where: { tagId } })
    await prisma.tag.update({ where: { id: tagId }, data: { count } })

    // Return all tags for this project
    const projectTags = await prisma.projectTag.findMany({
      where: { projectId },
      include: { tag: true },
    })

    return NextResponse.json({
      success: true,
      data: projectTags.map((pt) => pt.tag),
    })
  } catch (error) {
    console.error('Remove project tag error:', error)
    return NextResponse.json({ error: '移除标签失败' }, { status: 500 })
  }
}
