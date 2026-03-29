'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Bot, Send, User, Loader2, Check, X, Sparkles } from 'lucide-react'
import { Task, TaskPriority, TaskStatus } from '@/types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  taskData?: ParsedTask
}

interface ParsedTask {
  title: string
  description?: string
  dueDate?: string
  assignee?: string
  priority?: TaskPriority
  status: TaskStatus
}

interface AIAssistantProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string | null
  onTaskCreated: () => void
  members?: string[]
  tasks?: Task[]
  projectName?: string
}

export function AIAssistant({ 
  open, 
  onOpenChange, 
  projectId, 
  onTaskCreated, 
  members = [],
  tasks = [],
  projectName = ''
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingTask, setPendingTask] = useState<ParsedTask | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: '你好！我是AI助手，可以帮你：\n\n• 创建任务（例如："帮我创建一个任务，做首页设计，明天完成"）\n• 分析项目进度（例如："当前项目进度如何？"）\n• 查询任务信息（例如："谁的任务最多？"）\n\n有什么可以帮你的吗？'
      }])
    }
  }, [open, messages.length])

  const sendMessage = async () => {
    if (!input.trim() || loading || pendingTask) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/ai/parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          members,
          tasks: tasks.map(t => ({
            ...t,
            dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : undefined,
            createdAt: new Date(t.createdAt).toISOString(),
            updatedAt: new Date(t.updatedAt).toISOString(),
          })),
          projectName,
          history,
        }),
      })

      const data = await res.json()

      if (data.task) {
        setPendingTask(data.task)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || '已解析任务信息，请确认是否创建：',
          taskData: data.task,
        }
        setMessages(prev => [...prev, assistantMessage])
      } else if (data.message) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
        }
        setMessages(prev => [...prev, assistantMessage])
      } else if (data.error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `抱歉，${data.error}`,
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，服务暂时不可用，请稍后再试。',
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const confirmCreateTask = async () => {
    if (!pendingTask || !projectId) return

    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingTask),
      })

      if (res.ok) {
        const successMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ 任务「${pendingTask.title}」已成功创建！`,
        }
        setMessages(prev => [...prev, successMessage])
        setPendingTask(null)
        onTaskCreated()
      } else {
        const error = await res.json()
        throw new Error(error.error || '创建失败')
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `创建任务失败：${error.message}`,
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const cancelTask = () => {
    setPendingTask(null)
    const cancelMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: '已取消创建任务。还有什么可以帮你的吗？',
    }
    setMessages(prev => [...prev, cancelMessage])
  }

  const formatTaskCard = (task: ParsedTask) => (
    <Card className="mt-2 border-primary/20 bg-primary/5">
      <CardContent className="p-3 space-y-2">
        <div className="font-medium">{task.title}</div>
        {task.description && (
          <div className="text-sm text-gray-600">{task.description}</div>
        )}
        <div className="flex flex-wrap gap-2 text-xs">
          {task.assignee && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
              负责人: {task.assignee}
            </span>
          )}
          {task.dueDate && (
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
              截止: {task.dueDate}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded ${
            task.priority === 'high' ? 'bg-red-100 text-red-700' :
            task.priority === 'low' ? 'bg-gray-100 text-gray-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {task.priority === 'high' ? '高优先级' : 
             task.priority === 'low' ? '低优先级' : '中优先级'}
          </span>
        </div>
        <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={confirmCreateTask} disabled={loading}>
            <Check className="h-3 w-3 mr-1" />
            确认创建
          </Button>
          <Button size="sm" variant="outline" onClick={cancelTask}>
            <X className="h-3 w-3 mr-1" />
            取消
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI助手
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-100px)] mt-4">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  {message.taskData && formatTaskCard(message.taskData)}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Input
                placeholder="描述你想创建的任务或询问项目情况..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                disabled={loading || !!pendingTask}
              />
              <Button onClick={sendMessage} disabled={loading || !input.trim() || !!pendingTask}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              提示：可以问"项目进度如何？"、"谁的任务最多？"等
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
