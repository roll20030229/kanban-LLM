'use client'

import { Task, TaskStatus } from '@/types'
import { TaskCard } from './task-card'
import { cn, statusLabels } from '@/lib/utils'
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
  dragOverInfo?: { overId: string; position: 'above' | 'below' } | null
}

const columnStyles: Record<TaskStatus, { 
  border: string; 
  indicator: string;
  headerBg: string;
  glassTint: string;
}> = {
  todo: {
    border: 'data-[isover=true]:border-[#4f8fff]/30 data-[isover=true]:shadow-[0_0_30px_rgba(79,143,255,0.08)]',
    indicator: 'bg-[#4f8fff]',
    headerBg: 'from-[#4f8fff]/8 to-transparent',
    glassTint: '',
  },
  in_progress: {
    border: 'data-[isover=true]:border-[#a855f7]/30 data-[isover=true]:shadow-[0_0_30px_rgba(168,85,247,0.08)]',
    indicator: 'bg-[#a855f7]',
    headerBg: 'from-[#a855f7]/8 to-transparent',
    glassTint: '',
  },
  in_review: {
    border: 'data-[isover=true]:border-[#f59e0b]/30 data-[isover=true]:shadow-[0_0_30px_rgba(245,158,11,0.08)]',
    indicator: 'bg-[#f59e0b]',
    headerBg: 'from-[#f59e0b]/8 to-transparent',
    glassTint: '',
  },
  done: {
    border: 'data-[isover=true]:border-[#22d3ee]/30 data-[isover=true]:shadow-[0_0_30px_rgba(34,211,238,0.08)]',
    indicator: 'bg-[#22d3ee]',
    headerBg: 'from-[#22d3ee]/8 to-transparent',
    glassTint: '',
  },
}

export function Column({
  status,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  readOnly,
  dragOverInfo,
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
    transition: 'transform 300ms cubic-bezier(0.2, 0, 0, 1)',
    backgroundColor: 'transparent',
  }

  const columnStyle = columnStyles[status]

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-isover={isOver}
      className={cn(
        'flex-shrink-0 w-72 md:w-80 rounded-[14px] flex flex-col max-h-full border',
        'backdrop-blur-[8px] backdrop-saturate-[1.3]',
        'bg-white/[0.03] border-white/[0.06]',
        columnStyle.glassTint,
        columnStyle.border,
        isOver && 'ring-2 ring-white/10 ring-offset-2 ring-offset-black'
      )}
    >
      <div className={cn(
        'p-3.5 border-b border-white/[0.06] relative overflow-hidden',
        columnStyle.headerBg
      )}>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              'w-2.5 h-2.5 rounded-full',
              columnStyle.indicator,
              'opacity-70'
            )} />
            <h3 className="font-medium text-white/90 text-sm">{statusLabels[status]}</h3>
            <span className="text-xs text-white/40 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06] font-normal">
              {tasks.length}
            </span>
          </div>
          {!readOnly && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-white/6"
              onClick={() => onAddTask?.()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div
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
              dragPosition={dragOverInfo?.overId === task.id ? dragOverInfo.position : null}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-white/25 text-sm border border-dashed border-white/[0.06] rounded-[10px] bg-white/[0.01]">
            暂无任务
          </div>
        )}
      </div>
    </div>
  )
}
