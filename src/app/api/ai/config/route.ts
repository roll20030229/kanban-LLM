import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AIConfig, AIModelType } from '@/types'

let userAIConfigs: Record<string, AIConfig> = {}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const userId = session.user.id
    
    if (userAIConfigs[userId]) {
      return NextResponse.json({ 
        enabled: true, 
        config: userAIConfigs[userId] 
      })
    }

    const envKey = process.env.OPENAI_API_KEY
    if (envKey) {
      return NextResponse.json({ 
        enabled: true, 
        config: {
          enabled: true,
          modelType: 'openai' as AIModelType,
          apiKey: envKey,
          modelName: 'gpt-3.5-turbo',
        }
      })
    }

    return NextResponse.json({ 
      enabled: false, 
      config: null 
    })
  } catch (error) {
    console.error('获取AI配置失败:', error)
    return NextResponse.json({ enabled: false, config: null }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { modelType, apiKey, modelName, endpoint } = body

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key不能为空' }, { status: 400 })
    }

    const config: AIConfig = {
      enabled: true,
      modelType: modelType || 'openai',
      apiKey,
      modelName: modelName || getDefaultModel(modelType),
      endpoint,
    }

    userAIConfigs[session.user.id] = config

    return NextResponse.json({ 
      success: true, 
      config: { ...config, apiKey: '******' } 
    })
  } catch (error) {
    console.error('保存AI配置失败:', error)
    return NextResponse.json({ error: '保存配置失败' }, { status: 500 })
  }
}

function getDefaultModel(modelType: AIModelType): string {
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
