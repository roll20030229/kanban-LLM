'use client'

import { useState, useEffect, useCallback } from 'react'
import { KanbanBoard } from '@/components/kanban'
import { Header, TaskForm, AIConfigDialog } from '@/components/dashboard'
import { AIAssistant } from '@/components/dashboard/ai-assistant'
import { Task, TaskStatus } from '@/types'
import { useProject } from '@/contexts/project-context'

const demoTasks: Task[] = [
  {
    id: '1',
    projectId: 'demo',
    title: '设计用户界面原型',
    description: '完成首页和看板页面的 UI 设计',
    status: 'todo',
    priority: 'high',
    assignee: '张三',
    dueDate: new Date('2024-04-15'),
    tags: ['设计', 'UI'],
    order: 0,
    version: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    projectId: 'demo',
    title: '实现拖拽功能',
    description: '使用@dnd-kit 实现任务拖拽',
    status: 'in_progress',
    priority: 'high',
    assignee: '李四',
    tags: ['开发'],
    order: 0,
    version: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    projectId: 'demo',
    title: '编写 API 文档',
    description: '完善 API 接口文档',
    status: 'in_review',
    priority: 'medium',
    assignee: '王五',
    tags: ['文档'],
    order: 0,
    version: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    projectId: 'demo',
    title: '项目初始化',
    description: '创建 Next.js 项目并配置基础依赖',
    status: 'done',
    priority: 'high',
    assignee: '张三',
    tags: ['开发'],
    order: 0,
    version: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    projectId: 'demo',
    title: '数据库设计',
    description: '设计 MongoDB 数据模型',
    status: 'done',
    priority: 'medium',
    assignee: '李四',
    tags: ['数据库'],
    order: 1,
    version: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function KanbanPage() {
  const { currentProject, loading: projectLoading } = useProject()
  const [tasks, setTasks] = useState<Task[]>(demoTasks)
  const [loading, setLoading] = useState(true)
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo')
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isDemo, setIsDemo] = useState(false)
  const [aiOpen, setAIOpen] = useState(false)
  const [aiConfigOpen, setAIConfigOpen] = useState(false)
  const [aiEnabled, setAIEnabled] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })
  const [hasMore, setHasMore] = useState(true)

  const fetchTasks = useCallback(async (page = 1, append = false) => {
    if (!currentProject) {
      setIsDemo(true)
      setLoading(false)
      return
    }
    
    setIsDemo(false)
    try {
      const res = await fetch(`/api/projects/${currentProject._id}/tasks?page=${page}&limit=50`)
      if (res.ok) {
        const data = await res.json()
        const newTasks = data.tasks.length > 0 ? data.tasks : demoTasks
        setTasks(prevTasks => append ? [...prevTasks, ...newTasks] : newTasks)
        setPagination(data.pagination)
        setHasMore(data.pagination.page < data.pagination.totalPages)
      }
    } catch (error) {
      console.error('获取任务失败:', error)
      setTasks(demoTasks)
    } finally {
      setLoading(false)
    }
  }, [currentProject])

  const checkAIConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/config')
      if (res.ok) {
        const data = await res.json()
        setAIEnabled(data.enabled)
      }
    } catch (error) {
      setAIEnabled(false)
    }
  }, [])

  const handleOpenAI = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/config')
      if (res.ok) {
        const data = await res.json()
        if (data.enabled) {
          setAIOpen(true)
        } else {
          setAIConfigOpen(true)
        }
      } else {
        setAIConfigOpen(true)
      }
    } catch (error) {
      setAIConfigOpen(true)
    }
  }, [])

  const handleAIConfigured = useCallback(() => {
    setAIEnabled(true)
    setAIOpen(true)
  }, [])

  useEffect(() => {
    checkAIConfig()
  }, [checkAIConfig])

  useEffect(() => {
    if (!projectLoading) {
      fetchTasks()
    }
  }, [fetchTasks, projectLoading])

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (isDemo || !currentProject) {
      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
      return
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('更新任务状态失败:', error)
    }
  }

  const handleTaskReorder = async (reorderData: { id: string; order: number; status: string; version: number }[]) => {
    if (isDemo || !currentProject) {
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task => {
          const reorderItem = reorderData.find(item => item.id === task.id)
          if (reorderItem) {
            return { ...task, order: reorderItem.order, status: reorderItem.status as TaskStatus }
          }
          return task
        })
        return updatedTasks
      })
      return
    }

    try {
      const response = await fetch(`/api/projects/${currentProject._id}/tasks/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: reorderData }),
      })

      if (response.status === 409) {
        const errorData = await response.json()
        console.error('版本冲突:', errorData.error)
        alert('任务已被其他用户修改，页面将自动刷新')
        window.location.reload()
        return
      }

      if (!response.ok) {
        throw new Error('保存任务顺序失败')
      }

      fetchTasks()
    } catch (error) {
      console.error('保存任务顺序失败:', error)
      alert('保存失败，请重试')
    }
  }

  const handleAddTask = (status: TaskStatus) => {
    setSelectedTask(null)
    setDefaultStatus(status)
    setTaskFormOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setTaskFormOpen(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('确定要删除这个任务吗？')) return
    
    if (isDemo || !currentProject) {
      setTasks(tasks.filter(t => t.id !== taskId))
      return
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('删除任务失败:', error)
    }
  }

  const handleTaskFormSubmit = async (data: any) => {
    if (isDemo || !currentProject) {
      if (selectedTask) {
        setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, ...data } : t))
      } else {
        const newTask: Task = {
          id: Date.now().toString(),
          projectId: 'demo',
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          assignee: data.assignee,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          tags: data.tags,
          order: 0,
          version: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setTasks([...tasks, newTask])
      }
      return
    }

    const url = selectedTask
      ? `/api/tasks/${selectedTask.id}`
      : `/api/projects/${currentProject._id}/tasks`
    const method = selectedTask ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: '操作失败' }))
      throw new Error(errorData.error || '操作失败，请重试')
    }

    fetchTasks()
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilter = (filter: string) => {
    setPriorityFilter(filter)
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesPriority =
      priorityFilter === 'all' || task.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  const members = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean))) as string[]

  if (projectLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen relative z-10 bg-transparent">
      {isDemo && (
        <div className="bg-warning/10 border-b border-warning/30 px-4 py-2 text-center text-sm text-warning backdrop-blur-sm">
          演示模式 - 数据仅保存在内存中，刷新后重置。请创建项目以使用完整功能。
        </div>
      )}
      <Header
        projectName={currentProject?.name || '演示项目'}
        onNewTask={() => handleAddTask('todo')}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onOpenAI={handleOpenAI}
      />
      
      <div className="flex-1 p-4 overflow-hidden bg-transparent">
        <KanbanBoard
          tasks={filteredTasks}
          onTaskStatusChange={handleTaskStatusChange}
          onTaskReorder={handleTaskReorder}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          isDemo={isDemo}
        />
      </div>

      <TaskForm
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        task={selectedTask}
        defaultStatus={defaultStatus}
        onSubmit={handleTaskFormSubmit}
        members={members}
      />

      <AIAssistant
        open={aiOpen}
        onOpenChange={setAIOpen}
        projectId={currentProject?._id || null}
        onTaskCreated={fetchTasks}
        members={members}
        tasks={tasks}
        projectName={currentProject?.name || '演示项目'}
      />

      <AIConfigDialog
        open={aiConfigOpen}
        onOpenChange={setAIConfigOpen}
        onConfigured={handleAIConfigured}
      />
    </div>
  )
}
