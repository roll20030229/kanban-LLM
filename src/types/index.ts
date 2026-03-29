export interface User {
  id: string
  name: string
  email: string
  password: string
  avatar?: string
  createdAt: Date
}

export interface Milestone {
  title: string
  date: Date
  completed: boolean
}

export interface Project {
  id: string
  name: string
  description?: string
  shareLink: string
  members: string[]
  milestones: Milestone[]
  createdBy: string
  createdAt: Date
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignee?: string
  dueDate?: Date
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ProjectStats {
  completionRate: number
  avgCycleTime: number
  throughput: number
  wipCount: number
  statusDistribution: {
    todo: number
    in_progress: number
    in_review: number
    done: number
  }
  cumulativeFlow: {
    date: string
    todo: number
    in_progress: number
    in_review: number
    done: number
  }[]
  burndown: {
    date: string
    remaining: number
    ideal: number
  }[]
  memberStats: {
    id: string
    name: string
    avatar?: string
    completed: number
    inProgress: number
  }[]
}

export type AIModelType = 'openai' | 'qwen' | 'doubao' | 'wenxin' | 'claude' | 'custom'

export interface AIModelConfig {
  type: AIModelType
  apiKey: string
  modelName: string
  endpoint?: string
}

export interface AIConfig {
  enabled: boolean
  modelType: AIModelType
  apiKey?: string
  modelName?: string
  endpoint?: string
}

export const AI_MODEL_DEFAULTS: Record<AIModelType, { modelName: string; endpoint?: string }> = {
  openai: { modelName: 'gpt-3.5-turbo' },
  qwen: { modelName: 'qwen-max', endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation' },
  doubao: { modelName: 'doubao-pro-32k', endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions' },
  wenxin: { modelName: 'ernie-bot-4', endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions' },
  claude: { modelName: 'claude-3-haiku-20240307', endpoint: 'https://api.anthropic.com/v1/messages' },
  custom: { modelName: '', endpoint: '' },
}

export const AI_MODEL_OPTIONS = [
  { value: 'openai', label: 'OpenAI (GPT)', defaultModel: 'gpt-3.5-turbo' },
  { value: 'qwen', label: '通义千问', defaultModel: 'qwen-max' },
  { value: 'doubao', label: '豆包', defaultModel: 'doubao-pro-32k' },
  { value: 'wenxin', label: '文心一言', defaultModel: 'ernie-bot-4' },
  { value: 'claude', label: 'Claude', defaultModel: 'claude-3-haiku-20240307' },
  { value: 'custom', label: '自定义模型', defaultModel: '' },
]
