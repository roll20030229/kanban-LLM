import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import AIMemory from '@/models/ai-memory'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { projectId } = params
    await connectDB()

    let memory = await AIMemory.findOne({
      projectId,
      userId: session.user.id,
    })

    if (!memory) {
      memory = await AIMemory.create({
        projectId,
        userId: session.user.id,
        messages: [],
        memorySummary: {
          teamAssignments: [],
          userHabits: {
            taskSize: 'medium',
            averageTaskDays: 2,
            preferences: [],
          },
          commonModules: [],
        },
      })
    }

    return NextResponse.json({
      messages: memory.messages.slice(-50),
      memorySummary: memory.memorySummary,
    })
  } catch (error) {
    console.error('获取AI记忆失败:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { projectId } = params
    const { messages, updateMemory } = await request.json()

    await connectDB()

    const memory = await AIMemory.findOneAndUpdate(
      { projectId, userId: session.user.id },
      {
        $push: { 
          messages: { 
            $each: messages,
            $slice: -200
          } 
        },
        $set: { 
          updatedAt: new Date(),
          ...(updateMemory && { memorySummary: updateMemory })
        },
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('保存AI记忆失败:', error)
    return NextResponse.json({ error: '保存失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { projectId } = params
    await connectDB()

    await AIMemory.findOneAndUpdate(
      { projectId, userId: session.user.id },
      {
        $set: {
          messages: [],
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('清除AI记忆失败:', error)
    return NextResponse.json({ error: '清除失败' }, { status: 500 })
  }
}
