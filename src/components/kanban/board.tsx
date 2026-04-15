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
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useState, useCallback } from 'react'
import { TaskCard } from './task-card'

const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done']

interface DragOverInfo {
  overId: string
  position: 'above' | 'below'
}

interface KanbanBoardProps {
  tasks: Task[]
  onTaskStatusChange?: (taskId: string, newStatus: TaskStatus) => void
  onTaskReorder?: (reorderData: { id: string; order: number; status: string; version: number }[]) => void
  onAddTask?: (status: TaskStatus) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
  readOnly?: boolean
  isDemo?: boolean
}

export function KanbanBoard({
  tasks,
  onTaskStatusChange,
  onTaskReorder,
  onAddTask,
  onEditTask,
  onDeleteTask,
  readOnly,
  isDemo,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [dragOverInfo, setDragOverInfo] = useState<DragOverInfo | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
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

    if (isOverColumn) {
      if (activeTask.status !== overId) {
        onTaskStatusChange?.(activeId, overId as TaskStatus)
      }
      setDragOverInfo(null)
      return
    }

    const overTask = tasks.find((t) => t.id === overId)
    if (overTask) {
      if (activeTask.status !== overTask.status) {
        onTaskStatusChange?.(activeId, overTask.status)
      }

      const overRect = over.rect
      const activeTranslatedRect = active.rect.current.translated
      if (overRect && activeTranslatedRect) {
        const overMidY = overRect.top + overRect.height / 2
        const activeMidY = activeTranslatedRect.top + activeTranslatedRect.height / 2
        const position = activeMidY < overMidY ? 'above' : 'below'
        setDragOverInfo({ overId, position })
      }
    } else {
      setDragOverInfo(null)
    }
  }, [tasks, onTaskStatusChange])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    setDragOverInfo(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    const isOverColumn = STATUS_ORDER.includes(overId as TaskStatus)

    if (isOverColumn) {
      const targetStatus = overId as TaskStatus
      if (activeTask.status === targetStatus) return

      onTaskStatusChange?.(activeId, targetStatus)

      const targetColumnTasks = tasks
        .filter(t => t.status === targetStatus)
        .sort((a, b) => a.order - b.order)

      const newColumnTasks = [...targetColumnTasks, { ...activeTask, status: targetStatus }]

      const reorderData = newColumnTasks.map((task, index) => ({
        id: task.id,
        order: index,
        status: task.status,
        version: task.version,
      }))

      onTaskReorder?.(reorderData)
      return
    }

    const overTask = tasks.find((t) => t.id === overId)
    if (!overTask) return

    const overRect = over.rect
    const activeTranslatedRect = active.rect.current.translated
    let insertAfter = false
    if (overRect && activeTranslatedRect) {
      const overMidY = overRect.top + overRect.height / 2
      const activeMidY = activeTranslatedRect.top + activeTranslatedRect.height / 2
      insertAfter = activeMidY >= overMidY
    }

    if (activeTask.status !== overTask.status) {
      onTaskStatusChange?.(activeId, overTask.status)

      const targetColumnTasks = tasks
        .filter(t => t.status === overTask.status)
        .sort((a, b) => a.order - b.order)

      const overIndex = targetColumnTasks.findIndex(t => t.id === overId)
      const insertIndex = insertAfter ? overIndex + 1 : overIndex

      const newColumnTasks = [...targetColumnTasks]
      newColumnTasks.splice(insertIndex, 0, { ...activeTask, status: overTask.status })

      const reorderData = newColumnTasks.map((task, index) => ({
        id: task.id,
        order: index,
        status: task.status,
        version: task.version,
      }))

      onTaskReorder?.(reorderData)
    } else {
      const columnTasks = tasks.filter(t => t.status === activeTask.status).sort((a, b) => a.order - b.order)
      const oldIndex = columnTasks.findIndex(t => t.id === activeId)
      const overIndex = columnTasks.findIndex(t => t.id === overId)

      if (oldIndex !== -1 && overIndex !== -1) {
        const newColumnTasks = [...columnTasks]
        newColumnTasks.splice(oldIndex, 1)

        const adjustedOverIndex = newColumnTasks.findIndex(t => t.id === overId)
        const insertIndex = insertAfter ? adjustedOverIndex + 1 : adjustedOverIndex

        newColumnTasks.splice(insertIndex, 0, activeTask)

        const reorderData = newColumnTasks.map((task, index) => ({
          id: task.id,
          order: index,
          status: task.status,
          version: task.version,
        }))

        onTaskReorder?.(reorderData)
      }
    }
  }, [tasks, onTaskStatusChange, onTaskReorder])

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.order - b.order)
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
            dragOverInfo={dragOverInfo}
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
            dragOverInfo={dragOverInfo}
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
