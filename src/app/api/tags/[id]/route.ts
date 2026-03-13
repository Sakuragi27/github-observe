import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth()
    if ('error' in auth) return auth.error

    const { id } = await params
    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '标签名称不能为空' }, { status: 400 })
    }

    const slug = name.trim().toLowerCase().replace(/\s+/g, '-')

    // Check for duplicate slug excluding self
    const existing = await prisma.tag.findFirst({
      where: { slug, id: { not: id } },
    })
    if (existing) {
      return NextResponse.json({ error: '标签名称已存在' }, { status: 409 })
    }

    const updated = await prisma.tag.update({
      where: { id },
      data: { name: name.trim(), slug },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Rename tag error:', error)
    return NextResponse.json({ error: '重命名标签失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth()
    if ('error' in auth) return auth.error

    const { id } = await params

    // Delete ProjectTag associations first, then delete the Tag
    await prisma.projectTag.deleteMany({ where: { tagId: id } })
    await prisma.tag.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete tag error:', error)
    return NextResponse.json({ error: '删除标签失败' }, { status: 500 })
  }
}
