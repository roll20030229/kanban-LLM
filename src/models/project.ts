import mongoose from 'mongoose'

const MilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  completed: { type: Boolean, default: false },
})

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  shareLink: { type: String, required: true, unique: true },
  shareLinkExpiresAt: { type: Date },
  shareLinkPassword: { type: String },
  shareLinkMaxViews: { type: Number },
  shareLinkCurrentViews: { type: Number, default: 0 },
  members: [{ type: String }],
  milestones: [MilestoneSchema],
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema)
