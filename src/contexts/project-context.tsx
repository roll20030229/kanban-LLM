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
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentProjectId', project._id)
    }
  }, [])

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
        setCurrentProject,
        loading,
        refreshProjects,
        addProject,
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
