'use client'

import { DevLog, DevLogEventType } from '@/types'
import { cn, formatDate } from '@/lib/utils'
import { Plus, Trash2, ChevronDown, ChevronUp, Play, Lightbulb, AlertTriangle, Wrench, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

const MDPreview = dynamic(
  () => import('@uiw/react-markdown-preview').then((mod) => mod.default),
  { ssr: false }
)

const eventTypeConfig: Record<DevLogEventType, { label: string; icon: typeof Play; bg: string; text: string; border: string }> = {
  start: { label: '开始开发', icon: Play, bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  decision: { label: '技术决策', icon: Lightbulb, bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  problem: { label: '遇到问题', icon: AlertTriangle, bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  fix: { label: 'Bug修复', icon: Wrench, bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  refactor: { label: '重构', icon: RefreshCw, bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  complete: { label: '模块完成', icon: CheckCircle2, bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
}

interface DevLogListProps {
  taskId: string
  devLogs: DevLog[]
  onUpdate: (devLogs: DevLog[]) => void
  currentUser?: string
  isDemo?: boolean
}

let _devLogCounter = 2000

export function DevLogList({ taskId, devLogs, onUpdate, currentUser, isDemo }: DevLogListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newEventType, setNewEventType] = useState<DevLogEventType>('start')
  const [submitting, setSubmitting] = useState(false)
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())

  const sortedLogs = [...devLogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const toggleExpand = (logId: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev)
      if (next.has(logId)) {
        next.delete(logId)
      } else {
        next.add(logId)
      }
      return next
    })
  }

  const handleAdd = useCallback(async () => {
    if (!newContent.trim()) return
    if (isDemo) {
      const newLog: DevLog = {
        id: `devlog-${++_devLogCounter}`,
        eventType: newEventType,
        author: currentUser || '演示用户',
        content: newContent.trim(),
        createdAt: new Date(),
      }
      onUpdate([newLog, ...devLogs])
      setNewContent('')
      setIsAdding(false)
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}/dev-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent.trim(), eventType: newEventType }),
      })
      if (res.ok) {
        const newLog = await res.json()
        onUpdate([newLog, ...devLogs])
        setNewContent('')
        setIsAdding(false)
      }
    } catch (error) {
      console.error('添加开发日志失败:', error)
    } finally {
      setSubmitting(false)
    }
  }, [taskId, newContent, newEventType, devLogs, onUpdate, isDemo, currentUser])

  const handleDelete = useCallback(async (logId: string) => {
    if (isDemo) {
      onUpdate(devLogs.filter(l => l.id !== logId))
      return
    }
    try {
      const res = await fetch(`/api/tasks/${taskId}/dev-logs/${logId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        onUpdate(devLogs.filter(l => l.id !== logId))
      }
    } catch (error) {
      console.error('删除开发日志失败:', error)
    }
  }, [taskId, devLogs, onUpdate, isDemo])

  const isLongContent = (content: string) => content.length > 200

  return (
    <div className="space-y-3" data-color-mode="dark">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/80">开发日志</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          写日志
        </button>
      </div>

      {isAdding && (
        <div className="rounded-[12px] bg-white/[0.03] border border-white/[0.08] overflow-hidden">
          <div className="flex items-center gap-2 px-3 pt-3">
            {(Object.keys(eventTypeConfig) as DevLogEventType[]).map((type) => {
              const config = eventTypeConfig[type]
              const Icon = config.icon
              return (
                <button
                  key={type}
                  onClick={() => setNewEventType(type)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-[6px] text-[11px] transition-all border',
                    newEventType === type
                      ? `${config.bg} ${config.text} ${config.border}`
                      : 'bg-transparent text-white/40 border-transparent hover:bg-white/[0.04]'
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {config.label}
                </button>
              )
            })}
          </div>
          <div className="p-3">
            <MDEditor
              value={newContent}
              onChange={(val) => setNewContent(val || '')}
              preview="edit"
              height={200}
              visibleDragbar={false}
              data-color-mode="dark"
            />
          </div>
          <div className="flex items-center justify-end gap-2 px-3 pb-3">
            <button
              onClick={() => { setIsAdding(false); setNewContent('') }}
              className="px-3 py-1.5 text-xs text-white/50 hover:text-white/80 rounded-[8px] hover:bg-white/[0.05] transition-all"
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              disabled={submitting || !newContent.trim()}
              className={cn(
                'px-3 py-1.5 text-xs rounded-[8px] transition-all',
                'bg-[#4f8fff]/20 text-[#4f8fff] hover:bg-[#4f8fff]/30',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              {submitting ? '发布中...' : '发布'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sortedLogs.map((log) => {
          const isExpanded = expandedLogs.has(log.id)
          const shouldTruncate = isLongContent(log.content)
          const displayContent = shouldTruncate && !isExpanded
            ? log.content.slice(0, 200) + '...'
            : log.content
          const logEventType = log.eventType || 'start'
          const config = eventTypeConfig[logEventType]
          const EventIcon = config.icon

          return (
            <div
              key={log.id}
              className="group rounded-[12px] bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-200 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <span className={cn(
                    'flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[11px] font-medium border',
                    config.bg, config.text, config.border
                  )}>
                    <EventIcon className="h-3 w-3" />
                    {config.label}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px] text-white/60 font-medium">
                    {log.author.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-white/60">{log.author}</span>
                  <span className="text-[10px] text-white/30">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleExpand(log.id)}
                      className="text-white/30 hover:text-white/60 transition-colors p-1"
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  )}
                  {currentUser === log.author && (
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="prose prose-sm prose-invert max-w-none text-white/70 text-sm">
                  <MDPreview source={displayContent} wrapperElement={{ 'data-color-mode': 'dark' }} />
                </div>
              </div>
            </div>
          )
        })}

        {sortedLogs.length === 0 && !isAdding && (
          <div className="text-center py-6 text-white/25 text-sm">
            暂无开发日志，记录你的开发思路和进展
          </div>
        )}
      </div>
    </div>
  )
}
