'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { KanbanBoard } from '@/components/kanban'
import { Header, TaskForm } from '@/components/dashboard'
import { AIAssistant } from '@/components/dashboard/ai-assistant'
import { Task, TaskStatus } from '@/types'

const demoTasks: Task[] = [
  {
    id: '1',
    projectId: 'demo',
    title: '设计用户界面原型',
    description: '完成首页和看板页面的UI设计',
    status: 'todo',
    priority: 'high',
    assignee: '张三',
    dueDate: new Date('2024-04-15'),
    tags: ['设计', 'UI'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    projectId: 'demo',
    title: '实现拖拽功能',
    description: '使用@dnd-kit实现任务拖拽',
    status: 'in_progress',
    priority: 'high',
    assignee: '李四',
    tags: ['开发'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    projectId: 'demo',
    title: '编写API文档',
    description: '完善API接口文档',
    status: 'in_review',
    priority: 'medium',
    assignee: '王五',
    tags: ['文档'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    projectId: 'demo',
    title: '项目初始化',
    description: '创建Next.js项目并配置基础依赖',
    status: 'done',
    priority: 'high',
    assignee: '张三',
    tags: ['开发'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    projectId: 'demo',
    title: '数据库设计',
    description: '设计MongoDB数据模型',
    status: 'done',
    priority: 'medium',
    assignee: '李四',
    tags: ['数据库'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function KanbanPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>(demoTasks)
  const [loading, setLoading] = useState(true)
  const [projectName, setProjectName] = useState('演示项目')
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo')
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isDemo, setIsDemo] = useState(false)
  const [aiOpen, setAIOpen] = useState(false)
  const [aiEnabled, setAIEnabled] = useState(true)

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const projects = await res.json()
        if (projects.length > 0) {
          setCurrentProjectId(projects[0]._id)
          setProjectName(projects[0].name)
          setIsDemo(false)
        } else {
          setIsDemo(true)
        }
      } else if (res.status === 401) {
        setIsDemo(true)
      } else {
        setIsDemo(true)
      }
    } catch (error) {
      console.error('获取项目失败，使用演示模式:', error)
      setIsDemo(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTasks = useCallback(async () => {
    if (!currentProjectId || isDemo) return
    
    try {
      const res = await fetch(`/api/projects/${currentProjectId}/tasks`)
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('获取任务失败:', error)
    }
  }, [currentProjectId, isDemo])

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

  useEffect(() => {
    fetchProjects()
    checkAIConfig()
  }, [fetchProjects, checkAIConfig])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (isDemo) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
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
    
    if (isDemo) {
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
    if (isDemo) {
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
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setTasks([...tasks, newTask])
      }
      return
    }

    if (!currentProjectId) return

    const url = selectedTask
      ? `/api/tasks/${selectedTask.id}`
      : `/api/projects/${currentProjectId}/tasks`
    const method = selectedTask ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      fetchTasks()
    }
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

  const members = [...new Set(tasks.map(t => t.assignee).filter(Boolean))] as string[]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {isDemo && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center text-sm text-yellow-800">
          演示模式 - 数据仅保存在内存中，刷新后重置。请配置MongoDB以使用完整功能。
        </div>
      )}
      <Header
        projectName={projectName}
        onNewTask={() => handleAddTask('todo')}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onOpenAI={() => setAIOpen(true)}
        aiEnabled={aiEnabled}
      />
      
      <div className="flex-1 p-4 overflow-hidden">
        <KanbanBoard
          tasks={filteredTasks}
          onTaskStatusChange={handleTaskStatusChange}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>

      <TaskForm
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        task={selectedTask}
        defaultStatus={defaultStatus}
        onSubmit={handleTaskFormSubmit}
      />

      <AIAssistant
        open={aiOpen}
        onOpenChange={setAIOpen}
        projectId={currentProjectId}
        onTaskCreated={fetchTasks}
        members={members}
        tasks={tasks}
        projectName={projectName}
      />
    </div>
  )
}
