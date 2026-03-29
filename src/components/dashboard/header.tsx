'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Filter, Bot } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface HeaderProps {
  projectName?: string
  onNewTask?: () => void
  onSearch?: (query: string) => void
  onFilter?: (filter: string) => void
  onOpenAI?: () => void
  aiEnabled?: boolean
}

export function Header({ projectName, onNewTask, onSearch, onFilter, onOpenAI, aiEnabled }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900">
          {projectName || '看板'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 w-48 md:w-64 h-8"
          />
        </div>

        <Select onValueChange={onFilter}>
          <SelectTrigger className="w-28 h-8">
            <Filter className="h-4 w-4 mr-1" />
            <SelectValue placeholder="筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="high">高优先级</SelectItem>
            <SelectItem value="medium">中优先级</SelectItem>
            <SelectItem value="low">低优先级</SelectItem>
          </SelectContent>
        </Select>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={onOpenAI}
                disabled={!aiEnabled}
              >
                <Bot className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {aiEnabled ? 'AI助手' : '请先在设置中配置API Key'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button size="sm" onClick={onNewTask} className="h-8">
          <Plus className="h-4 w-4 mr-1" />
          新任务
        </Button>
      </div>
    </header>
  )
}
