export interface User {
  id: string
  name: string
  email: string
  password: string
  avatar?: string
  role: 'admin' | 'member'
  createdAt: Date
}

export interface Milestone {
  title: string
  date: Date
  completed: boolean
}

export interface Project {
  id: string
  name: string
  description?: string
  shareLink: string
  members: string[]
  milestones: Milestone[]
  createdBy: string
  createdAt: Date
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignee?: string
  dueDate?: Date
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ProjectStats {
  completionRate: number
  avgCycleTime: number
  throughput: number
  wipCount: number
  statusDistribution: {
    todo: number
    in_progress: number
    in_review: number
    done: number
  }
  cumulativeFlow: {
    date: string
    todo: number
    in_progress: number
    in_review: number
    done: number
  }[]
  burndown: {
    date: string
    remaining: number
    ideal: number
  }[]
  memberStats: {
    id: string
    name: string
    avatar?: string
    completed: number
    inProgress: number
  }[]
}
