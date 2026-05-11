'use client'

import { Task, TaskStatus, Subtask, DevLog } from '@/types'
import { cn, statusLabels, priorityLabels, formatDate } from '@/lib/utils'
import { SubtaskList, DevLogList } from '@/components/task-detail'
import { TaskForm } from '@/components/dashboard'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Calendar,
  Edit3,
  Clock,
  User,
  Trash2,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'

const statusColors: Record<TaskStatus, { bg: string; text: string; border: string }> = {
  todo: { bg: 'bg-[#4f8fff]/15', text: 'text-[#4f8fff]', border: 'border-[#4f8fff]/30' },
  in_progress: { bg: 'bg-[#a855f7]/15', text: 'text-[#a855f7]', border: 'border-[#a855f7]/30' },
  in_review: { bg: 'bg-[#f59e0b]/15', text: 'text-[#f59e0b]', border: 'border-[#f59e0b]/30' },
  done: { bg: 'bg-[#22d3ee]/15', text: 'text-[#22d3ee]', border: 'border-[#22d3ee]/30' },
}

const priorityStyles: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  medium: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  low: { bg: 'bg-white/[0.06]', text: 'text-white/60', border: 'border-white/[0.12]' },
}

export default function TaskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.taskId as string

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [isDemo, setIsDemo] = useState(false)

  const isMongoId = useCallback((id: string) => /^[0-9a-fA-F]{24}$/.test(id), [])

  const getCachedTask = useCallback((): Task | null => {
    if (typeof window === 'undefined') return null
    try {
      const cached = sessionStorage.getItem(`task-${taskId}`)
      if (cached) {
        return JSON.parse(cached)
      }
    } catch {}
    return null
  }, [taskId])

  const fetchTask = useCallback(async () => {
    if (!isMongoId(taskId)) {
      const cached = getCachedTask()
      if (cached) {
        setTask(cached)
        setIsDemo(true)
      } else {
        console.error('任务不存在')
      }
      setLoading(false)
      return
    }
    const cached = getCachedTask()
    try {
      const res = await fetch(`/api/tasks/${taskId}`)
      if (res.ok) {
        const data = await res.json()
        setTask(data)
        setIsDemo(false)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`task-${taskId}`, JSON.stringify(data))
        }
      } else {
        if (cached) {
          setTask(cached)
          setIsDemo(true)
        } else {
          console.error('任务不存在')
        }
      }
    } catch (error) {
      if (cached) {
        setTask(cached)
        setIsDemo(true)
      } else {
        console.error('获取任务失败:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [taskId, getCachedTask, isMongoId])

  useEffect(() => {
    fetchTask()
  }, [fetchTask])

  const handleSubtasksUpdate = (subtasks: Subtask[]) => {
    setTask(prev => prev ? { ...prev, subtasks } : null)
  }

  const handleDevLogsUpdate = (devLogs: DevLog[]) => {
    setTask(prev => prev ? { ...prev, devLogs } : null)
  }

  const handleTaskFormSubmit = async (data: any) => {
    if (isDemo) {
      setTask(prev => prev ? { ...prev, ...data } : null)
      return
    }
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: '操作失败' }))
      throw new Error(errorData.error || '操作失败')
    }
    fetchTask()
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个任务吗？')) return
    if (isDemo) {
      router.back()
      return
    }
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (res.ok) {
        router.back()
      }
    } catch (error) {
      console.error('删除任务失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white/40">加载中...</div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-white/40">任务不存在</div>
        <Button variant="outline" onClick={() => router.back()}>
          返回看板
        </Button>
      </div>
    )
  }

  const statusStyle = statusColors[task.status]
  const priorityStyle = priorityStyles[task.priority]
  const subtaskProgress = task.subtasks && task.subtasks.length > 0
    ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
    : 0

  return (
    <div className="flex flex-col h-screen overflow-hidden relative z-10">
      <div className="flex-shrink-0 border-b border-white/[0.06] bg-white/[0.03] backdrop-blur-[8px] backdrop-saturate-[1.3]">
        <div className="flex items-center justify-between px-6 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            返回看板
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTaskFormOpen(true)}
              className="text-white/60 hover:text-white/90 hover:bg-white/[0.05]"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1.5" />
              编辑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              删除
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 py-6 h-full">
          <div className="flex gap-8 rounded-[14px] bg-white/[0.03] backdrop-blur-[8px] backdrop-saturate-[1.3] border border-white/[0.06] p-6 h-full">
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-start gap-3 mb-4">
                  <h1 className="text-xl font-semibold text-white/90 flex-1 leading-relaxed">
                    {task.title}
                  </h1>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap mb-4">
                  <span className={cn(
                    'px-3 py-1 rounded-[8px] text-xs font-medium border',
                    statusStyle.bg, statusStyle.text, statusStyle.border
                  )}>
                    {statusLabels[task.status]}
                  </span>
                  <span className={cn(
                    'px-3 py-1 rounded-[8px] text-xs font-medium border',
                    priorityStyle.bg, priorityStyle.text, priorityStyle.border
                  )}>
                    {priorityLabels[task.priority]}优先级
                  </span>

                  {task.tags && task.tags.length > 0 && task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-[6px] text-xs bg-white/[0.06] text-white/60 border border-white/[0.1]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {task.description && (
                  <div className="rounded-[12px] bg-white/[0.03] border border-white/[0.06] p-4">
                    <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
                      {task.description}
                    </p>
                  </div>
                )}
              </div>

              <Separator className="bg-white/[0.06] flex-shrink-0" />

              <div className="flex-shrink-0">
                <SubtaskList
                  taskId={task.id}
                  subtasks={task.subtasks || []}
                  onUpdate={handleSubtasksUpdate}
                  isDemo={isDemo}
                />
              </div>

              <Separator className="bg-white/[0.06] flex-shrink-0" />

              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                <DevLogList
                  taskId={task.id}
                  devLogs={task.devLogs || []}
                  onUpdate={handleDevLogsUpdate}
                  currentUser={task.assignee}
                  isDemo={isDemo}
                />
              </div>
            </div>

            <div className="w-64 flex-shrink-0 space-y-6 overflow-y-auto scrollbar-hide">
              <div className="rounded-[12px] bg-white/[0.03] border border-white/[0.06] p-4 space-y-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <User className="h-3.5 w-3.5" />
                    负责人
                  </div>
                  <div className="flex items-center gap-2.5 pl-5">
                    {task.assignee ? (
                      <>
                        <Avatar className="h-6 w-6 ring-1 ring-white/12">
                          <AvatarFallback className="text-[10px] bg-white/10 text-white/70">
                            {task.assignee.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-white/70">{task.assignee}</span>
                      </>
                    ) : (
                      <span className="text-sm text-white/30 pl-0.5">未指定</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Calendar className="h-3.5 w-3.5" />
                    截止日期
                  </div>
                  <div className="pl-5">
                    {task.dueDate ? (
                      <span className="text-sm text-white/70">{formatDate(task.dueDate)}</span>
                    ) : (
                      <span className="text-sm text-white/30">未设置</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Clock className="h-3.5 w-3.5" />
                    时间线
                  </div>
                  <div className="pl-5 space-y-1.5">
                    <div className="text-xs text-white/50">
                      创建: {formatDate(task.createdAt)}
                    </div>
                    <div className="text-xs text-white/50">
                      更新: {formatDate(task.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>

              {task.subtasks && task.subtasks.length > 0 && (
                <div className="rounded-[12px] bg-white/[0.03] border border-white/[0.06] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-white/40">完成进度</span>
                    <span className="text-sm font-medium text-white/70">{subtaskProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500 ease-out',
                        subtaskProgress === 100 ? 'bg-[#22d3ee]' : 'bg-[#4f8fff]'
                      )}
                      style={{ width: `${subtaskProgress}%` }}
                    />
                  </div>
                  <div className="mt-2 text-[11px] text-white/30">
                    {task.subtasks.filter(s => s.completed).length} / {task.subtasks.length} 子任务已完成
                  </div>
                </div>
              )}

              {task.devLogs && task.devLogs.length > 0 && (
                <div className="rounded-[12px] bg-white/[0.03] border border-white/[0.06] p-4">
                  <div className="text-xs text-white/40 mb-2">开发日志</div>
                  <div className="text-2xl font-semibold text-white/80">{task.devLogs.length}</div>
                  <div className="text-[11px] text-white/30">条记录</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TaskForm
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        task={task}
        onSubmit={handleTaskFormSubmit}
      />
    </div>
  )
}
