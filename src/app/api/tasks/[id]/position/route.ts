import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Task from '@/models/task'
import { auth } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { status, order } = body

    await connectDB()

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    }

    if (status !== undefined) {
      updateData.status = status
    }

    if (order !== undefined) {
      updateData.order = order
    }

    const task = await Task.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    )

    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('更新任务位置失败:', error)
    return NextResponse.json({ error: '更新任务位置失败' }, { status: 500 })
  }
}
