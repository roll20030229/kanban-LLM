'use client'

import { Task, TaskStatus } from '@/types'
import { Column } from './column'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useState, useCallback } from 'react'
import { TaskCard } from './task-card'

const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done']

interface KanbanBoardProps {
  tasks: Task[]
  onTaskStatusChange?: (taskId: string, newStatus: TaskStatus) => void
  onAddTask?: (status: TaskStatus) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
  readOnly?: boolean
}

export function KanbanBoard({
  tasks,
  onTaskStatusChange,
  onAddTask,
  onEditTask,
  onDeleteTask,
  readOnly,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }, [tasks])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    const isOverColumn = STATUS_ORDER.includes(overId as TaskStatus)
    if (isOverColumn && activeTask.status !== overId) {
      onTaskStatusChange?.(activeId, overId as TaskStatus)
    }
  }, [tasks, onTaskStatusChange])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    const overTask = tasks.find((t) => t.id === overId)
    
    // 跨列拖拽
    if (overTask && activeTask.status !== overTask.status) {
      onTaskStatusChange?.(activeId, overTask.status)
      
      try {
        // 获取目标列的所有任务并重新计算顺序
        const targetColumnTasks = tasks
          .filter(t => t.status === overTask.status)
          .sort((a, b) => a.order - b.order)
        
        const overIndex = targetColumnTasks.findIndex(t => t.id === overId)
        
        // 重新计算整列的顺序（使用整数序列）
        const newColumnTasks = [...targetColumnTasks]
        newColumnTasks.splice(overIndex, 0, { ...activeTask, status: overTask.status })
        
        const reorderData = newColumnTasks.map((task, index) => ({
          id: task.id,
          order: index,
          status: task.status,
          version: task.version, // 添加版本号
        }))
        
        const response = await fetch(`/api/projects/${activeTask.projectId}/tasks/reorder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tasks: reorderData }),
        })

        if (response.status === 409) {
          const errorData = await response.json()
          console.error('版本冲突:', errorData.error)
          // 提示用户刷新页面
          alert('任务已被其他用户修改，页面将自动刷新')
          window.location.reload()
          return
        }

        if (!response.ok) {
          throw new Error('保存任务状态失败')
        }
      } catch (error) {
        console.error('保存任务状态失败:', error)
        alert('保存失败，请重试')
      }
    }
    // 同列排序
    else if (overTask && activeTask.status === overTask.status) {
      try {
        const columnTasks = tasks.filter(t => t.status === activeTask.status).sort((a, b) => a.order - b.order)
        const oldIndex = columnTasks.findIndex(t => t.id === activeId)
        const newIndex = columnTasks.findIndex(t => t.id === overId)
        
        if (oldIndex !== -1 && newIndex !== -1) {
          // 重新排序
          const newColumnTasks = [...columnTasks]
          newColumnTasks.splice(oldIndex, 1)
          newColumnTasks.splice(newIndex, 0, activeTask)
          
          // 批量更新顺序
          const reorderData = newColumnTasks.map((task, index) => ({
            id: task.id,
            order: index,
            status: task.status,
            version: task.version, // 添加版本号
          }))
          
          const response = await fetch(`/api/projects/${activeTask.projectId}/tasks/reorder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tasks: reorderData }),
          })

          if (response.status === 409) {
            const errorData = await response.json()
            console.error('版本冲突:', errorData.error)
            // 提示用户刷新页面
            alert('任务已被其他用户修改，页面将自动刷新')
            window.location.reload()
            return
          }

          if (!response.ok) {
            throw new Error('保存任务顺序失败')
          }
        }
      } catch (error) {
        console.error('保存任务顺序失败:', error)
        alert('保存失败，请重试')
      }
    }
  }, [tasks, onTaskStatusChange])

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status)
  }

  if (readOnly) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {STATUS_ORDER.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={getTasksByStatus(status)}
            onEditTask={onEditTask}
            readOnly={readOnly}
          />
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {STATUS_ORDER.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={getTasksByStatus(status)}
            onAddTask={() => onAddTask?.(status)}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            readOnly={readOnly}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} isDragging readOnly />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
