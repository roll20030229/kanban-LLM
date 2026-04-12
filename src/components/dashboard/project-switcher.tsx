'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useProject } from '@/contexts/project-context'
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Star, Clock, Folder } from 'lucide-react'

interface ProjectSwitcherProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectSelect?: (project: any) => void
}

export function ProjectSwitcher({ open, onOpenChange, onProjectSelect }: ProjectSwitcherProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'favorites'>('all')
  const { 
    projects, 
    currentProject, 
    setCurrentProject, 
    favorites, 
    toggleFavorite,
    isFavorite,
    getProjectColor,
    recentProjects 
  } = useProject()

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return null
    
    const query = searchQuery.toLowerCase()
    return projects.filter(p => 
      p.name.toLowerCase().includes(query)
    )
  }, [projects, searchQuery])

  const favoriteProjects = useMemo(() => {
    return projects.filter(p => favorites.includes(p._id))
  }, [projects, favorites])

  const otherProjects = useMemo(() => {
    const favoriteIds = new Set(favorites)
    const recentIds = new Set(recentProjects.map(p => p._id))
    
    return projects.filter(p => 
      !favoriteIds.has(p._id) && !recentIds.has(p._id)
    )
  }, [projects, favorites, recentProjects])

  const handleProjectSelect = (project: any) => {
    setCurrentProject(project)
    onProjectSelect?.(project)
    onOpenChange(false)
    setSearchQuery('')
  }

  const handleToggleFavorite = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    toggleFavorite(projectId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 bg-black/90 backdrop-blur-md z-50" />
      <DialogContent className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[90vw] max-w-2xl z-50 p-0 overflow-hidden bg-black/95 backdrop-blur-xl border border-white/10">
        {/* 搜索框 */}
        <div className="relative">
          <Input
            placeholder="搜索项目... (输入名称快速查找)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 text-lg rounded-t-[14px] rounded-b-none border-b-0 bg-white/[0.05] text-white placeholder:text-white/30 focus:bg-white/[0.08]"
            autoFocus
          />
          
          {searchQuery && filteredProjects && filteredProjects.length === 0 && (
            <div className="px-6 py-8 text-center text-white/40">
              未找到匹配的项目
            </div>
          )}
        </div>

        {/* 顶部标签页切换 */}
        <div className="flex items-center border-b border-white/10 bg-white/[0.02]">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2',
              activeTab === 'all'
                ? 'text-white border-white/80 bg-white/[0.05]'
                : 'text-white/40 border-transparent hover:text-white/60 hover:bg-white/[0.03]'
            )}
          >
            <Folder className="h-4 w-4" />
            所有项目
            <span className="text-xs text-white/30 ml-1">({projects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2',
              activeTab === 'recent'
                ? 'text-white border-white/80 bg-white/[0.05]'
                : 'text-white/40 border-transparent hover:text-white/60 hover:bg-white/[0.03]'
            )}
          >
            <Clock className="h-4 w-4" />
            最近访问
            <span className="text-xs text-white/30 ml-1">({recentProjects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2',
              activeTab === 'favorites'
                ? 'text-white border-white/80 bg-white/[0.05]'
                : 'text-white/40 border-transparent hover:text-white/60 hover:bg-white/[0.03]'
            )}
          >
            <Star className="h-4 w-4" />
            收藏
            <span className="text-xs text-white/30 ml-1">({favoriteProjects.length})</span>
          </button>
        </div>

        {/* 项目列表 */}
        <ScrollArea className="max-h-[60vh] px-2">
          {searchQuery && filteredProjects ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                搜索结果
              </div>
              {filteredProjects.map((project) => (
                <ProjectItem
                  key={project._id}
                  project={project}
                  isActive={currentProject?._id === project._id}
                  isFavorite={isFavorite(project._id)}
                  color={getProjectColor(project._id)}
                  onSelect={() => handleProjectSelect(project)}
                  onToggleFavorite={(e) => handleToggleFavorite(e, project._id)}
                />
              ))}
            </div>
          ) : (
            <>
              {activeTab === 'all' && (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    所有项目
                  </div>
                  {projects.length > 0 ? (
                    <div className="space-y-0.5">
                      {projects.map((project) => (
                        <ProjectItem
                          key={project._id}
                          project={project}
                          isActive={currentProject?._id === project._id}
                          isFavorite={isFavorite(project._id)}
                          color={getProjectColor(project._id)}
                          onSelect={() => handleProjectSelect(project)}
                          onToggleFavorite={(e) => handleToggleFavorite(e, project._id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-white/40">
                      暂无项目，点击右上角 + 创建新项目
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'recent' && (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    最近访问
                  </div>
                  {recentProjects.length > 0 ? (
                    <div className="space-y-0.5">
                      {recentProjects.map((project) => (
                        <ProjectItem
                          key={project._id}
                          project={project}
                          isActive={currentProject?._id === project._id}
                          isFavorite={isFavorite(project._id)}
                          color={getProjectColor(project._id)}
                          onSelect={() => handleProjectSelect(project)}
                          onToggleFavorite={(e) => handleToggleFavorite(e, project._id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-white/40">
                      暂无最近访问记录
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    收藏项目
                  </div>
                  {favoriteProjects.length > 0 ? (
                    <div className="space-y-0.5">
                      {favoriteProjects.map((project) => (
                        <ProjectItem
                          key={project._id}
                          project={project}
                          isActive={currentProject?._id === project._id}
                          isFavorite={true}
                          color={getProjectColor(project._id)}
                          onSelect={() => handleProjectSelect(project)}
                          onToggleFavorite={(e) => handleToggleFavorite(e, project._id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-white/40">
                      暂无收藏项目，点击星标收藏常用项目
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </ScrollArea>

        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.03]">
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>{projects.length} 个项目</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ProjectItemProps {
  project: any
  isActive: boolean
  isFavorite: boolean
  color: string
  onSelect: () => void
  onToggleFavorite: (e: React.MouseEvent) => void
}

function ProjectItem({
  project,
  isActive,
  isFavorite,
  color,
  onSelect,
  onToggleFavorite,
}: ProjectItemProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-[10px] transition-all duration-200',
        isActive
          ? 'bg-white/[0.12] text-white'
          : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
      )}
    >
      <div
        className="w-2 h-8 rounded-[6px] flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      
      <div className="flex-1 text-left">
        <div className="font-medium">{project.name}</div>
        {project.description && (
          <div className="text-xs text-white/40 truncate mt-0.5">
            {project.description}
          </div>
        )}
      </div>
      
      <button
        onClick={onToggleFavorite}
        className={cn(
          'p-1.5 rounded-[6px] transition-all duration-200',
          isFavorite
            ? 'text-yellow-400 hover:bg-yellow-400/10'
            : 'text-white/20 hover:text-yellow-400 hover:bg-white/5'
        )}
      >
        <Star
          className={cn(
            'h-4 w-4',
            isFavorite ? 'fill-current' : ''
          )}
        />
      </button>
    </button>
  )
}
