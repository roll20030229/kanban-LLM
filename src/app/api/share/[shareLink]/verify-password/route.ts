import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Project from '@/models/project'

export async function POST(
  request: NextRequest,
  { params }: { params: { shareLink: string } }
) {
  try {
    await connectDB()

    const body = await request.json()
    const { password } = body

    const project = await Project.findOne({ shareLink: params.shareLink })

    if (!project) {
      return NextResponse.json({ error: '项目不存在或链接已失效' }, { status: 404 })
    }

    if (project.shareLinkExpiresAt && new Date() > project.shareLinkExpiresAt) {
      return NextResponse.json({ error: '分享链接已过期' }, { status: 403 })
    }

    if (project.shareLinkMaxViews && project.shareLinkCurrentViews >= project.shareLinkMaxViews) {
      return NextResponse.json({ error: '分享链接访问次数已达上限' }, { status: 403 })
    }

    if (project.shareLinkPassword && project.shareLinkPassword !== password) {
      return NextResponse.json({ error: '访问密码错误' }, { status: 403 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('验证密码失败:', error)
    return NextResponse.json({ error: '验证失败' }, { status: 500 })
  }
}
