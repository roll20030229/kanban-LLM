'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { ProjectStats } from '@/types'
import { CheckCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react'
import { useProject } from '@/contexts/project-context'

const demoStats: ProjectStats = {
  completionRate: 40,
  avgCycleTime: 3,
  throughput: 12,
  wipCount: 2,
  statusDistribution: {
    todo: 1,
    in_progress: 1,
    in_review: 1,
    done: 2,
  },
  cumulativeFlow: Array.from({ length: 31 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    todo: Math.max(0, 5 - Math.floor(i / 6)),
    in_progress: Math.max(0, 3 - Math.floor(i / 10)),
    in_review: Math.max(0, 2 - Math.floor(i / 15)),
    done: Math.min(5, Math.floor(i / 6)),
  })),
  burndown: Array.from({ length: 31 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    remaining: Math.max(0, 5 - Math.floor(i / 6)),
    ideal: Math.max(0, 5 - (5 / 30) * i),
  })),
  memberStats: [],
}

export default function StatsPage() {
  const { currentProject, loading: projectLoading } = useProject()
  const [stats, setStats] = useState<ProjectStats | null>(demoStats)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  const fetchStats = useCallback(async () => {
    if (!currentProject) {
      setIsDemo(true)
      setLoading(false)
      return
    }

    setIsDemo(false)
    try {
      const res = await fetch(`/api/projects/${currentProject._id}/stats`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else if (res.status === 401) {
        window.location.href = '/login'
        return
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      setStats(demoStats)
    } finally {
      setLoading(false)
    }
  }, [currentProject])

  useEffect(() => {
    if (!projectLoading) {
      fetchStats()
    }
  }, [fetchStats, projectLoading])

  if (projectLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500">暂无统计数据</p>
      </div>
    )
  }

  const metricCards = [
    {
      title: '完成率',
      value: `${stats.completionRate}%`,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: '平均周期时间',
      value: `${stats.avgCycleTime}天`,
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: '吞吐量',
      value: `${stats.throughput}个/月`,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: '在制品数量',
      value: stats.wipCount,
      icon: AlertCircle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      {isDemo && (
        <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 text-center text-sm text-yellow-800 rounded-lg">
          演示模式 - 显示模拟数据。请创建项目以查看真实数据。
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">数据统计</h1>
        {currentProject && (
          <span className="text-sm text-gray-500">当前项目: {currentProject.name}</span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="cumulative" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cumulative">累积流图</TabsTrigger>
          <TabsTrigger value="burndown">燃尽图</TabsTrigger>
        </TabsList>

        <TabsContent value="cumulative">
          <Card>
            <CardHeader>
              <CardTitle>累积流图</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.cumulativeFlow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="done"
                      stackId="1"
                      stroke="#22c55e"
                      fill="#22c55e"
                      name="已完成"
                    />
                    <Area
                      type="monotone"
                      dataKey="in_review"
                      stackId="1"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      name="审核中"
                    />
                    <Area
                      type="monotone"
                      dataKey="in_progress"
                      stackId="1"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      name="进行中"
                    />
                    <Area
                      type="monotone"
                      dataKey="todo"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      name="待办"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="burndown">
          <Card>
            <CardHeader>
              <CardTitle>燃尽图</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.burndown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="remaining"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="剩余任务"
                    />
                    <Line
                      type="monotone"
                      dataKey="ideal"
                      stroke="#9ca3af"
                      strokeDasharray="5 5"
                      name="理想曲线"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>任务分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(stats.statusDistribution).map(([status, count]) => (
              <div
                key={status}
                className="text-center p-4 rounded-lg bg-gray-50"
              >
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {status === 'todo' && '待办'}
                  {status === 'in_progress' && '进行中'}
                  {status === 'in_review' && '审核中'}
                  {status === 'done' && '已完成'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
