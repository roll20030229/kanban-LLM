'use client'

import { Subtask } from '@/types'
import { cn } from '@/lib/utils'
import { Check, Plus, X } from 'lucide-react'
import { useState, useCallback } from 'react'

interface SubtaskListProps {
  taskId: string
  subtasks: Subtask[]
  onUpdate: (subtasks: Subtask[]) => void
  isDemo?: boolean
}

let _subtaskCounter = 1000

export function SubtaskList({ taskId, subtasks, onUpdate, isDemo }: SubtaskListProps) {
  const [newTitle, setNewTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const completedCount = subtasks.filter(s => s.completed).length
  const totalCount = subtasks.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const handleToggle = useCallback(async (subtask: Subtask) => {
    if (isDemo) {
      onUpdate(subtasks.map(s => s.id === subtask.id ? { ...s, completed: !s.completed } : s))
      return
    }
    setLoadingId(subtask.id)
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks/${subtask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !subtask.completed }),
      })
      if (res.ok) {
        const updated = await res.json()
        onUpdate(subtasks.map(s => s.id === subtask.id ? updated : s))
      }
    } catch (error) {
      console.error('更新子任务失败:', error)
    } finally {
      setLoadingId(null)
    }
  }, [taskId, subtasks, onUpdate, isDemo])

  const handleAdd = useCallback(async () => {
    if (!newTitle.trim()) return
    if (isDemo) {
      const newSubtask: Subtask = {
        id: `subtask-${++_subtaskCounter}`,
        title: newTitle.trim(),
        completed: false,
      }
      onUpdate([...subtasks, newSubtask])
      setNewTitle('')
      setIsAdding(false)
      return
    }
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() }),
      })
      if (res.ok) {
        const newSubtask = await res.json()
        onUpdate([...subtasks, newSubtask])
        setNewTitle('')
        setIsAdding(false)
      }
    } catch (error) {
      console.error('添加子任务失败:', error)
    }
  }, [taskId, newTitle, subtasks, onUpdate, isDemo])

  const handleDelete = useCallback(async (subtaskId: string) => {
    if (isDemo) {
      onUpdate(subtasks.filter(s => s.id !== subtaskId))
      return
    }
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        onUpdate(subtasks.filter(s => s.id !== subtaskId))
      }
    } catch (error) {
      console.error('删除子任务失败:', error)
    }
  }, [taskId, subtasks, onUpdate, isDemo])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd()
    } else if (e.key === 'Escape') {
      setIsAdding(false)
      setNewTitle('')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-white/80">子任务</h3>
          <span className="text-xs text-white/40 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
            {completedCount}/{totalCount}
          </span>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          添加
        </button>
      </div>

      {totalCount > 0 && (
        <div className="space-y-1.5">
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 ease-out',
                progress === 100 ? 'bg-[#22d3ee]' : 'bg-[#4f8fff]'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-white/35">{progress}% 完成</p>
        </div>
      )}

      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className={cn(
              'group flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all duration-200',
              'bg-white/[0.02] hover:bg-white/[0.05]',
              'border border-transparent hover:border-white/[0.06]',
              loadingId === subtask.id && 'opacity-60'
            )}
          >
            <button
              onClick={() => handleToggle(subtask)}
              className={cn(
                'flex-shrink-0 w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all duration-200',
                subtask.completed
                  ? 'bg-[#22d3ee]/20 border-[#22d3ee]/50 text-[#22d3ee]'
                  : 'border-white/20 hover:border-white/40'
              )}
            >
              {subtask.completed && <Check className="h-3 w-3" />}
            </button>
            <span
              className={cn(
                'flex-1 text-sm transition-all duration-200',
                subtask.completed ? 'text-white/35 line-through' : 'text-white/75'
              )}
            >
              {subtask.title}
            </span>
            <button
              onClick={() => handleDelete(subtask.id)}
              className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all duration-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {isAdding && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] bg-white/[0.03] border border-white/[0.08]">
            <div className="flex-shrink-0 w-5 h-5 rounded-[6px] border-2 border-white/20" />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入子任务标题..."
              className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/30 outline-none"
              autoFocus
            />
            <button
              onClick={() => { setIsAdding(false); setNewTitle('') }}
              className="text-white/30 hover:text-white/60 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {totalCount === 0 && !isAdding && (
          <div className="text-center py-6 text-white/25 text-sm">
            暂无子任务，点击上方添加
          </div>
        )}
      </div>
    </div>
  )
}
