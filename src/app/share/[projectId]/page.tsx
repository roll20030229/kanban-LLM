'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { KanbanBoard } from '@/components/kanban'
import { Task, Project, Milestone } from '@/types'
import { cn } from '@/lib/utils'
import { CheckCircle, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SharePage() {
  const params = useParams()
  const shareLink = params.shareLink as string

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requiresPassword, setRequiresPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const fetchTasks = useCallback(async (pwd?: string) => {
    try {
      const projectRes = await fetch(`/api/share/${shareLink}`)
      if (!projectRes.ok) {
        const errorData = await projectRes.json()
        setError(errorData.error || '项目不存在或链接已失效')
        return
      }
      const projectData = await projectRes.json()
      setProject(projectData)

      if (pwd) {
        const verifyRes = await fetch(`/api/share/${shareLink}/verify-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pwd }),
        })

        if (!verifyRes.ok) {
          const errorData = await verifyRes.json()
          if (errorData.error === '访问密码错误') {
            setPasswordError('密码错误，请重新输入')
            setRequiresPassword(true)
          } else if (errorData.error === '分享链接已过期' || errorData.error === '分享链接访问次数已达上限') {
            setError(errorData.error)
          }
          return
        }
      }
      
      const tasksRes = await fetch(`/api/share/${shareLink}/tasks`)
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setTasks(tasksData)
      }
    } catch (err) {
      setError('加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [shareLink])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handlePasswordSubmit = async () => {
    setPasswordError('')
    setLoading(true)
    await fetchTasks(password)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative z-10 text-white/30 text-sm">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative z-10 text-center">
          <p className="text-red-400 mb-4 text-lg">{error}</p>
        </div>
      </div>
    )
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="w-full max-w-md p-8 bg-white/[0.03] backdrop-blur-[30px] rounded-[16px] border border-white/[0.08] shadow-[0_12px_48px_rgba(0,0,0,0.3)] relative z-10 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.12] before:to-transparent">
          <h2 className="text-2xl font-bold text-center mb-6 text-white/90 tracking-tight">请输入访问密码</h2>
          <div className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="请输入密码"
            />
            {passwordError && (
              <p className="text-red-400 text-sm">{passwordError}</p>
            )}
            <Button
              onClick={handlePasswordSubmit}
              className="w-full"
            >
              确认
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const completedMilestones = project?.milestones?.filter((m) => m.completed).length || 0
  const totalMilestones = project?.milestones?.length || 0

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />
      
      <header className="bg-black/60 backdrop-blur-[30px] border-b border-white/[0.05] px-4 py-3 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold text-white/90 tracking-tight">
            {project?.name}
          </h1>
          {project?.description && (
            <p className="text-sm text-white/35 mt-1">{project.description}</p>
          )}
        </div>
      </header>

      {project?.milestones && project.milestones.length > 0 && (
        <div className="bg-black/40 backdrop-blur-[20px] border-b border-white/[0.04] px-4 py-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-sm font-medium text-white/45 mb-3">
              项目里程碑 ({completedMilestones}/{totalMilestones})
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {project.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-[10px] border transition-all duration-300',
                    milestone.completed
                      ? 'bg-emerald-500/[0.06] border-emerald-500/[0.15]'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.10]'
                  )}
                >
                  {milestone.completed ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Circle className="h-4 w-4 text-white/25" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white/80">{milestone.title}</p>
                    <p className="text-xs text-white/30">
                      {new Date(milestone.date).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="p-4 relative z-10">
        <div className="max-w-full overflow-hidden">
          <KanbanBoard tasks={tasks} readOnly />
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-[30px] border-t border-white/[0.05] px-4 py-2 md:hidden z-20">
        <div className="flex justify-around">
          <div className="text-center">
            <p className="text-lg font-semibold text-white/85">{tasks.length}</p>
            <p className="text-xs text-white/30">总任务</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-white/80">
              {tasks.filter((t) => t.status === 'todo').length}
            </p>
            <p className="text-xs text-white/30">待办</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-white/80">
              {tasks.filter((t) => t.status === 'in_progress').length}
            </p>
            <p className="text-xs text-white/30">进行中</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-white/80">
              {tasks.filter((t) => t.status === 'done').length}
            </p>
            <p className="text-xs text-white/30">已完成</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
