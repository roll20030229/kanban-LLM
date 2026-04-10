import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Project from '@/models/project'

export async function GET(
  request: NextRequest,
  { params }: { params: { shareLink: string } }
) {
  try {
    await connectDB()

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

    const updatedProject = await Project.findOneAndUpdate(
      { shareLink: params.shareLink },
      { $inc: { shareLinkCurrentViews: 1 } },
      { new: true }
    )

    if (!updatedProject) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 })
    }

    const projectData = updatedProject.toObject()
    delete projectData.shareLinkPassword

    return NextResponse.json(projectData)
  } catch (error) {
    console.error('获取项目失败:', error)
    return NextResponse.json({ error: '获取项目失败' }, { status: 500 })
  }
}
