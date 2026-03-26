'use client'

import { Task, TaskStatus } from '@/types'
import { cn, statusColors, priorityColors, priorityLabels } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, MoreHorizontal } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface TaskCardProps {
  task: Task
  onClick?: () => void
  onDelete?: () => void
  isDragging?: boolean
  readOnly?: boolean
}

export function TaskCard({ task, onClick, onDelete, isDragging, readOnly }: TaskCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group bg-white rounded-lg border border-gray-200 p-3 cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-gray-300',
        isDragging && 'shadow-lg rotate-2 scale-105 opacity-90',
        readOnly && 'cursor-default'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
          {task.title}
        </h4>
        {!readOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onClick}>编辑</DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.()
                }}
              >
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span
          className={cn(
            'px-2 py-0.5 rounded text-xs font-medium',
            priorityColors[task.priority]
          )}
        >
          {priorityLabels[task.priority]}
        </span>

        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-1">
            {task.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="text-xs text-gray-400">+{task.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {task.assignee ? (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-primary text-white">
                {task.assignee.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-gray-200 text-gray-500">
                ?
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
