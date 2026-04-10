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

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json({ error: '任务列表格式不正确' }, { status: 400 })
    }

    await connectDB()

    // 检查所有任务的版本号是否匹配（乐观锁）
    const taskIds = tasks.map((t: any) => t.id)
    const existingTasks = await Task.find({ 
      _id: { $in: taskIds },
      projectId: params.projectId 
    })

    const versionMismatches: string[] = []
    
    for (const task of tasks) {
      const existingTask = existingTasks.find((t: any) => t._id.toString() === task.id)
      if (existingTask && existingTask.version !== task.version) {
        versionMismatches.push(task.id)
      }
    }

    if (versionMismatches.length > 0) {
      return NextResponse.json({ 
        error: '任务已被其他用户修改，请刷新页面后重试',
        conflictTasks: versionMismatches,
        code: 'VERSION_CONFLICT'
      }, { status: 409 })
    }

    // 执行批量更新，同时递增版本号
    const bulkOps = tasks.map((task: { id: string; order: number; status?: string }) => ({
      updateOne: {
        filter: { _id: task.id, projectId: params.projectId },
        update: {
          $set: {
            order: task.order,
            status: task.status,
            updatedAt: new Date(),
          },
          $inc: { version: 1 },
        },
      },
    }))

    await Task.bulkWrite(bulkOps)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('批量更新任务顺序失败:', error)
    return NextResponse.json({ error: '批量更新任务顺序失败' }, { status: 500 })
  }
}
