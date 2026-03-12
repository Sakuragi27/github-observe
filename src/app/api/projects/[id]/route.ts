import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(request)
    if ('error' in auth) return auth.error

    const project = await prisma.project.findFirst({
      where: { id: params.id, userId: auth.user.userId },
      include: {
        tags: { include: { tag: true } },
        shares: { where: { expiresAt: { gt: new Date() } }, take: 5 },
      },
    })

    if (!project) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        tags: project.tags.map((pt) => pt.tag),
        topics: project.topics ? JSON.parse(project.topics) : [],
        analysis: project.analysis ? JSON.parse(project.analysis) : null,
      },
    })
  } catch (error) {
    console.error('Get project error:', error)
    return NextResponse.json({ error: '获取项目失败' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(request)
    if ('error' in auth) return auth.error

    const body = await request.json()
    const { isFavorite, userNotes } = body

    const project = await prisma.project.findFirst({
      where: { id: params.id, userId: auth.user.userId },
    })

    if (!project) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 })
    }

    const updateData: any = {}
    if (typeof isFavorite === 'boolean') updateData.isFavorite = isFavorite
    if (typeof userNotes === 'string') updateData.userNotes = userNotes

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
      include: { tags: { include: { tag: true } } },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        tags: updated.tags.map((pt) => pt.tag),
        topics: updated.topics ? JSON.parse(updated.topics) : [],
        analysis: updated.analysis ? JSON.parse(updated.analysis) : null,
      },
    })
  } catch (error) {
    console.error('Update project error:', error)
    return NextResponse.json({ error: '更新项目失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(request)
    if ('error' in auth) return auth.error

    const project = await prisma.project.findFirst({
      where: { id: params.id, userId: auth.user.userId },
    })

    if (!project) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 })
    }

    await prisma.project.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json({ error: '删除项目失败' }, { status: 500 })
  }
}
