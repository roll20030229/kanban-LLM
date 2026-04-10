import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import AIMemory from '@/models/ai-memory'
import { auth } from '@/lib/auth'
import { AIService, MemorySummary } from '@/lib/ai-service'
import { getAIConfigForUser } from '@/lib/ai-config'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { projectId, messages, currentMemory } = await request.json()

    if (!projectId || !messages || messages.length === 0) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 })
    }

    let config = getAIConfigForUser(session.user.id)
    
    if (!config) {
      const envKey = process.env.OPENAI_API_KEY
      if (envKey) {
        config = {
          enabled: true,
          modelType: 'openai',
          apiKey: envKey,
          modelName: 'gpt-3.5-turbo',
        }
      }
    }
    
    if (!config || !config.enabled || !config.apiKey) {
      return NextResponse.json({ error: 'AI未配置' }, { status: 400 })
    }

    const aiService = new AIService(config)
    const extractedMemory = await aiService.extractMemoryFromConversation(
      messages,
      currentMemory || {
        teamAssignments: [],
        userHabits: {
          taskSize: 'medium',
          averageTaskDays: 2,
          preferences: [],
        },
        commonModules: [],
      }
    )

    if (Object.keys(extractedMemory).length === 0) {
      return NextResponse.json({ memorySummary: currentMemory })
    }

    await connectDB()

    const existingMemory = await AIMemory.findOne({
      projectId,
      userId: session.user.id,
    })

    const updatedMemory: MemorySummary = {
      teamAssignments: existingMemory?.memorySummary?.teamAssignments || [],
      userHabits: existingMemory?.memorySummary?.userHabits || {
        taskSize: 'medium',
        averageTaskDays: 2,
        preferences: [],
      },
      commonModules: existingMemory?.memorySummary?.commonModules || [],
      lastSummaryUpdate: new Date(),
    }

    if (extractedMemory.teamAssignments && extractedMemory.teamAssignments.length > 0) {
      for (const assignment of extractedMemory.teamAssignments) {
        const existingIndex = updatedMemory.teamAssignments.findIndex(
          t => t.member === assignment.member
        )
        if (existingIndex >= 0) {
          const existingModules = updatedMemory.teamAssignments[existingIndex].modules
          const newModules = assignment.modules.filter(m => !existingModules.includes(m))
          updatedMemory.teamAssignments[existingIndex].modules = [
            ...existingModules,
            ...newModules
          ]
          updatedMemory.teamAssignments[existingIndex].updatedAt = new Date()
        } else {
          updatedMemory.teamAssignments.push({
            ...assignment,
            updatedAt: new Date(),
          })
        }
      }
    }

    if (extractedMemory.userHabits) {
      updatedMemory.userHabits = {
        ...updatedMemory.userHabits,
        ...extractedMemory.userHabits,
        updatedAt: new Date(),
      }
    }

    if (extractedMemory.commonModules && extractedMemory.commonModules.length > 0) {
      const existingModules = updatedMemory.commonModules
      const newModules = extractedMemory.commonModules.filter(m => !existingModules.includes(m))
      updatedMemory.commonModules = [...existingModules, ...newModules]
    }

    await AIMemory.findOneAndUpdate(
      { projectId, userId: session.user.id },
      {
        $set: {
          memorySummary: updatedMemory,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({ memorySummary: updatedMemory })
  } catch (error) {
    console.error('提取记忆失败:', error)
    return NextResponse.json({ error: '提取记忆失败' }, { status: 500 })
  }
}
