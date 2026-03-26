import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Project from '@/models/project'
import Task from '@/models/task'

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

    const tasks = await Task.find({ projectId: project._id }).sort({
      createdAt: -1,
    })

    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: '获取任务失败' }, { status: 500 })
  }
}
