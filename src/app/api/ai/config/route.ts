import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AIModelType } from '@/types'
import { setAIConfig, getAIConfigForUser, getDefaultModel } from '@/lib/ai-config'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const userId = session.user.id
    const config = await getAIConfigForUser(userId)

    if (config) {
      const safeConfig = { ...config, apiKey: config.apiKey ? '******' : undefined }
      return NextResponse.json({
        enabled: true,
        config: safeConfig,
      })
    }

    const envKey = process.env.OPENAI_API_KEY
    if (envKey) {
      return NextResponse.json({
        enabled: true,
        config: {
          enabled: true,
          modelType: 'openai' as AIModelType,
          apiKey: '******',
          modelName: 'gpt-3.5-turbo',
        },
      })
    }

    return NextResponse.json({
      enabled: false,
      config: null,
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

    const config = {
      enabled: true,
      modelType: modelType || 'openai',
      apiKey,
      modelName: modelName || getDefaultModel(modelType),
      endpoint,
    }

    await setAIConfig(session.user.id, config)

    return NextResponse.json({
      success: true,
      config: { ...config, apiKey: '******' },
    })
  } catch (error) {
    console.error('保存AI配置失败:', error)
    return NextResponse.json({ error: '保存配置失败' }, { status: 500 })
  }
}
