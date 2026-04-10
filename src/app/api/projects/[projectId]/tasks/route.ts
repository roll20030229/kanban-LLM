import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Task from '@/models/task'
import { auth } from '@/lib/auth'
import { taskSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    await connectDB()
    
    const total = await Task.countDocuments({ projectId: params.projectId })
    const tasks = await Task.find({ projectId: params.projectId })
      .sort({ status: 1, order: 1 })
      .skip(skip)
      .limit(limit)

    return NextResponse.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
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
    const validation = taskSchema.safeParse(body)

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || '参数验证失败'
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    await connectDB()

    // 获取当前状态的最大 order 值
    const maxOrderTask = await Task.findOne({ 
      projectId: params.projectId,
      status: validation.data.status || 'todo'
    }).sort({ order: -1 })

    const newOrder = maxOrderTask ? maxOrderTask.order + 1 : 0

    const task = await Task.create({
      projectId: params.projectId,
      ...validation.data,
      order: newOrder,
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('创建任务失败:', error)
    return NextResponse.json({ error: '创建任务失败' }, { status: 500 })
  }
}
