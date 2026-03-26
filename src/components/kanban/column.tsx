'use client'

import { Task, TaskStatus } from '@/types'
import { TaskCard } from './task-card'
import { cn, statusColors, statusLabels } from '@/lib/utils'
import { Plus } from 'lucide-react'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'

interface ColumnProps {
  status: TaskStatus
  tasks: Task[]
  onAddTask?: () => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
  readOnly?: boolean
}

export function Column({
  status,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  readOnly,
}: ColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isOver,
  } = useSortable({
    id: status,
    data: {
      type: 'column',
      status,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'flex-shrink-0 w-72 md:w-80 bg-gray-50 rounded-lg flex flex-col max-h-full',
        isOver && 'ring-2 ring-primary ring-opacity-50'
      )}
    >
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-full', statusColors[status])} />
            <h3 className="font-medium text-gray-900">{statusLabels[status]}</h3>
            <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
          {!readOnly && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onAddTask}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div
        {...listeners}
        className="flex-1 p-2 space-y-2 overflow-y-auto scrollbar-hide min-h-[200px]"
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onEditTask?.(task)}
              onDelete={() => onDeleteTask?.(task.id)}
              readOnly={readOnly}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
            暂无任务
          </div>
        )}
      </div>
    </div>
  )
}
