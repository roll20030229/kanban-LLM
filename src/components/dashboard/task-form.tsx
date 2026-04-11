'use client'

import { Task, TaskStatus, TaskPriority } from '@/types'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const taskSchema = z.object({
  title: z.string().min(1, '请输入任务标题'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  assignee: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormSubmitData {
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'in_review' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignee?: string
  dueDate?: string
  tags?: string[]
}

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  defaultStatus?: TaskStatus
  members?: string[]
  onSubmit: (data: TaskFormSubmitData) => Promise<void>
}

export function TaskForm({
  open,
  onOpenChange,
  task,
  defaultStatus = 'todo',
  members = [],
  onSubmit,
}: TaskFormProps) {
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: defaultStatus,
      priority: 'medium',
      assignee: '',
      dueDate: '',
      tags: '',
    },
  })

  const watchedValues = watch()

  useEffect(() => {
    const hasChanges = watchedValues.title !== '' ||
      watchedValues.description !== '' ||
      watchedValues.assignee !== '' ||
      watchedValues.dueDate !== '' ||
      watchedValues.tags !== ''
    setIsDirty(hasChanges)
  }, [watchedValues.title, watchedValues.description, watchedValues.assignee, watchedValues.dueDate, watchedValues.tags])

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assignee: task.assignee || '',
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : '',
        tags: task.tags?.join(', ') || '',
      })
    } else {
      reset({
        title: '',
        description: '',
        status: defaultStatus,
        priority: 'medium',
        assignee: '',
        dueDate: '',
        tags: '',
      })
    }
    setSubmitError(null)
    setIsDirty(false)
  }, [task, defaultStatus, reset])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isDirty && !loading) {
      const confirmed = window.confirm('有未保存的更改，确定要关闭吗？')
      if (!confirmed) return
    }
    onOpenChange(newOpen)
  }

  const handleFormSubmit = async (data: TaskFormData) => {
    setLoading(true)
    setSubmitError(null)
    try {
      await onSubmit({
        ...data,
        tags: data.tags
          ? data.tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean)
          : undefined,
      })
      onOpenChange(false)
      reset()
    } catch (error: any) {
      setSubmitError(error.message || '提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-white/90">{task ? '编辑任务' : '新建任务'}</DialogTitle>
          <DialogDescription className="text-white/40">
            {task ? '修改任务信息' : '创建一个新的任务'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-5 mt-6"
        >
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white/65 text-sm font-medium">标题 *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="输入任务标题"
            />
            {errors.title && (
              <p className="text-sm text-red-400">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white/65 text-sm font-medium">描述</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="输入任务描述"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/65 text-sm font-medium">状态</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">待办</SelectItem>
                  <SelectItem value="in_progress">进行中</SelectItem>
                  <SelectItem value="in_review">审核中</SelectItem>
                  <SelectItem value="done">已完成</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/65 text-sm font-medium">优先级</Label>
              <Select
                value={watch('priority')}
                onValueChange={(value) =>
                  setValue('priority', value as TaskPriority)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee" className="text-white/65 text-sm font-medium">负责人</Label>
            {members.length > 0 ? (
              <Select
                value={watch('assignee') || '_none'}
                onValueChange={(value) => setValue('assignee', value === '_none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择负责人" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">未指定</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member} value={member}>
                      {member}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="assignee"
                {...register('assignee')}
                placeholder="输入负责人"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-white/65 text-sm font-medium">截止日期</Label>
            <Input
              id="dueDate"
              type="date"
              {...register('dueDate')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-white/65 text-sm font-medium">标签</Label>
            <Input
              id="tags"
              {...register('tags')}
              placeholder="用逗号分隔多个标签"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/[0.05]">
            {submitError && (
              <span className="text-sm text-red-400 flex-1">{submitError}</span>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
