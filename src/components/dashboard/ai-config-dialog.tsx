'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bot, Check, Save, Eye, EyeOff } from 'lucide-react'
import { AIModelType, AI_MODEL_OPTIONS } from '@/types'

interface AIConfig {
  enabled: boolean
  modelType: AIModelType
  apiKey?: string
  modelName?: string
  endpoint?: string
}

interface AIConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfigured?: () => void
}

export function AIConfigDialog({ open, onOpenChange, onConfigured }: AIConfigDialogProps) {
  const [aiConfig, setAIConfig] = useState<AIConfig>({
    enabled: false,
    modelType: 'openai',
    modelName: 'gpt-3.5-turbo',
  })
  const [aiApiKey, setAIApiKey] = useState('')
  const [aiModelName, setAIModelName] = useState('gpt-3.5-turbo')
  const [aiEndpoint, setAIEndpoint] = useState('')
  const [aiSaving, setAISaving] = useState(false)
  const [aiSaved, setAISaved] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    if (open) {
      fetchAIConfig()
    }
  }, [open])

  const fetchAIConfig = async () => {
    try {
      const res = await fetch('/api/ai/config')
      if (res.ok) {
        const data = await res.json()
        if (data.config) {
          setAIConfig(data.config)
          setAIModelName(data.config.modelName || 'gpt-3.5-turbo')
          if (data.config.endpoint) {
            setAIEndpoint(data.config.endpoint)
          }
        }
      }
    } catch (error) {
      console.error('获取AI配置失败:', error)
    }
  }

  const handleModelTypeChange = (value: AIModelType) => {
    const option = AI_MODEL_OPTIONS.find(o => o.value === value)
    setAIConfig(prev => ({ ...prev, modelType: value }))
    if (option && option.defaultModel) {
      setAIModelName(option.defaultModel)
    }
  }

  const handleSaveAIConfig = async () => {
    setAISaving(true)
    setAISaved(false)
    try {
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelType: aiConfig.modelType,
          apiKey: aiApiKey || undefined,
          modelName: aiModelName,
          endpoint: aiConfig.modelType === 'custom' ? aiEndpoint : undefined,
        }),
      })

      if (res.ok) {
        setAISaved(true)
        setTimeout(() => {
          setAISaved(false)
          onOpenChange(false)
          onConfigured?.()
        }, 800)
      } else {
        const data = await res.json()
        alert(data.error || '保存失败')
      }
    } catch (error) {
      console.error('保存AI配置失败:', error)
      alert('保存失败')
    } finally {
      setAISaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            配置AI助手
          </DialogTitle>
          <DialogDescription>
            配置AI模型以启用智能任务创建和项目分析功能
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>选择模型</Label>
            <Select value={aiConfig.modelType} onValueChange={handleModelTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择AI模型" />
              </SelectTrigger>
              <SelectContent>
                {AI_MODEL_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={aiApiKey}
                onChange={(e) => setAIApiKey(e.target.value)}
                placeholder={aiConfig.enabled ? '已配置（输入可更新）' : '请输入API Key'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelName">模型名称</Label>
            <Input
              id="modelName"
              value={aiModelName}
              onChange={(e) => setAIModelName(e.target.value)}
              placeholder="输入模型名称"
            />
          </div>

          {aiConfig.modelType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="endpoint">接口地址</Label>
              <Input
                id="endpoint"
                value={aiEndpoint}
                onChange={(e) => setAIEndpoint(e.target.value)}
                placeholder="https://api.example.com/v1/chat/completions"
              />
            </div>
          )}

          <div className="flex items-center gap-4 pt-2">
            <Button onClick={handleSaveAIConfig} disabled={aiSaving} className="flex-1">
              {aiSaving ? (
                <span>保存中...</span>
              ) : aiSaved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  已保存
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  保存并开始使用
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
