'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface Milestone {
  title: string
  date: string
}

interface NewProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (project: any) => void
}

export function NewProjectDialog({ open, onOpenChange, onSuccess }: NewProjectDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const isDirty = name.trim() !== '' || description.trim() !== '' || milestones.length > 0

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isDirty && !loading) {
      const confirmed = window.confirm('有未保存的更改，确定要关闭吗？')
      if (!confirmed) return
    }
    onOpenChange(newOpen)
  }

  const addMilestone = () => {
    setMilestones([...milestones, { title: '', date: '' }])
  }

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    setMilestones(milestones.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const validMilestones = milestones
        .filter(m => m.title.trim() && m.date)
        .map(m => ({ title: m.title.trim(), date: m.date }))

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, milestones: validMilestones }),
      })

      if (res.ok) {
        const project = await res.json()
        onSuccess(project)
        setName('')
        setDescription('')
        setMilestones([])
        onOpenChange(false)
        toast('项目创建成功', 'success')
      } else {
        const data = await res.json()
        toast(data.error || '创建失败', 'error')
      }
    } catch (error) {
      console.error('创建项目失败:', error)
      toast('创建失败，请检查网络连接', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-white/90">新建项目</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/65 text-sm font-medium">项目名称</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入项目名称"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white/65 text-sm font-medium">项目描述</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入项目描述（可选）"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white/65 text-sm font-medium">里程碑</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addMilestone}
                className="h-7 text-xs text-white/50 hover:text-white/80"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                添加
              </Button>
            </div>
            {milestones.length > 0 && (
              <div className="space-y-2">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                      placeholder="里程碑名称"
                      className="flex-1"
                    />
                    <Input
                      type="date"
                      value={milestone.date}
                      onChange={(e) => updateMilestone(index, 'date', e.target.value)}
                      className="w-[140px]"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0 text-white/30 hover:text-red-400"
                      onClick={() => removeMilestone(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/[0.05]">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              <Plus className="h-4 w-4 mr-1.5" />
              {loading ? '创建中...' : '创建项目'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
