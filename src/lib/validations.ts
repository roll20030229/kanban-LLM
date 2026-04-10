import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  email: z.string().email('邮箱格式不正确'),
  password: z
    .string()
    .min(8, '密码长度至少为 8 位')
    .regex(/[A-Z]/, '密码必须包含至少一个大写字母')
    .regex(/[a-z]/, '密码必须包含至少一个小写字母')
    .regex(/[0-9]/, '密码必须包含至少一个数字'),
})

export const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空'),
})

export const taskSchema = z.object({
  title: z.string().min(1, '任务标题不能为空').max(200, '任务标题不能超过 200 个字符'),
  description: z.string().max(2000, '任务描述不能超过 2000 个字符').optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done']).optional().default('todo'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  assignee: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const projectSchema = z.object({
  name: z.string().min(1, '项目名称不能为空').max(100, '项目名称不能超过 100 个字符'),
  description: z.string().max(500, '项目描述不能超过 500 个字符').optional(),
  members: z.array(z.string()).optional(),
  milestones: z.array(
    z.object({
      title: z.string(),
      date: z.string(),
      completed: z.boolean().optional(),
    })
  ).optional(),
})

export const shareLinkConfigSchema = z.object({
  shareLinkExpiresAt: z.string().optional(),
  shareLinkPassword: z.string().min(6, '访问密码至少 6 位').optional(),
  shareLinkMaxViews: z.number().int().positive().optional(),
})
