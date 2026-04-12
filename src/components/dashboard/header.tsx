'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Filter, Bot, ChevronDown } from 'lucide-react'
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
import { useProject } from '@/contexts/project-context'
import { ProjectSwitcher } from './project-switcher'
import { Breadcrumb } from './breadcrumb'
import { useKeyboardShortcutWithModifier } from '@/hooks/use-keyboard-shortcut'

interface HeaderProps {
  projectName?: string
  onNewTask?: () => void
  onSearch?: (query: string) => void
  onFilter?: (filter: string) => void
  onOpenAI?: () => void
}

export function Header({ projectName, onNewTask, onSearch, onFilter, onOpenAI }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const { currentProject, getProjectColor } = useProject()

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  useKeyboardShortcutWithModifier('k', () => setSwitcherOpen(true), { ctrl: true });

  return (
    <>
      <ProjectSwitcher
        open={switcherOpen}
        onOpenChange={setSwitcherOpen}
      />
      
      <header className={cn(
        'h-14 flex items-center justify-between px-6 relative overflow-hidden',
        'bg-white/[0.02] backdrop-blur-[30px]',
        'border-b border-white/[0.06]',
        'after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/[0.08] after:to-transparent'
      )}>
        <div className="flex items-center gap-4 flex-1">
          <div className="flex flex-col gap-1">
            <Breadcrumb />
            
            <button
              onClick={() => setSwitcherOpen(true)}
              className="flex items-center gap-2 group -ml-1 px-2 py-1 rounded-[8px] transition-all duration-200 hover:bg-white/[0.06]"
            >
              <h1 className="text-base font-semibold text-white/90 tracking-tight">
                {currentProject?.name || '看板'}
              </h1>
              
              {currentProject && (
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: getProjectColor(currentProject._id) }}
                />
              )}
              
              <ChevronDown className="h-4 w-4 text-white/40 group-hover:text-white/70 transition-colors" />
            </button>
          </div>
        </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 w-48 md:w-64 h-9"
          />
        </div>

        <Select onValueChange={onFilter}>
          <SelectTrigger className="w-28 h-9">
            <Filter className="h-4 w-4 mr-1 text-white/50" />
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
                className="h-9 w-9 p-0"
                onClick={onOpenAI}
              >
                <Bot className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              AI助手
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button size="sm" onClick={onNewTask} className="h-9">
          <Plus className="h-4 w-4 mr-1.5" />
          新任务
        </Button>
      </div>
    </header>
    </>
  )
}

