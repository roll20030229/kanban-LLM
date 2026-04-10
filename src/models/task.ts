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
  order: { type: Number, default: 0 },
  version: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  toJSON: {
    virtuals: true,
    transform: (_, ret: any) => {
      ret.id = ret._id.toString()
      delete ret._id
      delete ret.__v
      return ret
    }
  },
  toObject: {
    virtuals: true,
    transform: (_, ret: any) => {
      ret.id = ret._id.toString()
      delete ret._id
      delete ret.__v
      return ret
    }
  }
})

TaskSchema.index({ projectId: 1, status: 1, order: 1 })

export default mongoose.models.Task || mongoose.model('Task', TaskSchema)
