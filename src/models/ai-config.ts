import mongoose from 'mongoose'

const AIConfigSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  modelType: {
    type: String,
    enum: ['openai', 'qwen', 'doubao', 'wenxin', 'claude', 'custom'],
    default: 'openai',
  },
  encryptedApiKey: {
    type: String,
    required: false,
  },
  apiKeyIv: {
    type: String,
    required: false,
  },
  modelName: {
    type: String,
    default: 'gpt-3.5-turbo',
  },
  endpoint: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: {
    virtuals: true,
    transform: (_, ret: any) => {
      ret.id = ret._id.toString()
      delete ret._id
      delete ret.__v
      delete ret.encryptedApiKey
      delete ret.apiKeyIv
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

AIConfigSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.AIConfig || mongoose.model('AIConfig', AIConfigSchema)
