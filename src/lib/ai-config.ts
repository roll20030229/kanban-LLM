import { AIConfig, AIModelType } from '@/types'

let userAIConfigs: Record<string, AIConfig> = {}

export function getAIConfig(projectId: string): AIConfig {
  const userId = Object.keys(userAIConfigs)[0]
  if (userId && userAIConfigs[userId]) {
    return userAIConfigs[userId]
  }

  const envKey = process.env.OPENAI_API_KEY
  if (envKey) {
    return {
      enabled: true,
      modelType: 'openai' as AIModelType,
      apiKey: envKey,
      modelName: 'gpt-3.5-turbo',
    }
  }

  return {
    enabled: false,
    modelType: 'openai',
    apiKey: undefined,
  }
}

export function setAIConfig(userId: string, config: AIConfig): void {
  userAIConfigs[userId] = config
}

export function getAIConfigForUser(userId: string): AIConfig | null {
  return userAIConfigs[userId] || null
}

export function getDefaultModel(modelType: AIModelType): string {
  const defaults: Record<AIModelType, string> = {
    openai: 'gpt-3.5-turbo',
    qwen: 'qwen-max',
    doubao: 'doubao-pro-32k',
    wenxin: 'ernie-bot-4',
    claude: 'claude-3-haiku-20240307',
    custom: '',
  }
  return defaults[modelType] || 'gpt-3.5-turbo'
}
