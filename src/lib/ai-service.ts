import { AIModelType, AIConfig, Task } from '@/types'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AIResponse {
  content: string
  success: boolean
  error?: string
}

export class AIService {
  private config: AIConfig

  constructor(config: AIConfig) {
    this.config = config
  }

  async chat(messages: ChatMessage[]): Promise<AIResponse> {
    if (!this.config.enabled || !this.config.apiKey) {
      return { content: '', success: false, error: 'AI未配置' }
    }

    try {
      switch (this.config.modelType) {
        case 'openai':
          return await this.callOpenAI(messages)
        case 'qwen':
          return await this.callQwen(messages)
        case 'doubao':
          return await this.callDoubao(messages)
        case 'wenxin':
          return await this.callWenxin(messages)
        case 'claude':
          return await this.callClaude(messages)
        case 'custom':
          return await this.callCustom(messages)
        default:
          return { content: '', success: false, error: '不支持的模型类型' }
      }
    } catch (error) {
      console.error('AI调用失败:', error)
      return { content: '', success: false, error: 'AI调用失败' }
    }
  }

  private async callOpenAI(messages: ChatMessage[]): Promise<AIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.modelName || 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { content: '', success: false, error: error.error?.message || 'OpenAI调用失败' }
    }

    const data = await response.json()
    return { content: data.choices[0].message.content, success: true }
  }

  private async callQwen(messages: ChatMessage[]): Promise<AIResponse> {
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.modelName || 'qwen-max',
        input: {
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        },
        parameters: {
          temperature: 0.7,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { content: '', success: false, error: error.message || '通义千问调用失败' }
    }

    const data = await response.json()
    return { content: data.output.text, success: true }
  }

  private async callDoubao(messages: ChatMessage[]): Promise<AIResponse> {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.modelName || 'doubao-pro-32k',
        messages,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { content: '', success: false, error: error.error?.message || '豆包调用失败' }
    }

    const data = await response.json()
    return { content: data.choices[0].message.content, success: true }
  }

  private async callWenxin(messages: ChatMessage[]): Promise<AIResponse> {
    const response = await fetch(`https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=${this.config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.modelName || 'ernie-bot-4',
        messages,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { content: '', success: false, error: error.error_msg || '文心一言调用失败' }
    }

    const data = await response.json()
    return { content: data.result, success: true }
  }

  private async callClaude(messages: ChatMessage[]): Promise<AIResponse> {
    const systemMessage = messages.find(m => m.role === 'system')
    const otherMessages = messages.filter(m => m.role !== 'system')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.modelName || 'claude-3-haiku-20240307',
        max_tokens: 4096,
        system: systemMessage?.content,
        messages: otherMessages.map(m => ({ role: m.role, content: m.content })),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { content: '', success: false, error: error.error?.message || 'Claude调用失败' }
    }

    const data = await response.json()
    return { content: data.content[0].text, success: true }
  }

  private async callCustom(messages: ChatMessage[]): Promise<AIResponse> {
    if (!this.config.endpoint) {
      return { content: '', success: false, error: '自定义模型需要配置接口地址' }
    }

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.modelName,
        messages,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { content: '', success: false, error: error.error?.message || '自定义模型调用失败' }
    }

    const data = await response.json()
    return { content: data.choices?.[0]?.message?.content || data.result || data.output, success: true }
  }
}

export function buildProjectContext(tasks: Task[], projectName: string): string {
  const total = tasks.length
  const done = tasks.filter(t => t.status === 'done').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const inReview = tasks.filter(t => t.status === 'in_review').length
  const todo = tasks.filter(t => t.status === 'todo').length
  
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0
  
  const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length
  
  const assigneeStats: Record<string, { total: number; done: number }> = {}
  tasks.forEach(task => {
    if (task.assignee) {
      if (!assigneeStats[task.assignee]) {
        assigneeStats[task.assignee] = { total: 0, done: 0 }
      }
      assigneeStats[task.assignee].total++
      if (task.status === 'done') {
        assigneeStats[task.assignee].done++
      }
    }
  })

  const now = new Date()
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'done' || !t.dueDate) return false
    return new Date(t.dueDate) < now
  })

  const upcomingTasks = tasks.filter(t => {
    if (t.status === 'done' || !t.dueDate) return false
    const dueDate = new Date(t.dueDate)
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 3
  })

  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const recentlyCompleted = tasks.filter(t => {
    if (t.status !== 'done') return false
    const updatedAt = new Date(t.updatedAt)
    return updatedAt >= oneWeekAgo
  }).length

  return `
项目名称: ${projectName}
任务总数: ${total}
完成进度: ${completionRate}% (${done}/${total})
任务状态分布:
- 待办(Todo): ${todo}
- 进行中(In Progress): ${inProgress}
- 审核中(In Review): ${inReview}
- 已完成(Done): ${done}

高优先级未完成任务: ${highPriority}
已过期任务: ${overdueTasks.length}
即将到期任务(3天内): ${upcomingTasks.length}

团队成员任务统计:
${Object.entries(assigneeStats).map(([name, stats]) => 
  `- ${name}: 总计${stats.total}个任务, 已完成${stats.done}个`
).join('\n')}

最近一周完成任务数: ${recentlyCompleted}

任务详情:
${tasks.map(t => `- [${t.status}] ${t.title}${t.assignee ? ` (负责人: ${t.assignee})` : ''}${t.dueDate ? ` (截止: ${new Date(t.dueDate).toLocaleDateString()})` : ''}${t.priority === 'high' ? ' [高优先级]' : ''}`).join('\n')}
`.trim()
}

export function getSystemPrompt(): string {
  return `你是一个专业的项目管理AI助手，帮助用户管理看板项目。你可以：

1. 创建任务：解析用户的自然语言描述，提取任务信息
2. 项目分析：基于项目数据回答用户问题，包括进度、效率、风险等
3. 任务建议：提供任务优先级、时间管理建议

当用户想要创建任务时，请分析并返回JSON格式的任务信息：
{
  "action": "create_task",
  "task": {
    "title": "任务标题",
    "description": "任务描述（可选）",
    "assignee": "负责人（可选）",
    "dueDate": "YYYY-MM-DD格式的截止日期（可选）",
    "priority": "high/medium/low（默认medium）",
    "status": "todo"
  }
}

当用户询问项目相关问题时，基于提供的项目数据进行分析和回答。
请用简洁、专业的中文回答。`
}
