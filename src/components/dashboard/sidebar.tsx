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
  Folder,
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
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 transition-transform duration-200',
          'md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col items-center space-y-6 flex-1 w-full">
          <Link href="/" className="flex items-center justify-center">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
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
                    'w-10 h-10 flex items-center justify-center rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  title={item.label}
                >
                  <item.icon className="h-5 w-5" />
                </Link>
              )
            })}
          </nav>

          <div className="w-full px-2 mt-4">
            <div className="w-full h-px bg-gray-200" />
          </div>

          <div className="w-full px-2 flex-1 overflow-hidden flex flex-col">
            <button
              onClick={() => setNewProjectOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-lg transition-colors text-gray-500 hover:bg-primary hover:text-white mb-2"
              title="新建项目"
            >
              <Plus className="h-5 w-5" />
            </button>

            <ScrollArea className="flex-1">
              <div className="flex flex-col items-center space-y-1 pb-2">
                {loading ? (
                  <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
                ) : (
                  projects.map((project) => (
                    <button
                      key={project._id}
                      onClick={() => setCurrentProject(project)}
                      className={cn(
                        'w-10 h-10 flex items-center justify-center rounded-lg transition-colors text-sm font-medium',
                        currentProject?._id === project._id
                          ? 'bg-primary text-white'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
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
              <Avatar className="h-8 w-8">
                <AvatarFallback>U</AvatarFallback>
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
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
