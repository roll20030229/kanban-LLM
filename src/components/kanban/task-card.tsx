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
import { useState, useEffect } from 'react'

interface TaskCardProps {
  task: Task
  onClick?: () => void
  onDelete?: () => void
  isDragging?: boolean
  readOnly?: boolean
  dragPosition?: 'above' | 'below' | null
}

const statusGradients: Record<TaskStatus, string> = {
  todo: 'from-[#4f8fff]/8 to-[#22d3ee]/5',
  in_progress: 'from-[#a855f7]/8 to-[#ec4899]/5',
  in_review: 'from-[#f59e0b]/8 to-[#fbbf24]/5',
  done: 'from-[#22d3ee]/8 to-[#10b981]/5',
}

const statusDotColors: Record<TaskStatus, string> = {
  todo: 'bg-[#4f8fff]',
  in_progress: 'bg-[#a855f7]',
  in_review: 'bg-[#f59e0b]',
  done: 'bg-[#22d3ee]',
}

const priorityStyles: Record<string, { bg: string; border: string; text: string; shadow: string }> = {
  high: {
    bg: 'bg-red-500/15',
    border: 'border-red-500/30',
    text: 'text-red-400',
    shadow: 'shadow-[0_2px_8px_rgba(239,68,68,0.3)]',
  },
  medium: {
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    shadow: 'shadow-[0_2px_8px_rgba(245,158,11,0.3)]',
  },
  low: {
    bg: 'bg-white/[0.06]',
    border: 'border-white/[0.12]',
    text: 'text-white/60',
    shadow: 'shadow-[0_2px_8px_rgba(255,255,255,0.1)]',
  },
}

export function TaskCard({ task, onClick, onDelete, isDragging, readOnly, dragPosition }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

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
    animation: {
      duration: 150,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging 
      ? 'transform 50ms cubic-bezier(0.2, 0, 0, 1)' 
      : 'transform 300ms cubic-bezier(0.2, 0, 0, 1)',
  }

  const statusGradient = statusGradients[task.status]
  const dotColor = statusDotColors[task.status]
  const priorityStyle = priorityStyles[task.priority]

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.()
  }

  const handleMouseEnter = () => {
    if (!readOnly && !isTouchDevice) {
      setIsHovered(true)
      setTimeout(() => setShowDetails(true), 150)
    }
  }

  const handleMouseLeave = () => {
    if (!readOnly && !isTouchDevice) {
      setIsHovered(false)
      setShowDetails(false)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="article"
      className={cn(
        'group relative rounded-[16px] p-[1px]',
        'crystal-outer',
        statusGradient,
        isDragging && 'shadow-[0_20px_60px_rgba(0,0,0,0.5)] scale-[1.025]',
        readOnly && 'cursor-default'
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {dragPosition === 'above' && (
        <div className="absolute top-0 left-3 right-3 h-[2px] bg-[#4f8fff] rounded-full shadow-[0_0_8px_rgba(79,143,255,0.6)] z-50" />
      )}
      {dragPosition === 'below' && (
        <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#4f8fff] rounded-full shadow-[0_0_8px_rgba(79,143,255,0.6)] z-50" />
      )}

      <div
        className={cn(
          'relative rounded-[15px] p-4',
          'crystal-inner',
          isHovered && 'bg-white/[0.04]',
          isDragging && 'bg-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.6)]'
        )}
      >
        <div className="flex items-start gap-3">
          {!readOnly && (
            <div 
              {...listeners}
              className="flex-shrink-0 mt-1 opacity-30 group-hover:opacity-70 transition-all cursor-grab active:cursor-grabbing hover:scale-110 hover:text-white/90"
            >
              <GripVertical className="h-4 w-4 text-white/50" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h4 
                className={cn(
                  'text-sm font-medium transition-all duration-300 cursor-pointer',
                  'text-white/90 hover:text-white',
                  'line-clamp-2 flex-1'
                )}
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
                      className={cn(
                        'h-7 w-7 transition-all duration-300 flex-shrink-0',
                        'opacity-0 group-hover:opacity-100',
                        'hover:bg-white/10'
                      )}
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

            <div className={cn(
              'overflow-hidden transition-all duration-350 ease-in-out',
              showDetails ? 'max-h-[200px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
            )}>
              {task.description && (
                <p className="text-xs text-white/50 leading-relaxed line-clamp-3 mb-2">
                  {task.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <span
                className={cn(
                  'px-2.5 py-1 rounded-[8px] text-xs font-medium transition-all duration-300',
                  'animate-suspension',
                  priorityStyle.bg,
                  priorityStyle.border,
                  priorityStyle.text,
                  priorityStyle.shadow,
                  'border backdrop-blur-sm'
                )}
              >
                {priorityLabels[task.priority]}
              </span>

              {task.tags && task.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {task.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        'px-2.5 py-1 rounded-[6px] text-xs transition-all duration-300',
                        'animate-suspension',
                        'bg-white/[0.08] text-white/70',
                        'border border-white/[0.15] backdrop-blur-sm',
                        'hover:bg-white/[0.12] hover:border-white/[0.25] hover:-translate-y-0.5'
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                  {task.tags.length > 3 && (
                    <span className="text-xs text-white/40 px-1">+{task.tags.length - 3}</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                {task.assignee ? (
                  <Avatar className="h-6.5 w-6.5 ring-1 ring-white/12 transition-all duration-300 hover:ring-white/20">
                    <AvatarFallback className="text-xs bg-white/10 text-white/70 text-[10px] font-medium">
                      {task.assignee.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-6.5 w-6.5">
                    <AvatarFallback className="text-xs bg-white/[0.03] text-white/25 text-[10px]">
                      ?
                    </AvatarFallback>
                  </Avatar>
                )}
                {task.assignee && (
                  <span className="text-[11px] text-white/50 truncate max-w-[90px]">{task.assignee}</span>
                )}
              </div>

              {task.dueDate && (
                <div className={cn(
                  'flex items-center gap-1.5 text-[11px] transition-all duration-300',
                  isHovered ? 'text-white/60' : 'text-white/40'
                )}>
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col gap-1.5 justify-center py-0.5">
            <div className={cn(
              'w-1 h-1 rounded-full transition-all duration-300',
              dotColor,
              'animate-dot-pulse',
              isHovered && 'opacity-90 scale-110'
            )} />
            <div className={cn(
              'w-1 h-1 rounded-full transition-all duration-300',
              dotColor,
              'animate-dot-pulse-delay-1',
              isHovered && 'opacity-90 scale-110'
            )} />
            <div className={cn(
              'w-1 h-1 rounded-full transition-all duration-300',
              dotColor,
              'animate-dot-pulse-delay-2',
              isHovered && 'opacity-90 scale-110'
            )} />
          </div>
        </div>
      </div>
    </div>
  )
}
