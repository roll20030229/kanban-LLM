'use client'

import { Task, TaskStatus } from '@/types'
import { cn, statusLabels, priorityLabels } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, MoreHorizontal, GripVertical } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TaskCardProps {
  task: Task
  onClick?: () => void
  onDelete?: () => void
  isDragging?: boolean
  readOnly?: boolean
  dragPosition?: 'above' | 'below' | null
}

const statusStyles: Record<TaskStatus, { border: string; indicator: string }> = {
  todo: {
    border: 'border-l-[#4f8fff]/40',
    indicator: 'bg-[#4f8fff]',
  },
  in_progress: {
    border: 'border-l-[#a855f7]/40',
    indicator: 'bg-[#a855f7]',
  },
  in_review: {
    border: 'border-l-[#f59e0b]/40',
    indicator: 'bg-[#f59e0b]',
  },
  done: {
    border: 'border-l-[#22d3ee]/40',
    indicator: 'bg-[#22d3ee]',
  },
}

export function TaskCard({ task, onClick, onDelete, isDragging, readOnly, dragPosition }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
    disabled: readOnly,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const statusStyle = statusStyles[task.status]

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="article"
      tabIndex={undefined}
      className={cn(
        'group rounded-[12px] border border-white/12 p-3.5 transition-all duration-300 relative overflow-hidden',
        'bg-[#111118]',
        'hover:bg-[#181822] hover:border-white/18',
        'shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]',
        'border-l-2',
        statusStyle.border,
        isDragging && 'shadow-[0_20px_60px_rgba(0,0,0,0.5)] scale-[1.02] bg-[#181822]',
        readOnly && 'cursor-default'
      )}
    >
      {dragPosition === 'above' && (
        <div className="absolute top-0 left-2 right-2 h-[2px] bg-[#4f8fff] rounded-full shadow-[0_0_8px_rgba(79,143,255,0.6)]" />
      )}
      {dragPosition === 'below' && (
        <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4f8fff] rounded-full shadow-[0_0_8px_rgba(79,143,255,0.6)]" />
      )}
      <div className="flex items-start gap-2.5">
        {!readOnly && (
          <div 
            {...listeners}
            className="flex-shrink-0 mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:scale-110"
          >
            <GripVertical className="h-4 w-4 text-white/60" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 
              className="text-sm font-medium text-white/90 line-clamp-2 flex-1 cursor-pointer hover:text-white transition-colors"
              onClick={handleClick}
            >
              {task.title}
            </h4>
            {!readOnly && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0 hover:bg-white/10"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onClick}>编辑</DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-400 focus:text-red-400"
                    onClick={handleDelete}
                  >
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-white/35 mt-1.5 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span
              className={cn(
                'px-2 py-0.5 rounded-md text-xs font-medium border backdrop-blur-sm',
                task.priority === 'high' 
                  ? 'bg-red-500/10 text-red-400 border-red-500/15' 
                  : task.priority === 'low'
                  ? 'bg-white/[0.04] text-white/45 border-white/8'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/15'
              )}
            >
              {priorityLabels[task.priority]}
            </span>

            {task.tags && task.tags.length > 0 && (
                <div className="flex gap-1">
                  {task.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-white/[0.05] text-white/65 border border-white/8 rounded-md text-xs backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                  {task.tags.length > 2 && (
                    <span className="text-xs text-white/30">+{task.tags.length - 2}</span>
                  )}
                </div>
              )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.04]">
            <div className="flex items-center gap-2">
              {task.assignee ? (
                <Avatar className="h-6 w-6 ring-1 ring-white/12">
                  <AvatarFallback className="text-xs bg-white/10 text-white/70 text-[10px]">
                    {task.assignee.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-white/[0.03] text-white/25 text-[10px]">
                    ?
                  </AvatarFallback>
                </Avatar>
              )}
              {task.assignee && (
                <span className="text-[11px] text-white/45 truncate max-w-[80px]">{task.assignee}</span>
              )}
            </div>

            {task.dueDate && (
              <div className="flex items-center gap-1 text-[11px] text-white/35">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
