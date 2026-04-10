import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Task from '@/models/task'
import { auth } from '@/lib/auth'

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
    const { tasks } = body

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: '任务列表不能为空' }, { status: 400 })
    }

    await connectDB()

    const tasksToCreate = tasks.map(task => ({
      projectId: params.projectId,
      title: task.title,
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      assignee: task.assignee,
      dueDate: task.dueDate,
      tags: task.tags || [],
    }))

    const createdTasks = await Task.insertMany(tasksToCreate)

    return NextResponse.json({ 
      success: true, 
      count: createdTasks.length,
      tasks: createdTasks 
    }, { status: 201 })
  } catch (error) {
    console.error('批量创建任务失败:', error)
    return NextResponse.json({ error: '批量创建任务失败' }, { status: 500 })
  }
}
