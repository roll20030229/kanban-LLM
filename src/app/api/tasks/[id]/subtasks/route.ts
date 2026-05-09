import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import Task from '@/models/task'
import { auth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { title } = await request.json()
    if (!title || !title.trim()) {
      return NextResponse.json({ error: '子任务标题不能为空' }, { status: 400 })
    }

    await connectDB()
    const subtask = {
      id: new mongoose.Types.ObjectId().toString(),
      title: title.trim(),
      completed: false,
    }

    const task = await Task.findByIdAndUpdate(
      params.id,
      { $push: { subtasks: subtask }, updatedAt: new Date() },
      { new: true }
    )

    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    }

    return NextResponse.json(subtask)
  } catch (error) {
    return NextResponse.json({ error: '添加子任务失败' }, { status: 500 })
  }
}
