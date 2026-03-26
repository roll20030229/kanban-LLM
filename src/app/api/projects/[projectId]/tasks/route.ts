import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Task from '@/models/task'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    await connectDB()
    const tasks = await Task.find({ projectId: params.projectId }).sort({
      createdAt: -1,
    })

    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: '获取任务失败' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, status, priority, assignee, dueDate, tags } = body

    await connectDB()

    const task = await Task.create({
      projectId: params.projectId,
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      assignee,
      dueDate,
      tags: tags || [],
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: '创建任务失败' }, { status: 500 })
  }
}
