'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export interface Project {
  _id: string
  name: string
  description?: string
  shareLink: string
  members?: string[]
  createdAt?: string
}

interface ProjectContextType {
  projects: Project[]
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  loading: boolean
  refreshProjects: () => Promise<void>
  addProject: (project: Project) => void
  favorites: string[]
  toggleFavorite: (projectId: string) => void
  isFavorite: (projectId: string) => boolean
  recentProjects: Project[]
  projectColors: Record<string, string>
  setProjectColor: (projectId: string, color: string) => void
  getProjectColor: (projectId: string) => string
}

const STORAGE_KEYS = {
  favorites: 'vibe-kanban-favorites',
  recent: 'vibe-kanban-recent',
  colors: 'vibe-kanban-project-colors',
}

const PROJECT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'
]

function getRandomColor(): string {
  return PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)]
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [projectColors, setProjectColors] = useState<Record<string, string>>({})
  const [recentProjectIds, setRecentProjectIds] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem(STORAGE_KEYS.favorites)
      const savedColors = localStorage.getItem(STORAGE_KEYS.colors)
      const savedRecent = localStorage.getItem(STORAGE_KEYS.recent)
      
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }
      if (savedColors) {
        setProjectColors(JSON.parse(savedColors))
      }
      if (savedRecent) {
        setRecentProjectIds(JSON.parse(savedRecent))
      }
    }
  }, [])

  const toggleFavorite = useCallback((projectId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [projectId, ...prev]
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(newFavorites))
      }
      
      return newFavorites
    })
  }, [])

  const isFavorite = useCallback((projectId: string) => {
    return favorites.includes(projectId)
  }, [favorites])

  const setProjectColor = useCallback((projectId: string, color: string) => {
    setProjectColors(prev => {
      const newColors = { ...prev, [projectId]: color }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.colors, JSON.stringify(newColors))
      }
      
      return newColors
    })
  }, [])

  const getProjectColor = useCallback((projectId: string) => {
    if (projectColors[projectId]) {
      return projectColors[projectId]
    }
    
    return getRandomColor()
  }, [projectColors])

  const updateRecentProjects = useCallback((projectId: string) => {
    setRecentProjectIds(prev => {
      const filtered = prev.filter(id => id !== projectId)
      const newRecent = [projectId, ...filtered].slice(0, 5)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(newRecent))
      }
      
      return newRecent
    })
  }, [])

  const refreshProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
        
        // 为新项目分配颜色
        setProjectColors(prev => {
          const newColors = { ...prev }
          let hasChanges = false
          
          data.forEach((project: Project) => {
            if (!prev[project._id]) {
              newColors[project._id] = getRandomColor()
              hasChanges = true
            }
          })
          
          if (hasChanges && typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.colors, JSON.stringify(newColors))
          }
          
          return newColors
        })
        
        if (data.length > 0) {
          if (typeof window !== 'undefined') {
            const savedProjectId = localStorage.getItem('currentProjectId')
            const savedProject = savedProjectId 
              ? data.find((p: Project) => p._id === savedProjectId)
              : null
            setCurrentProject(savedProject || data[0])
          } else {
            setCurrentProject(data[0])
          }
        }
      }
    } catch (error) {
      console.error('获取项目列表失败:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const addProject = useCallback((project: Project) => {
    setProjects(prev => [project, ...prev])
    setCurrentProject(project)
    updateRecentProjects(project._id)
    // 自动为新项目分配颜色
    setProjectColors(prev => {
      if (!prev[project._id]) {
        const newColors = { ...prev, [project._id]: getRandomColor() }
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.colors, JSON.stringify(newColors))
        }
        return newColors
      }
      return prev
    })
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentProjectId', project._id)
    }
  }, [updateRecentProjects])

  const setCurrentProjectWithTracking = useCallback((project: Project | null) => {
    setCurrentProject(project)
    if (project) {
      updateRecentProjects(project._id)
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentProjectId', project._id)
      }
    }
  }, [updateRecentProjects])

  const recentProjects = projects.filter(p => 
    recentProjectIds.includes(p._id)
  ).sort((a, b) => {
    const aIndex = recentProjectIds.indexOf(a._id)
    const bIndex = recentProjectIds.indexOf(b._id)
    return aIndex - bIndex
  })

  useEffect(() => {
    refreshProjects()
  }, [refreshProjects])

  useEffect(() => {
    if (currentProject && typeof window !== 'undefined') {
      localStorage.setItem('currentProjectId', currentProject._id)
    }
  }, [currentProject])

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProject: setCurrentProjectWithTracking,
        loading,
        refreshProjects,
        addProject,
        favorites,
        toggleFavorite,
        isFavorite,
        recentProjects,
        projectColors,
        setProjectColor,
        getProjectColor,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
