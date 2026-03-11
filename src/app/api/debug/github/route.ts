import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: '缺少 Token' },
        { status: 400 }
      )
    }

    const response = await axios.get('https://api.github.com/user/starred', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      params: { per_page: 5 },
      timeout: 10000,
    })

    return NextResponse.json({
      success: true,
      count: response.data.length,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'GitHub API 调用失败' },
      { status: 500 }
    )
  }
}
