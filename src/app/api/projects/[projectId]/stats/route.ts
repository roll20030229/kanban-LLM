import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Project from '@/models/project'
import Task from '@/models/task'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    await connectDB()

    const project = await Project.findOne({
      _id: params.projectId,
      members: session.user.id,
    })

    if (!project) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 })
    }

    const tasks = await Task.find({ projectId: params.projectId })

    const total = tasks.length
    const done = tasks.filter((t) => t.status === 'done').length
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0

    const inProgressTasks = tasks.filter(
      (t) => t.status === 'in_progress' || t.status === 'in_review'
    )
    const wipCount = inProgressTasks.length

    const doneTasks = tasks.filter((t) => t.status === 'done')
    let totalCycleTime = 0
    doneTasks.forEach((task) => {
      const cycleTime = Math.ceil(
        (new Date(task.updatedAt).getTime() - new Date(task.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
      totalCycleTime += cycleTime
    })
    const avgCycleTime = doneTasks.length > 0 ? Math.round(totalCycleTime / doneTasks.length) : 0

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentDoneTasks = doneTasks.filter(
      (t) => new Date(t.updatedAt) >= thirtyDaysAgo
    )
    const throughput = recentDoneTasks.length

    const statusDistribution = {
      todo: tasks.filter((t) => t.status === 'todo').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      in_review: tasks.filter((t) => t.status === 'in_review').length,
      done: done,
    }

    const cumulativeFlow = []
    for (let i = 30; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const tasksBeforeDate = tasks.filter((t) => new Date(t.createdAt) <= date)
      
      cumulativeFlow.push({
        date: dateStr,
        todo: tasksBeforeDate.filter((t) => t.status === 'todo').length,
        in_progress: tasksBeforeDate.filter((t) => t.status === 'in_progress').length,
        in_review: tasksBeforeDate.filter((t) => t.status === 'in_review').length,
        done: tasksBeforeDate.filter((t) => t.status === 'done').length,
      })
    }

    const burndown = []
    const totalTasks = tasks.length
    const dailyRate = totalTasks / 30
    for (let i = 0; i <= 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - 30 + i)
      const dateStr = date.toISOString().split('T')[0]
      
      const remainingAtDate = totalTasks - Math.floor(dailyRate * i)
      
      burndown.push({
        date: dateStr,
        remaining: Math.max(0, remainingAtDate),
        ideal: Math.max(0, totalTasks - Math.floor(dailyRate * i)),
      })
    }

    const stats = {
      completionRate,
      avgCycleTime,
      throughput,
      wipCount,
      statusDistribution,
      cumulativeFlow,
      burndown,
      memberStats: [],
    }

    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 })
  }
}
