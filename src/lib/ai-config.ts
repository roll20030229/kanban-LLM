import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'
import { AIConfig, AIModelType } from '@/types'
import { connectDB } from '@/lib/db'
import AIConfigModel from '@/models/ai-config'

const ENCRYPTION_KEY = process.env.AI_CONFIG_ENCRYPTION_KEY || 'vibe-kanban-default-enc-key-32b'
const SALT = 'vibe-kanban-aes-salt'

function getDerivedKey(): Buffer {
  return scryptSync(ENCRYPTION_KEY, SALT, 32)
}

function encrypt(text: string): { encrypted: string; iv: string } {
  const iv = randomBytes(16)
  const key = getDerivedKey()
  const cipher = createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return {
    encrypted,
    iv: iv.toString('hex'),
  }
}

function decrypt(encryptedText: string, ivHex: string): string {
  const iv = Buffer.from(ivHex, 'hex')
  const key = getDerivedKey()
  const decipher = createDecipheriv('aes-256-cbc', key, iv)
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export async function getAIConfig(userId: string): Promise<AIConfig> {
  try {
    await connectDB()
    const doc = await AIConfigModel.findOne({ userId })

    if (doc) {
      let apiKey: string | undefined
      if (doc.encryptedApiKey && doc.apiKeyIv) {
        try {
          apiKey = decrypt(doc.encryptedApiKey, doc.apiKeyIv)
        } catch {
          apiKey = undefined
        }
      }

      return {
        enabled: doc.enabled,
        modelType: doc.modelType as AIModelType,
        apiKey,
        modelName: doc.modelName,
        endpoint: doc.endpoint || undefined,
      }
    }
  } catch (error) {
    console.error('获取AI配置失败:', error)
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

export async function setAIConfig(userId: string, config: AIConfig): Promise<void> {
  await connectDB()

  const updateData: Record<string, unknown> = {
    enabled: config.enabled,
    modelType: config.modelType,
    modelName: config.modelName || getDefaultModel(config.modelType),
    endpoint: config.endpoint || null,
  }

  if (config.apiKey) {
    const { encrypted, iv } = encrypt(config.apiKey)
    updateData.encryptedApiKey = encrypted
    updateData.apiKeyIv = iv
  }

  await AIConfigModel.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { upsert: true, new: true }
  )
}

export async function getAIConfigForUser(userId: string): Promise<AIConfig | null> {
  try {
    const config = await getAIConfig(userId)
    if (config.enabled) {
      return config
    }
    return null
  } catch {
    return null
  }
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
