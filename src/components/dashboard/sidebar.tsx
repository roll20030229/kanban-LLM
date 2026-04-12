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
  Star,
  ChevronLeft,
  ChevronRight,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useSidebar } from '@/contexts/sidebar-context'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: '看板' },
  { href: '/stats', icon: BarChart3, label: '统计' },
  { href: '/settings', icon: Settings, label: '设置' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const { collapsed, toggleSidebar } = useSidebar()
  const { 
    projects, 
    currentProject, 
    setCurrentProject, 
    loading, 
    addProject,
    favorites,
    toggleFavorite,
    isFavorite,
    getProjectColor,
    recentProjects
  } = useProject()

  const handleProjectCreated = (project: any) => {
    addProject(project)
  }

  const favoriteProjects = projects.filter(p => favorites.includes(p._id))
  
  const recentNotFavorite = recentProjects.filter(p => !favorites.includes(p._id))
  
  const otherProjects = projects.filter(p => 
    !favorites.includes(p._id) && !recentProjects.find(rp => rp._id === p._id)
  )

  return (
    <TooltipProvider delayDuration={300}>
      <>
        <button
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-[10px] border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-white/[0.1] transition-all duration-300"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5 text-white/80" /> : <Menu className="h-5 w-5 text-white/80" />}
        </button>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col py-4 transition-all duration-500',
          collapsed ? 'w-[52px] bg-transparent backdrop-blur-none border-none shadow-none' : 'w-20 bg-black/60 backdrop-blur-[30px]',
          'border-r border-white/[0.06]',
          'shadow-[4px_0_24px_rgba(0,0,0,0.2)]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)' }}
      >
        <div className="flex flex-col items-center flex-1 w-full px-2">
          <div className={cn(
            'transition-all duration-500 overflow-hidden',
            collapsed ? 'w-0 opacity-0' : 'w-full opacity-100'
          )}>
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

            <nav className="flex flex-col items-center space-y-2 mt-6">
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

            <div className="w-full px-3 mt-4">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent shadow-[0_0_10px_rgba(255,255,255,0.15)]" />
            </div>
          </div>

          <div className={cn(
            'w-full flex-1 flex flex-col transition-all duration-500 overflow-x-hidden overflow-y-hidden',
            collapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-full opacity-100'
          )} style={{ zIndex: 50 }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setNewProjectOpen(true)}
                  className={cn(
                    'group relative w-full mx-0 mb-3 p-2 rounded-[14px] transition-all duration-500',
                    'bg-gradient-to-br from-white/10 via-white/5 to-transparent',
                    'border border-white/20',
                    'hover:border-white/40',
                    'hover:shadow-[0_8px_32px_rgba(255,255,255,0.15),0_0_20px_rgba(255,255,255,0.1)_inset]',
                    'hover:-translate-y-1',
                    'active:translate-y-0 active:scale-[0.98]',
                    'overflow-visible',
                    'backdrop-blur-xl'
                  )}
                >
                  <div className={cn(
                    'absolute inset-0 rounded-[14px] opacity-0 transition-all duration-500',
                    'group-hover:opacity-100',
                    'bg-gradient-to-tr from-white/15 via-transparent to-white/10'
                  )} />
                  
                  <div className={cn(
                    'absolute inset-0 rounded-[14px] overflow-visible opacity-0 group-hover:opacity-100 transition-opacity duration-700'
                  )}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-spin-slow" />
                  </div>
                  
                  <div className={cn(
                    'absolute inset-0 rounded-[14px] animate-pulse-slow',
                    'bg-gradient-to-br from-white/8 to-transparent'
                  )} />
                  
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <div className={cn(
                      'w-8 h-8 rounded-[10px] flex items-center justify-center transition-all duration-500',
                      'bg-gradient-to-br from-white/15 to-white/5',
                      'border border-white/25',
                      'group-hover:border-white/50',
                      'group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]',
                      'group-hover:scale-110 group-hover:rotate-90'
                    )}>
                      <Plus className={cn(
                        'h-4 w-4 transition-all duration-500',
                        'text-white/70',
                        'group-hover:text-white',
                        'group-hover:scale-110',
                        'drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                      )} />
                    </div>
                  </div>
                  
                  <div className={cn(
                    'absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full',
                    'bg-white/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500'
                  )} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-black/90 border-white/10 text-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <p>新建项目</p>
              </TooltipContent>
            </Tooltip>

            <ScrollArea className="flex-1">
              <div className="flex flex-col items-center space-y-3 py-2">
                {loading ? (
                  <div className="w-8 h-8 rounded-[8px] bg-white/[0.04] animate-pulse border border-white/[0.06]" />
                ) : (
                  <>
                    {favoriteProjects.length > 0 && (
                      <>
                        {favoriteProjects.map((project) => (
                          <ProjectButton
                            key={project._id}
                            project={project}
                            isActive={currentProject?._id === project._id}
                            isFavorite={true}
                            getProjectColor={getProjectColor}
                            onClick={() => setCurrentProject(project)}
                            onToggleFavorite={() => toggleFavorite(project._id)}
                          />
                        ))}
                      </>
                    )}

                    {recentNotFavorite.length > 0 && (
                      <>
                        {favoriteProjects.length > 0 && (
                          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-1" />
                        )}
                        {recentNotFavorite.map((project) => (
                          <ProjectButton
                            key={project._id}
                            project={project}
                            isActive={currentProject?._id === project._id}
                            isFavorite={false}
                            getProjectColor={getProjectColor}
                            onClick={() => setCurrentProject(project)}
                            onToggleFavorite={() => toggleFavorite(project._id)}
                          />
                        ))}
                      </>
                    )}

                    {otherProjects.length > 0 && (
                      <>
                        {(favoriteProjects.length > 0 || recentNotFavorite.length > 0) && (
                          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-1" />
                        )}
                        {otherProjects.map((project) => (
                          <ProjectButton
                            key={project._id}
                            project={project}
                            isActive={currentProject?._id === project._id}
                            isFavorite={false}
                            getProjectColor={getProjectColor}
                            onClick={() => setCurrentProject(project)}
                            onToggleFavorite={() => toggleFavorite(project._id)}
                          />
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className={cn(
          'transition-all duration-500 overflow-hidden',
          collapsed ? 'w-0 opacity-0' : 'w-full opacity-100'
        )}>
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
        </div>

        <button
          onClick={toggleSidebar}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 z-50',
            'w-6 h-6 rounded-full',
            'bg-white/[0.08] backdrop-blur-xl border border-white/[0.15]',
            'hover:bg-white/[0.15] hover:border-white/30 hover:scale-110',
            'shadow-[0_4px_12px_rgba(0,0,0,0.2)]',
            'transition-all duration-300',
            'flex items-center justify-center'
          )}
          style={{ 
            transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)',
            right: collapsed ? '10px' : '-12px'
          }}
          title={collapsed ? '展开导航栏' : '收起导航栏'}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-white/70" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 text-white/70" />
          )}
        </button>
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
    </TooltipProvider>
  )
}

interface ProjectButtonProps {
  project: any
  isActive: boolean
  isFavorite: boolean
  getProjectColor: (projectId: string) => string
  onClick: () => void
  onToggleFavorite: () => void
}

function ProjectButton({
  project,
  isActive,
  isFavorite,
  getProjectColor,
  onClick,
  onToggleFavorite,
}: ProjectButtonProps) {
  const color = getProjectColor(project._id)
  
  return (
    <div className="relative group" style={{ zIndex: 100 }}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative" style={{ transform: 'translateZ(0)' }}>
            <button
              onClick={onClick}
              className={cn(
                'relative w-10 h-10 flex items-center justify-center rounded-[10px] transition-all duration-300 text-sm font-medium',
                isActive
                  ? 'bg-white/[0.1] text-white border border-white/[0.15] shadow-[0_4px_12px_rgba(255,255,255,0.04)]'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08]'
              )}
              style={isActive ? {
                boxShadow: `0 4px 12px rgba(255,255,255,0.04), 0 0 0 1px ${color}30`,
              } : {}}
            >
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full opacity-0 transition-opacity duration-300"
                style={{ backgroundColor: color }}
              />
              
              {project.name.charAt(0).toUpperCase()}
              
              {isFavorite && (
                <Star className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 fill-current" style={{ zIndex: 999 }} />
              )}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite()
              }}
              className={cn(
                'absolute -top-2 -right-2 p-1.5 rounded-full opacity-0 transition-all duration-200',
                'bg-black/90 backdrop-blur-sm border border-white/20',
                'hover:border-white/40 hover:scale-110',
                'group-hover:opacity-100',
                isFavorite
                  ? 'text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.4)]'
                  : 'text-white/50 hover:text-yellow-400'
              )}
              style={{ 
                zIndex: 9999,
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
                position: 'absolute',
              }}
            >
              <Star className={cn(
                'h-3.5 w-3.5',
                isFavorite ? 'fill-current' : ''
              )} />
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-black/90 border-white/10 text-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>{project.name}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
