import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Project from '@/models/project'
import { auth } from '@/lib/auth'
import { generateShareLink } from '@/lib/utils'
import { projectSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    console.log('Session in GET /api/projects:', JSON.stringify(session, null, 2))
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    await connectDB()
    const projects = await Project.find({
      members: session.user.id
    }).sort({ createdAt: -1 })

    return NextResponse.json(projects)
  } catch (error) {
    return NextResponse.json({ error: '获取项目失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const validation = projectSchema.safeParse(body)

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || '参数验证失败'
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const { name, description, milestones } = validation.data

    await connectDB()

    const project = await Project.create({
      name,
      description,
      shareLink: generateShareLink(),
      members: [session.user.id],
      milestones: milestones || [],
      createdBy: session.user.id,
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: '创建项目失败' }, { status: 500 })
  }
}
