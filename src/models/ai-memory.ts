import mongoose from 'mongoose'

const AIMessageSchema = new mongoose.Schema({
  role: { 
    type: String, 
    enum: ['user', 'assistant', 'system'],
    required: true 
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
})

const AIMemorySchema = new mongoose.Schema({
  projectId: { 
    type: String, 
    required: true,
    index: true 
  },
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  
  messages: [AIMessageSchema],
  
  memorySummary: {
    teamAssignments: [{
      member: String,
      modules: [String],
      updatedAt: Date,
    }],
    userHabits: {
      taskSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
      averageTaskDays: { type: Number, default: 2 },
      preferences: [String],
      updatedAt: Date,
    },
    commonModules: [String],
    lastSummaryUpdate: Date,
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

AIMemorySchema.index({ projectId: 1, userId: 1 }, { unique: true })

export default mongoose.models.AIMemory || mongoose.model('AIMemory', AIMemorySchema)
