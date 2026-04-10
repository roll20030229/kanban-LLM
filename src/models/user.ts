import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
}, {
  toJSON: {
    virtuals: true,
    transform: (_, ret: any) => {
      ret.id = ret._id.toString()
      delete ret._id
      delete ret.__v
      delete ret.password
      return ret
    }
  },
  toObject: {
    virtuals: true,
    transform: (_, ret: any) => {
      ret.id = ret._id.toString()
      delete ret._id
      delete ret.__v
      delete ret.password
      return ret
    }
  }
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
