'use client'

import { Task, TaskStatus } from '@/types'
import { Column } from './column'
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  closestCenter,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  CollisionDetection,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useState, useCallback, useEffect, useRef } from 'react'
import { TaskCard } from './task-card'

const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done']

const kanbanCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args)
  const pointerOverTask = pointerCollisions.filter(
    (c) => !STATUS_ORDER.includes(c.id as TaskStatus) && !(c.id as string).endsWith('-content')
  )
  if (pointerOverTask.length > 0) {
    return pointerOverTask
  }

  const pointerOverColumn = pointerCollisions.filter((c) =>
    STATUS_ORDER.includes(c.id as TaskStatus) || (c.id as string).endsWith('-content')
  )
  if (pointerOverColumn.length > 0) {
    return pointerOverColumn
  }

  const rectCollisions = rectIntersection(args)
  if (rectCollisions.length > 0) {
    return rectCollisions
  }

  return closestCenter(args)
}

function getColumnStatusFromId(id: string): TaskStatus | null {
  if (STATUS_ORDER.includes(id as TaskStatus)) return id as TaskStatus
  if (id.endsWith('-content')) {
    const status = id.replace('-content', '') as TaskStatus
    if (STATUS_ORDER.includes(status)) return status
  }
  return null
}

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
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks)
  const localTasksRef = useRef<Task[]>(tasks)
  const isDraggingRef = useRef(false)

  const updateLocalTasks = useCallback((updater: (prev: Task[]) => Task[]) => {
    setLocalTasks(prev => {
      const next = updater(prev)
      localTasksRef.current = next
      return next
    })
  }, [])

  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalTasks(tasks)
      localTasksRef.current = tasks
    }
  }, [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    isDraggingRef.current = true
    const task = localTasksRef.current.find((t) => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    const overColumnStatus = getColumnStatusFromId(overId)

    updateLocalTasks(prev => {
      const activeTaskData = prev.find((t) => t.id === activeId)
      if (!activeTaskData) return prev

      if (overColumnStatus) {
        if (activeTaskData.status !== overColumnStatus) {
          return prev.map(t =>
            t.id === activeId ? { ...t, status: overColumnStatus } : t
          )
        }
        return prev
      }

      const overTask = prev.find((t) => t.id === overId)
      if (overTask && activeTaskData.status !== overTask.status) {
        return prev.map(t =>
          t.id === activeId ? { ...t, status: overTask.status } : t
        )
      }

      return prev
    })

    const currentTasks = localTasksRef.current

    if (!overColumnStatus) {
      const overTask = currentTasks.find((t) => t.id === overId)
      if (overTask) {
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
    } else {
      setDragOverInfo(null)
    }
  }, [updateLocalTasks])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    setDragOverInfo(null)
    isDraggingRef.current = false

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const currentTasks = localTasksRef.current
    const activeTaskData = currentTasks.find((t) => t.id === activeId)
    if (!activeTaskData) return

    const overColumnStatus = getColumnStatusFromId(overId)

    let reorderData: { id: string; order: number; status: string; version: number }[] = []
    let statusChanged = false
    let newStatus: TaskStatus | null = null

    if (overColumnStatus) {
      const targetStatus = overColumnStatus
      statusChanged = activeTaskData.status !== targetStatus
      newStatus = targetStatus

      const targetColumnTasks = currentTasks
        .filter(t => t.status === targetStatus)
        .sort((a, b) => a.order - b.order)

      const overRect = over.rect
      const activeTranslatedRect = active.rect.current.translated
      let insertIndex = targetColumnTasks.length

      if (overRect && activeTranslatedRect && targetColumnTasks.length > 0) {
        const overMidY = overRect.top + overRect.height / 2
        const activeMidY = activeTranslatedRect.top + activeTranslatedRect.height / 2
        const insertAfter = activeMidY >= overMidY

        if (insertAfter) {
          insertIndex = targetColumnTasks.length
        } else {
          insertIndex = 0
        }
      }

      const newColumnTasks = [...targetColumnTasks]
      newColumnTasks.splice(insertIndex, 0, { ...activeTaskData, status: targetStatus })

      reorderData = newColumnTasks.map((task, index) => ({
        id: task.id,
        order: index,
        status: task.status,
        version: task.version,
      }))
    } else {
      const overTask = currentTasks.find((t) => t.id === overId)
      if (!overTask) return

      const overRect = over.rect
      const activeTranslatedRect = active.rect.current.translated
      let insertAfter = false
      if (overRect && activeTranslatedRect) {
        const overMidY = overRect.top + overRect.height / 2
        const activeMidY = activeTranslatedRect.top + activeTranslatedRect.height / 2
        insertAfter = activeMidY >= overMidY
      }

      if (activeTaskData.status !== overTask.status) {
        statusChanged = true
        newStatus = overTask.status
      }

      const targetColumnTasks = currentTasks
        .filter(t => t.status === overTask.status)
        .sort((a, b) => a.order - b.order)

      const overIndex = targetColumnTasks.findIndex(t => t.id === overId)
      const insertIndex = insertAfter ? overIndex + 1 : overIndex

      const newColumnTasks = [...targetColumnTasks]
      newColumnTasks.splice(insertIndex, 0, { ...activeTaskData, status: overTask.status })

      reorderData = newColumnTasks.map((task, index) => ({
        id: task.id,
        order: index,
        status: task.status,
        version: task.version,
      }))
    }

    if (reorderData.length > 0) {
      onTaskReorder?.(reorderData)
    }
  }, [onTaskReorder])

  const getTasksByStatus = useCallback((status: TaskStatus) => {
    return localTasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.order - b.order)
  }, [localTasks])

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
      collisionDetection={kanbanCollisionDetection}
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

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <TaskCard task={activeTask} isDragging readOnly />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
