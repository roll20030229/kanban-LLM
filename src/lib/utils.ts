import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function generateShareLink(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

export const statusColors: Record<string, string> = {
  todo: 'bg-todo',
  in_progress: 'bg-in-progress',
  in_review: 'bg-in-review',
  done: 'bg-done',
}

export const statusLabels: Record<string, string> = {
  todo: '待办',
  in_progress: '进行中',
  in_review: '审核中',
  done: '已完成',
}

export const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
}

export const priorityLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
}
