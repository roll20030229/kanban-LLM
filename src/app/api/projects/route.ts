import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Project from '@/models/project'
import { auth } from '@/lib/auth'
import { generateShareLink } from '@/lib/utils'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
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
    const { name, description, milestones } = body

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
