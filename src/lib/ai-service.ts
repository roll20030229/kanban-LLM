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

interface MemorySummary {
  teamAssignments: Array<{
    member: string
    modules: string[]
    updatedAt?: Date
  }>
  userHabits: {
    taskSize: 'small' | 'medium' | 'large'
    averageTaskDays: number
    preferences: string[]
    updatedAt?: Date
  }
  commonModules: string[]
  lastSummaryUpdate?: Date
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

  async extractMemoryFromConversation(
    messages: ChatMessage[],
    currentMemory: MemorySummary
  ): Promise<Partial<MemorySummary>> {
    const recentMessages = messages.slice(-10)
    const conversationText = recentMessages
      .filter(m => m.role !== 'system')
      .map(m => `${m.role}: ${m.content}`)
      .join('\n')

    const extractPrompt = `分析以下对话，提取团队分工、用户习惯和常用模块信息。

当前已知记忆：
- 团队分工：${currentMemory.teamAssignments.map(t => `${t.member}负责${t.modules.join('、')}`).join('；') || '暂无'}
- 用户习惯：任务规模偏好${currentMemory.userHabits.taskSize}，平均任务周期${currentMemory.userHabits.averageTaskDays}天
- 常用模块：${currentMemory.commonModules.join('、') || '暂无'}

对话内容：
${conversationText}

请返回JSON格式的新发现（只返回有变化的部分）：
{
  "teamAssignments": [{"member": "成员名", "modules": ["模块1", "模块2"]}],
  "userHabits": {"taskSize": "small/medium/large", "averageTaskDays": 数字, "preferences": ["偏好"]},
  "commonModules": ["模块1", "模块2"]
}

如果没有新发现，返回空对象 {}。只返回JSON，不要其他内容。`

    try {
      const response = await this.chat([
        { role: 'system', content: '你是一个信息提取助手，专门从对话中提取团队协作相关的记忆信息。' },
        { role: 'user', content: extractPrompt }
      ])

      if (response.success && response.content) {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      }
    } catch (error) {
      console.error('提取记忆失败:', error)
    }

    return {}
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
- 待办: ${todo}
- 进行中(In Progress): ${inProgress}
- 审核中(In Review): ${inReview}
- 已完成: ${done}

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

export function getSystemPrompt(memorySummary?: MemorySummary): string {
  let memoryContext = ''
  
  if (memorySummary) {
    const parts: string[] = []
    
    if (memorySummary.teamAssignments.length > 0) {
      parts.push(`团队分工记忆：${memorySummary.teamAssignments.map(t => `${t.member}负责${t.modules.join('、')}`).join('；')}。创建任务时请根据分工自动分配负责人。`)
    }
    
    if (memorySummary.userHabits) {
      const habitDesc = memorySummary.userHabits.taskSize === 'small' ? '小任务（1-2天）' :
                       memorySummary.userHabits.taskSize === 'large' ? '大任务（5天以上）' : '中等任务（2-4天）'
      parts.push(`用户习惯：偏好${habitDesc}，平均任务周期${memorySummary.userHabits.averageTaskDays}天。拆解任务时请参考这个节奏。`)
    }
    
    if (memorySummary.commonModules.length > 0) {
      parts.push(`常用模块：${memorySummary.commonModules.join('、')}。用户提到相关需求时请按这些模块拆解。`)
    }
    
    if (parts.length > 0) {
      memoryContext = `\n\n【长期记忆】\n${parts.join('\n')}\n请基于这些记忆来理解用户意图，让回答更贴合团队实际情况。`
    }
  }

  return `你是一个专业的项目管理AI助手，帮助用户管理看板项目。你可以：

1. 创建单个任务：解析用户的简单描述，提取任务信息
2. 拆解客户需求：将复杂的客户需求自动拆解成多个可执行的任务
3. 项目分析：基于项目数据回答用户问题，包括进度、效率、风险等

【重要】判断用户输入类型并返回对应格式：

**情况1：创建单个任务**（用户描述的是一个简单、具体的任务）
返回JSON：
{
  "action": "create_task",
  "task": {
    "title": "任务标题",
    "description": "任务描述（可选）",
    "assignee": "负责人（根据团队分工记忆分配）",
    "dueDate": "YYYY-MM-DD格式的截止日期",
    "priority": "high/medium/low",
    "status": "todo"
  }
}

**情况2：拆解客户需求**（用户描述的是一个完整的项目需求或功能需求，包含多个功能点、模块或需要多步骤完成）
返回JSON：
{
  "action": "decompose_requirement",
  "requirement": "需求概述",
  "tasks": [
    {
      "title": "任务标题（清晰可执行）",
      "description": "任务描述（包含客户需求中的具体细节）",
      "assignee": "负责人（根据团队分工记忆分配）",
      "dueDate": "YYYY-MM-DD（根据整体交付时间合理分配）",
      "priority": "high/medium/low（核心功能为high）",
      "status": "todo"
    }
  ]
}

**拆解需求时的要求：**
- 每个任务必须是可独立执行的最小单元
- 自动根据客户说的整体交付时间，给每个任务分配合理的截止日期
- 核心功能、关键路径的任务优先级设为high
- 必须根据团队分工记忆自动分配负责人
- 任务描述要包含客户需求中对应的具体细节
- 任务数量要合理，通常3-8个任务

**情况3：项目问答**（用户询问项目相关的问题）
直接用中文回答，不需要返回JSON。

请用简洁、专业的中文回答。${memoryContext}`
}

export type { MemorySummary, ChatMessage }
