'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { useProject } from '@/contexts/project-context'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NewProjectDialog } from './new-project-dialog'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: '看板' },
  { href: '/stats', icon: BarChart3, label: '统计' },
  { href: '/settings', icon: Settings, label: '设置' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const { projects, currentProject, setCurrentProject, loading, addProject } = useProject()

  const handleProjectCreated = (project: any) => {
    addProject(project)
  }

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-[10px] border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-white/[0.1] transition-all duration-300"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5 text-white/80" /> : <Menu className="h-5 w-5 text-white/80" />}
      </button>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-16 flex flex-col items-center py-4 transition-transform duration-300',
          'bg-black/60 backdrop-blur-[30px]',
          'border-r border-white/[0.06]',
          'shadow-[4px_0_24px_rgba(0,0,0,0.2)]',
          'md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col items-center space-y-6 flex-1 w-full">
          <Link href="/" className="flex items-center justify-center group">
            <div className={cn(
              'w-10 h-10 rounded-[12px] flex items-center justify-center transition-all duration-500',
              'bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.12]',
              'backdrop-blur-xl',
              'group-hover:border-white/25 group-hover:bg-white/[0.12]',
              'group-hover:shadow-[0_8px_28px_rgba(255,255,255,0.06)] group-hover:-translate-y-0.5',
              'relative overflow-hidden',
              'before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent'
            )}>
              <span className="text-lg font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">V</span>
            </div>
          </Link>

          <nav className="flex flex-col items-center space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'w-10 h-10 flex items-center justify-center rounded-[10px] transition-all duration-300 relative',
                    isActive
                      ? 'bg-white/[0.1] text-white border border-white/[0.15] shadow-[0_4px_20px_rgba(255,255,255,0.04)] backdrop-blur-sm'
                      : 'text-white/45 hover:text-white/85 hover:bg-white/[0.05] hover:border hover:border-white/[0.08]'
                  )}
                  title={item.label}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-[10px] bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
                  )}
                  <item.icon className="h-5 w-5" />
                </Link>
              )
            })}
          </nav>

          <div className="w-full px-2 mt-4">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
          </div>

          <div className="w-full px-2 flex-1 overflow-hidden flex flex-col">
            <button
              onClick={() => setNewProjectOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-[10px] transition-all duration-300 text-white/35 hover:text-white/75 hover:bg-white/[0.06] hover:border hover:border-white/[0.1]"
              title="新建项目"
            >
              <Plus className="h-5 w-5" />
            </button>

            <ScrollArea className="flex-1">
              <div className="flex flex-col items-center space-y-1 pb-2">
                {loading ? (
                  <div className="w-8 h-8 rounded-[8px] bg-white/[0.04] animate-pulse border border-white/[0.06]" />
                ) : (
                  projects.map((project) => (
                    <button
                      key={project._id}
                      onClick={() => setCurrentProject(project)}
                      className={cn(
                        'w-10 h-10 flex items-center justify-center rounded-[10px] transition-all duration-300 text-sm font-medium',
                        currentProject?._id === project._id
                          ? 'bg-white/[0.1] text-white border border-white/[0.15] shadow-[0_4px_12px_rgba(255,255,255,0.04)]'
                          : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08]'
                      )}
                      title={project.name}
                    >
                      {project.name.charAt(0).toUpperCase()}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
              <Avatar className="h-8 w-8 ring-1 ring-white/[0.1]">
                <AvatarFallback className="bg-white/[0.08] text-white/60 text-xs">U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right">
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                设置
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/api/auth/signout">
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>

      <NewProjectDialog
        open={newProjectOpen}
        onOpenChange={setNewProjectOpen}
        onSuccess={handleProjectCreated}
      />

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
