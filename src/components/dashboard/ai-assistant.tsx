'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Bot, Send, User, Loader2, Check, X, Sparkles, Mic, MicOff } from 'lucide-react'
import { Task, TaskPriority, TaskStatus } from '@/types'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  taskData?: ParsedTask
  batchTasks?: ParsedTask[]
  timestamp?: Date
}

interface ParsedTask {
  title: string
  description?: string
  dueDate?: string
  assignee?: string
  priority?: TaskPriority
  status: TaskStatus
}

interface MemorySummary {
  teamAssignments: Array<{
    member: string
    modules: string[]
  }>
  userHabits: {
    taskSize: 'small' | 'medium' | 'large'
    averageTaskDays: number
    preferences: string[]
  }
  commonModules: string[]
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
  const [pendingBatchTasks, setPendingBatchTasks] = useState<ParsedTask[] | null>(null)
  const [memorySummary, setMemorySummary] = useState<MemorySummary | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastProjectIdRef = useRef<string | null>(null)

  const {
    isListening,
    transcript,
    isSupported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition()

  useEffect(() => {
    if (transcript) {
      setInput(prev => prev + transcript)
      resetTranscript()
    }
  }, [transcript, resetTranscript])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadHistory = useCallback(async () => {
    if (!projectId) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: '你好！我是AI助手，可以帮你：\n\n• 创建任务（例如："帮我创建一个任务，做首页设计，明天完成"）\n• 分析项目进度（例如："当前项目进度如何？"）\n• 查询任务信息（例如："谁的任务最多？"）\n\n有什么可以帮你的吗？'
      }])
      setMemorySummary(null)
      return
    }

    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/ai/memory/${projectId}`)
      if (res.ok) {
        const data = await res.json()
        
        if (data.messages && data.messages.length > 0) {
          const loadedMessages: Message[] = data.messages.map((m: any, index: number) => ({
            id: `loaded-${index}`,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: new Date(m.timestamp),
          }))
          
          const hasWelcome = loadedMessages.some((m: Message) => 
            m.content.includes('你好！我是AI助手')
          )
          
          if (!hasWelcome) {
            loadedMessages.unshift({
              id: 'welcome',
              role: 'assistant' as const,
              content: '欢迎回来！我记住了我们之前的对话。有什么可以继续帮你的吗？',
            })
          }
          
          setMessages(loadedMessages)
        } else {
          setMessages([{
            id: '1',
            role: 'assistant',
            content: '你好！我是AI助手，可以帮你：\n\n• 创建任务（例如："帮我创建一个任务，做首页设计，明天完成"）\n• 分析项目进度（例如："当前项目进度如何？"）\n• 查询任务信息（例如："谁的任务最多？"）\n\n有什么可以帮你的吗？'
          }])
        }
        
        if (data.memorySummary) {
          setMemorySummary(data.memorySummary)
        }
      }
    } catch (error) {
      console.error('加载历史失败:', error)
      setMessages([{
        id: '1',
        role: 'assistant',
        content: '你好！我是AI助手，可以帮你：\n\n• 创建任务（例如："帮我创建一个任务，做首页设计，明天完成"）\n• 分析项目进度（例如："当前项目进度如何？"）\n• 查询任务信息（例如："谁的任务最多？"）\n\n有什么可以帮你的吗？'
      }])
    } finally {
      setLoadingHistory(false)
    }
  }, [projectId])

  useEffect(() => {
    if (open && projectId && projectId !== lastProjectIdRef.current) {
      lastProjectIdRef.current = projectId
      loadHistory()
    } else if (open && !projectId) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: '你好！我是AI助手，可以帮你：\n\n• 创建任务（例如："帮我创建一个任务，做首页设计，明天完成"）\n• 分析项目进度（例如："当前项目进度如何？"）\n• 查询任务信息（例如："谁的任务最多？"）\n\n有什么可以帮你的吗？'
      }])
    }
  }, [open, projectId, loadHistory])

  const saveMessages = async (newMessages: Message[]) => {
    if (!projectId) return

    try {
      const messagesToSave = newMessages
        .filter(m => !m.id.startsWith('welcome'))
        .map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp || new Date(),
        }))

      await fetch(`/api/ai/memory/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesToSave.slice(-2) }),
      })
    } catch (error) {
      console.error('保存消息失败:', error)
    }
  }

  const extractAndUpdateMemory = async (conversationMessages: Message[]) => {
    if (!projectId || conversationMessages.length < 4) return

    try {
      const res = await fetch('/api/ai/extract-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          messages: conversationMessages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
          currentMemory: memorySummary,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.memorySummary) {
          setMemorySummary(data.memorySummary)
        }
      }
    } catch (error) {
      console.error('提取记忆失败:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading || pendingTask || pendingBatchTasks) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const history = messages
        .filter(m => !m.id.startsWith('welcome'))
        .map(m => ({
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
          memorySummary,
        }),
      })

      const data = await res.json()

      let assistantMessage: Message
      if (data.action === 'decompose_requirement' && data.tasks) {
        setPendingBatchTasks(data.tasks)
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || `我已经根据客户需求拆解好了${data.tasks.length}个任务，请确认是否批量创建到看板？`,
          batchTasks: data.tasks,
          timestamp: new Date(),
        }
      } else if (data.task) {
        setPendingTask(data.task)
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || '已解析任务信息，请确认是否创建：',
          taskData: data.task,
          timestamp: new Date(),
        }
      } else if (data.message) {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        }
      } else if (data.error) {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `抱歉，${data.error}`,
          timestamp: new Date(),
        }
      } else {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '抱歉，我没有理解你的意思，请换一种方式描述。',
          timestamp: new Date(),
        }
      }

      const updatedMessages = [...newMessages, assistantMessage]
      setMessages(updatedMessages)
      
      await saveMessages(updatedMessages)
      
      if (updatedMessages.length % 6 === 0) {
        extractAndUpdateMemory(updatedMessages)
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，服务暂时不可用，请稍后再试。',
        timestamp: new Date(),
      }
      const updatedMessages = [...newMessages, errorMessage]
      setMessages(updatedMessages)
      await saveMessages(updatedMessages)
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
          timestamp: new Date(),
        }
        const updatedMessages = [...messages, successMessage]
        setMessages(updatedMessages)
        setPendingTask(null)
        onTaskCreated()
        await saveMessages(updatedMessages)
      } else {
        const error = await res.json()
        throw new Error(error.error || '创建失败')
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `创建任务失败：${error.message}`,
        timestamp: new Date(),
      }
      const updatedMessages = [...messages, errorMessage]
      setMessages(updatedMessages)
      await saveMessages(updatedMessages)
    } finally {
      setLoading(false)
    }
  }

  const cancelTask = () => {
    setPendingTask(null)
    setPendingBatchTasks(null)
    const cancelMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: '已取消创建任务。还有什么可以帮你的吗？',
      timestamp: new Date(),
    }
    const updatedMessages = [...messages, cancelMessage]
    setMessages(updatedMessages)
    saveMessages(updatedMessages)
  }

  const confirmBatchCreateTasks = async () => {
    if (!pendingBatchTasks || !projectId) return

    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: pendingBatchTasks }),
      })

      if (res.ok) {
        const successMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ 已成功创建${pendingBatchTasks.length}个任务！`,
          timestamp: new Date(),
        }
        const updatedMessages = [...messages, successMessage]
        setMessages(updatedMessages)
        setPendingBatchTasks(null)
        onTaskCreated()
        await saveMessages(updatedMessages)
      } else {
        const error = await res.json()
        throw new Error(error.error || '批量创建失败')
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `批量创建任务失败：${error.message}`,
        timestamp: new Date(),
      }
      const updatedMessages = [...messages, errorMessage]
      setMessages(updatedMessages)
      await saveMessages(updatedMessages)
    } finally {
      setLoading(false)
    }
  }

  const updateBatchTask = (index: number, updatedTask: ParsedTask) => {
    if (!pendingBatchTasks) return
    const newTasks = [...pendingBatchTasks]
    newTasks[index] = updatedTask
    setPendingBatchTasks(newTasks)
  }

  const formatTaskCard = (task: ParsedTask) => (
    <Card className="mt-2 border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
      <CardContent className="p-3 space-y-2">
        <div className="font-medium text-white/85 text-sm">{task.title}</div>
        {task.description && (
          <div className="text-sm text-white/35">{task.description}</div>
        )}
        <div className="flex flex-wrap gap-2 text-xs">
          {task.assignee && (
            <span className="px-2 py-0.5 bg-white/[0.05] text-white/60 border border-white/[0.08] rounded-md backdrop-blur-sm">
              负责人: {task.assignee}
            </span>
          )}
          {task.dueDate && (
            <span className="px-2 py-0.5 bg-white/[0.05] text-white/55 border border-white/[0.08] rounded-md backdrop-blur-sm">
              截止: {task.dueDate}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-md border backdrop-blur-sm ${
            task.priority === 'high' ? 'bg-red-500/[0.08] text-red-400 border-red-500/[0.15]' :
            task.priority === 'low' ? 'bg-white/[0.04] text-white/45 border-white/[0.06]' :
            'bg-amber-500/[0.08] text-amber-400 border-amber-500/[0.15]'
          }`}>
            {task.priority === 'high' ? '高优先级' : 
             task.priority === 'low' ? '低优先级' : '中优先级'}
          </span>
        </div>
        <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
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

  const formatBatchTasksCard = (tasks: ParsedTask[]) => (
    <Card className="mt-2 border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
      <CardContent className="p-3 space-y-3">
        <div className="text-sm font-medium text-white/85 mb-2">
          共 {tasks.length} 个任务：
        </div>
        {tasks.map((task, index) => (
          <div key={index} className="p-2 bg-white/[0.02] rounded-[8px] border border-white/[0.06] text-sm space-y-1">
            <div className="font-medium flex items-center gap-2">
              <span className="text-white/30">{index + 1}.</span>
              <span className="text-white/80">{task.title}</span>
            </div>
            {task.description && (
              <div className="text-white/35 text-xs pl-4">{task.description}</div>
            )}
            <div className="flex flex-wrap gap-1 text-xs pl-4">
              {task.assignee && (
                <span className="px-1.5 py-0.5 bg-white/[0.05] text-white/60 rounded-md">
                  {task.assignee}
                </span>
              )}
              {task.dueDate && (
                <span className="px-1.5 py-0.5 bg-white/[0.05] text-white/50 rounded-md">
                  {task.dueDate}
                </span>
              )}
              <span className={`px-1.5 py-0.5 rounded-md ${
                task.priority === 'high' ? 'bg-red-500/[0.08] text-red-400' :
                task.priority === 'low' ? 'bg-white/[0.04] text-white/45' :
                'bg-amber-500/[0.08] text-amber-400'
              }`}>
                {task.priority === 'high' ? '高' : task.priority === 'low' ? '低' : '中'}
              </span>
            </div>
          </div>
        ))}
        <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
          <Button size="sm" onClick={confirmBatchCreateTasks} disabled={loading}>
            <Check className="h-3 w-3 mr-1" />
            确认批量创建
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
          <SheetTitle className="flex items-center gap-2 text-white/90">
            <Sparkles className="h-5 w-5 text-white/45" />
            AI助手
            {memorySummary && memorySummary.teamAssignments.length > 0 && (
              <span className="text-xs font-normal text-white/30 ml-2">
                (已记住团队分工)
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-100px)] mt-4">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-white/40" />
                <span className="ml-2 text-white/30 text-sm">加载历史对话...</span>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0 border border-white/[0.08]">
                      <Bot className="h-4 w-4 text-white/40" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-[12px] px-3.5 py-2.5 ${
                      message.role === 'user'
                        ? 'bg-white/[0.1] text-white/90 border border-white/[0.12] backdrop-blur-xl'
                        : 'bg-white/[0.03] text-white/75 border border-white/[0.06] backdrop-blur-xl'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                    {message.taskData && formatTaskCard(message.taskData)}
                    {message.batchTasks && formatBatchTasksCard(message.batchTasks)}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center flex-shrink-0 border border-white/[0.1]">
                      <User className="h-4 w-4 text-white/60" />
                    </div>
                  )}
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center border border-white/[0.08]">
                  <Bot className="h-4 w-4 text-white/40" />
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-[12px] px-3.5 py-2.5 backdrop-blur-xl">
                  <Loader2 className="h-4 w-4 animate-spin text-white/40" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-white/[0.06] pt-4 mt-2">
            <div className="flex gap-2">
              <Input
                placeholder={isListening ? "正在录音..." : "描述你想创建的任务或询问项目情况..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                disabled={loading || !!pendingTask || !!pendingBatchTasks || loadingHistory}
                className={isListening ? 'border-red-400/25 bg-red-500/[0.04]' : ''}
              />
              {speechSupported && (
                <Button
                  variant={isListening ? 'destructive' : 'default'}
                  size="icon"
                  onClick={isListening ? stopListening : startListening}
                  disabled={loading || !!pendingTask || !!pendingBatchTasks || loadingHistory}
                  className={isListening ? 'animate-pulse' : ''}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button onClick={sendMessage} disabled={loading || !input.trim() || !!pendingTask || !!pendingBatchTasks || loadingHistory}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-white/25 mt-2">
              提示：可以问&ldquo;项目进度如何？&rdquo;、&ldquo;谁的任务最多？&rdquo;等
              {speechSupported && '，或点击麦克风语音输入'}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
