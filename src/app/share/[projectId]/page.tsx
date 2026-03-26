'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { KanbanBoard } from '@/components/kanban'
import { Task, Project, Milestone } from '@/types'
import { cn } from '@/lib/utils'
import { CheckCircle, Circle } from 'lucide-react'

export default function SharePage() {
  const params = useParams()
  const shareLink = params.shareLink as string

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectRes = await fetch(`/api/share/${shareLink}`)
        if (!projectRes.ok) {
          setError('项目不存在或链接已失效')
          return
        }
        const projectData = await projectRes.json()
        setProject(projectData)

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
    }

    fetchData()
  }, [shareLink])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
        </div>
      </div>
    )
  }

  const completedMilestones = project?.milestones?.filter((m) => m.completed).length || 0
  const totalMilestones = project?.milestones?.length || 0

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            {project?.name}
          </h1>
          {project?.description && (
            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
          )}
        </div>
      </header>

      {project?.milestones && project.milestones.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              项目里程碑 ({completedMilestones}/{totalMilestones})
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {project.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border',
                    milestone.completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  )}
                >
                  {milestone.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{milestone.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(milestone.date).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="p-4">
        <div className="max-w-full overflow-hidden">
          <KanbanBoard tasks={tasks} readOnly />
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden">
        <div className="flex justify-around">
          <div className="text-center">
            <p className="text-lg font-semibold">{tasks.length}</p>
            <p className="text-xs text-gray-500">总任务</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-todo">
              {tasks.filter((t) => t.status === 'todo').length}
            </p>
            <p className="text-xs text-gray-500">待办</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-done">
              {tasks.filter((t) => t.status === 'done').length}
            </p>
            <p className="text-xs text-gray-500">已完成</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
