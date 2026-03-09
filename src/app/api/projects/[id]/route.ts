import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 优先从 token 获取 userId，其次从 query 参数（向后兼容）
    const authUser = getUserFromRequest(request)
    const userId = authUser?.userId || searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: '未授权或缺少用户ID' }, { status: 401 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        tags: project.tags.map(pt => pt.tag),
        topics: project.topics ? JSON.parse(project.topics) : [],
        analysis: project.analysis ? JSON.parse(project.analysis) : null,
      },
    })
  } catch (error) {
    console.error('Get project error:', error)
    return NextResponse.json({ error: '获取项目失败' }, { status: 500 })
  }
}
