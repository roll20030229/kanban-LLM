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

    const { content, eventType, author } = await request.json()
    if (!content || !content.trim()) {
      return NextResponse.json({ error: '日志内容不能为空' }, { status: 400 })
    }

    const validEventTypes = ['start', 'decision', 'problem', 'fix', 'refactor', 'complete']
    const resolvedEventType = validEventTypes.includes(eventType) ? eventType : 'start'
    const resolvedAuthor = author || session.user.name || session.user.email || '未知用户'

    await connectDB()
    const devLog = {
      id: new mongoose.Types.ObjectId().toString(),
      eventType: resolvedEventType,
      author: resolvedAuthor,
      content: content.trim(),
      createdAt: new Date(),
    }

    const task = await Task.findByIdAndUpdate(
      params.id,
      { $push: { devLogs: devLog }, updatedAt: new Date() },
      { new: true }
    )

    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    }

    return NextResponse.json(devLog)
  } catch (error) {
    return NextResponse.json({ error: '添加开发日志失败' }, { status: 500 })
  }
}
