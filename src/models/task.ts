import mongoose from 'mongoose'
import { TaskStatus, TaskPriority } from '@/types'

const TaskSchema = new mongoose.Schema({
  projectId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['todo', 'in_progress', 'in_review', 'done'] as TaskStatus[],
    default: 'todo',
    index: true
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'] as TaskPriority[],
    default: 'medium'
  },
  assignee: { type: String },
  dueDate: { type: Date },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

TaskSchema.index({ projectId: 1, status: 1 })

export default mongoose.models.Task || mongoose.model('Task', TaskSchema)
