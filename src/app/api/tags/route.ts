import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { count: 'desc' },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: tags.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        category: tag.category,
        count: tag._count.projects,
      })),
    })
  } catch (error) {
    console.error('Get tags error:', error)
    return NextResponse.json({ error: '获取标签失败' }, { status: 500 })
  }
}
