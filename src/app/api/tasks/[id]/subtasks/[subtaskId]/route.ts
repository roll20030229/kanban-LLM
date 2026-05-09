import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Task from '@/models/task'
import { auth } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; subtaskId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { completed, title } = await request.json()
    await connectDB()

    const updateFields: Record<string, any> = { updatedAt: new Date() }
    if (typeof completed === 'boolean') {
      updateFields['subtasks.$.completed'] = completed
    }
    if (title !== undefined) {
      updateFields['subtasks.$.title'] = title
    }

    const task = await Task.findOneAndUpdate(
      { _id: params.id, 'subtasks.id': params.subtaskId },
      { $set: updateFields },
      { new: true }
    )

    if (!task) {
      return NextResponse.json({ error: '任务或子任务不存在' }, { status: 404 })
    }

    const updatedSubtask = task.subtasks.find((s: any) => s.id === params.subtaskId)
    return NextResponse.json(updatedSubtask)
  } catch (error) {
    return NextResponse.json({ error: '更新子任务失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; subtaskId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    await connectDB()

    const task = await Task.findByIdAndUpdate(
      params.id,
      { $pull: { subtasks: { id: params.subtaskId } }, updatedAt: new Date() },
      { new: true }
    )

    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '删除子任务失败' }, { status: 500 })
  }
}
