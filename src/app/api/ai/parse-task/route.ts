import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AIService, buildProjectContext, getSystemPrompt } from '@/lib/ai-service'
import { Task, TaskPriority, TaskStatus, AIConfig } from '@/types'
import dbConnect from '@/lib/db'
import TaskModel from '@/models/task'

interface ParsedTask {
  title: string
  description?: string
  dueDate?: string
  assignee?: string
  priority?: TaskPriority
  status: TaskStatus
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

let userAIConfigs: Record<string, AIConfig> = {}

function parseTaskFromResponse(content: string): { action: string; task?: ParsedTask } | null {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('解析JSON失败:', e)
  }
  return null
}

function parseNaturalLanguage(message: string, members: string[]): { task: ParsedTask | null; message?: string } {
  const lowerMessage = message.toLowerCase()
  
  const taskPatterns = [
    /(?:帮我)?(?:加|新增|创建|添加)?(?:一个)?任务[，,]?\s*(.+?)(?:，|,|$)/,
    /(?:做|完成|开发|设计|编写|实现)\s*(.+?)(?:，|,|$)/,
    /(?:新增|添加|创建)\s*(.+?)(?:任务)?(?:，|,|$)/,
  ]

  let title = ''
  for (const pattern of taskPatterns) {
    const match = message.match(pattern)
    if (match) {
      title = match[1].trim()
      break
    }
  }

  if (!title) {
    if (message.length > 0 && message.length < 100) {
      title = message.trim()
    }
  }

  if (!title) {
    return { task: null, message: '请描述您想创建的任务' }
  }

  let assignee: string | undefined
  for (const member of members) {
    if (lowerMessage.includes(member.toLowerCase())) {
      assignee = member
      break
    }
  }
  
  const assigneePatterns = [
    /(?:分配给|指派给|交给|负责人[是为])\s*([^\s，,。]+)/,
    /([^\s，,。]+)\s*(?:负责|来做)/,
  ]
  if (!assignee) {
    for (const pattern of assigneePatterns) {
      const match = message.match(pattern)
      if (match) {
        const extracted = match[1].trim()
        const found = members.find(m => 
          m.toLowerCase().includes(extracted.toLowerCase()) ||
          extracted.toLowerCase().includes(m.toLowerCase())
        )
        if (found) {
          assignee = found
          break
        }
      }
    }
  }

  let dueDate: string | undefined
  const today = new Date()
  
  if (lowerMessage.includes('今天') || lowerMessage.includes('今日')) {
    dueDate = today.toISOString().split('T')[0]
  } else if (lowerMessage.includes('明天')) {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    dueDate = tomorrow.toISOString().split('T')[0]
  } else if (lowerMessage.includes('后天')) {
    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 2)
    dueDate = dayAfter.toISOString().split('T')[0]
  } else if (lowerMessage.includes('下周')) {
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    dueDate = nextWeek.toISOString().split('T')[0]
  } else if (lowerMessage.includes('月底')) {
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    dueDate = endOfMonth.toISOString().split('T')[0]
  } else {
    const datePatterns = [
      /(\d{4}[-/年]\d{1,2}[-/月]\d{1,2})/,
      /(\d{1,2}[-/月]\d{1,2}[-/日]?)/,
      /(\d{1,2}月\d{1,2}[日号]?)/,
    ]
    for (const pattern of datePatterns) {
      const match = message.match(pattern)
      if (match) {
        let dateStr = match[1]
          .replace(/[年月]/g, '-')
          .replace(/[日号]/g, '')
          .replace(/\//g, '-')
        
        if (dateStr.split('-').length === 2) {
          dateStr = `${today.getFullYear()}-${dateStr}`
        }
        
        try {
          const parsed = new Date(dateStr)
          if (!isNaN(parsed.getTime())) {
            dueDate = parsed.toISOString().split('T')[0]
            break
          }
        } catch (e) {
          console.error('日期解析失败:', e)
        }
      }
    }
  }

  let priority: TaskPriority = 'medium'
  if (lowerMessage.includes('高优先级') || lowerMessage.includes('紧急') || lowerMessage.includes('重要')) {
    priority = 'high'
  } else if (lowerMessage.includes('低优先级') || lowerMessage.includes('不急')) {
    priority = 'low'
  }

  const task: ParsedTask = {
    title,
    status: 'todo',
    priority,
  }

  if (assignee) task.assignee = assignee
  if (dueDate) task.dueDate = dueDate

  const descriptionMatch = message.match(/(?:描述|说明|内容)[是为：:]\s*(.+?)(?:，|,|$)/)
  if (descriptionMatch) {
    task.description = descriptionMatch[1].trim()
  }

  return { task }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { message, members = [], tasks = [], projectName = '', history = [] } = body

    if (!message) {
      return NextResponse.json({ error: '请输入消息' }, { status: 400 })
    }

    const configRes = await fetch(new URL('/api/ai/config', request.url), {
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
    })
    const configData = await configRes.json()

    if (!configData.enabled || !configData.config?.apiKey) {
      const result = parseNaturalLanguage(message, members)
      if (result.task) {
        return NextResponse.json({ 
          task: result.task, 
          message: result.message || '已解析任务信息（使用本地解析，建议配置AI获得更好体验）' 
        })
      }
      return NextResponse.json({ 
        error: '请先在设置中配置AI API Key',
        task: null 
      })
    }

    const aiService = new AIService(configData.config)
    
    const projectContext = buildProjectContext(tasks as Task[], projectName)
    
    const messages: ChatMessage[] = [
      { role: 'system', content: getSystemPrompt() },
      { role: 'system', content: `当前项目数据：\n${projectContext}` },
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user', content: message },
    ]

    const response = await aiService.chat(messages)

    if (!response.success) {
      const result = parseNaturalLanguage(message, members)
      if (result.task) {
        return NextResponse.json({ 
          task: result.task, 
          message: result.message || `已解析任务信息（AI暂时不可用：${response.error}）` 
        })
      }
      return NextResponse.json({ error: response.error || 'AI服务暂时不可用' })
    }

    const parsed = parseTaskFromResponse(response.content)
    if (parsed?.action === 'create_task' && parsed.task) {
      return NextResponse.json({ 
        task: parsed.task, 
        message: '已解析任务信息，请确认是否创建' 
      })
    }

    return NextResponse.json({ 
      message: response.content,
      task: null 
    })
  } catch (error) {
    console.error('AI解析失败:', error)
    return NextResponse.json({ error: 'AI服务暂时不可用' }, { status: 500 })
  }
}
