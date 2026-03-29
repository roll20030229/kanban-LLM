'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Check, Plus, Trash2, AlertCircle, Bot, Save, Eye, EyeOff } from 'lucide-react'
import { AIModelType, AI_MODEL_OPTIONS } from '@/types'

interface Project {
  _id: string
  name: string
  description?: string
  shareLink: string
}

interface AIConfig {
  enabled: boolean
  modelType: AIModelType
  apiKey?: string
  modelName?: string
  endpoint?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
        setError(null)
      } else if (res.status === 401) {
        router.push('/login')
      } else {
        setError('加载失败，请稍后重试')
      }
    } catch (error) {
      console.error('获取项目失败:', error)
      setError('网络错误，请检查连接')
    } finally {
      setLoading(false)
    }
  }, [router])

  const fetchAIConfig = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    fetchProjects()
    fetchAIConfig()
  }, [fetchProjects, fetchAIConfig])

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription,
        }),
      })

      if (res.ok) {
        const project = await res.json()
        setProjects([...projects, project])
        setNewProjectName('')
        setNewProjectDescription('')
      }
    } catch (error) {
      console.error('创建项目失败:', error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('确定要删除这个项目吗？')) return

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setProjects(projects.filter((p) => p._id !== projectId))
      }
    } catch (error) {
      console.error('删除项目失败:', error)
    }
  }

  const copyShareLink = async (shareLink: string, projectId: string) => {
    const url = `${window.location.origin}/share/${shareLink}`
    await navigator.clipboard.writeText(url)
    setCopiedId(projectId)
    setTimeout(() => setCopiedId(null), 2000)
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
        setTimeout(() => setAISaved(false), 2000)
        fetchAIConfig()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <div>
                <h3 className="font-medium text-red-800">{error}</h3>
                <p className="text-sm text-red-600 mt-1">
                  请刷新页面重试或联系管理员。
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push('/')}
            >
              返回看板
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">设置</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI助手配置
          </CardTitle>
          <CardDescription>
            配置AI模型以启用智能任务创建和项目分析功能
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="flex items-center gap-4">
            <Button onClick={handleSaveAIConfig} disabled={aiSaving}>
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
                  保存配置
                </>
              )}
            </Button>
            {aiConfig.enabled && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Check className="h-4 w-4" />
                AI助手已启用
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>创建新项目</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">项目名称</Label>
            <Input
              id="projectName"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="输入项目名称"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectDescription">项目描述</Label>
            <Textarea
              id="projectDescription"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              placeholder="输入项目描述（可选）"
              rows={3}
            />
          </div>
          <Button onClick={handleCreateProject}>
            <Plus className="h-4 w-4 mr-2" />
            创建项目
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>项目列表</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-4">暂无项目</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">
                        分享链接: /share/{project.shareLink}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() =>
                          copyShareLink(project.shareLink, project._id)
                        }
                      >
                        {copiedId === project._id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteProject(project._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
