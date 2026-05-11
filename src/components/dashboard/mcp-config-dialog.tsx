'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Check, Plug } from 'lucide-react'
import { cn } from '@/lib/utils'

interface McpConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function McpConfigDialog({ open, onOpenChange }: McpConfigDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [authorName, setAuthorName] = useState('')

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  const sseUrl = `${baseUrl}/api/mcp/sse`

  const mcpJsonConfig = JSON.stringify({
    mcpServers: {
      "vibe-kanban": {
        url: sseUrl,
        name: "Vibe Kanban",
        description: "项目管理看板系统",
      }
    }
  }, null, 2)

  const authorFormat = authorName ? `Trae-${authorName}` : 'Trae-你的名字'

  const personalRules = `# Vibe Kanban 全局同步规则（个人规则）

本规则适用于所有 Trae 项目，确保每个新项目的开发进度自动同步到 Vibe Kanban 看板系统。

## 规则一：新项目自动识别与同步

当用户在 Trae 中打开或创建一个新项目时，AI 应主动执行以下操作：

1. 识别项目信息（package.json / README.md / 目录名）
2. 确认同步：向用户展示识别结果，询问是否同步到 Kanban
3. 用户确认后，调用 create_project 创建项目并自动拆解模块任务

## 规则二：开发进度自动同步

当 AI 开始编写某个功能模块的代码时：
1. 识别当前正在开发的模块
2. 使用 list_tasks 查找项目中匹配的任务
3. 使用 update_task 将任务状态改为 in_progress
4. 调用 add_dev_log 写入一条 start 类型的开发日志
5. 这是自动行为，无需每次询问用户

## 规则二-B：开发日志自动写入

AI 在开发过程中，必须在关键节点自动调用 add_dev_log 工具写入开发日志。

### 事件类型

| eventType | 触发时机 |
|-----------|---------|
| start | 开始编写某个模块的代码时 |
| decision | 做出技术选型、架构设计等决策时 |
| problem | 开发过程中遇到阻碍性问题时 |
| fix | 修复 Bug 或解决上述问题时 |
| refactor | 进行重要代码重构时 |
| complete | 模块开发完成时 |

### author 字段

格式为 Agent类型-用户名，你的 author 为：${authorFormat}
AI 应在首次对话时询问用户名称偏好。

### 写入原则

- 简洁摘要，类似 Git commit message 风格
- 技术决策类日志必须包含决策理由
- problem 和 fix 应成对出现
- 只在关键节点写入，避免冗余

## 规则三：模块完成自动同步

当某个模块的开发完成时，将对应任务状态更新为 in_review，并写入一条 complete 类型的开发日志。

## 规则四：手动指令

| 用户指令 | 操作 |
|---------|------|
| 同步到看板 | 识别项目并创建到 Kanban |
| 把XX改为进行中 | update_task({ status: "in_progress" }) |
| 把XX改为已完成 | update_task({ status: "done" }) |
| 查看项目进度 | get_project_stats |
| 写一条开发日志 | add_dev_log({ eventType, content, author }) |

## 排除条件

- 如果当前项目是 Vibe Kanban 本身，不需要同步
- 如果用户明确表示不需要同步，则跳过`

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-black/80 backdrop-blur-[30px] border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white/90">
            <div className="w-8 h-8 rounded-[10px] bg-white/[0.06] border border-white/[0.1] flex items-center justify-center">
              <Plug className="h-4 w-4 text-white/70" />
            </div>
            MCP 连接配置
          </DialogTitle>
          <DialogDescription className="text-white/35">
            将以下配置添加到你的 AI Agent 中，即可实现项目进度自动同步和开发日志写入
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="config" className="mt-4">
          <TabsList className="bg-white/[0.03] border border-white/[0.06] rounded-[10px]">
            <TabsTrigger value="config" className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white/90 rounded-[8px]">
              连接配置
            </TabsTrigger>
            <TabsTrigger value="rules" className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white/90 rounded-[8px]">
              个人规则
            </TabsTrigger>
            <TabsTrigger value="guide" className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white/90 rounded-[8px]">
              使用指南
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-white/55 text-sm font-medium">MCP SSE 地址</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={sseUrl}
                  className="flex-1 bg-white/[0.03] border-white/[0.06] text-white/60 text-sm font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12]"
                  onClick={() => handleCopy(sseUrl, 'sseUrl')}
                >
                  {copiedField === 'sseUrl' ? (
                    <Check className="h-4 w-4 text-white/60" />
                  ) : (
                    <Copy className="h-4 w-4 text-white/40" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/55 text-sm font-medium">Trae MCP 完整配置（一键复制）</Label>
              <div className="relative">
                <pre className="p-4 rounded-[12px] bg-white/[0.03] border border-white/[0.06] text-sm font-mono text-white/60 overflow-x-auto whitespace-pre">
                  {mcpJsonConfig}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-3 right-3 h-8 px-3 border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12]"
                  onClick={() => handleCopy(mcpJsonConfig, 'mcpJson')}
                >
                  {copiedField === 'mcpJson' ? (
                    <><Check className="h-3.5 w-3.5 text-white/60 mr-1.5" />已复制</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5 text-white/40 mr-1.5" />复制</>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/55 text-sm font-medium">你的名称（用于开发日志 author 字段）</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="输入你的名字"
                  className="flex-1 bg-white/[0.03] border-white/[0.06] text-white/60"
                />
                <div className="text-sm text-white/35 whitespace-nowrap">
                  日志标识：<span className="text-white/70">{authorFormat}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white/55 text-sm font-medium">个人规则内容</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12]"
                  onClick={() => handleCopy(personalRules, 'rules')}
                >
                  {copiedField === 'rules' ? (
                    <><Check className="h-3.5 w-3.5 text-white/60 mr-1.5" />已复制</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5 text-white/40 mr-1.5" />复制全部</>
                  )}
                </Button>
              </div>
              <pre className="p-4 rounded-[12px] bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-white/50 overflow-auto max-h-[400px] whitespace-pre-wrap">
                {personalRules}
              </pre>
            </div>

            <div className="rounded-[12px] bg-white/[0.03] border border-white/[0.06] p-4">
              <h4 className="text-sm font-medium text-white/70 mb-2">如何添加到 Trae</h4>
              <ol className="text-xs text-white/40 space-y-1.5 list-decimal list-inside">
                <li>点击 Trae 右上角 <strong className="text-white/60">设置</strong> 图标</li>
                <li>左侧导航选择 <strong className="text-white/60">规则和技能</strong></li>
                <li>在 <strong className="text-white/60">个人规则</strong> 部分，点击 <strong className="text-white/60">+ 创建 user_rules.md</strong></li>
                <li>将上方内容粘贴进去，保存文件</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="guide" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="rounded-[12px] bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
                <h4 className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/[0.1] text-white/60 text-[10px] flex items-center justify-center font-bold">1</span>
                  配置 MCP 连接
                </h4>
                <p className="text-xs text-white/35 pl-7">
                  在「连接配置」Tab 中复制 JSON 配置，粘贴到 Trae 的 MCP 设置中
                </p>
              </div>

              <div className="rounded-[12px] bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
                <h4 className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/[0.1] text-white/60 text-[10px] flex items-center justify-center font-bold">2</span>
                  配置个人规则
                </h4>
                <p className="text-xs text-white/35 pl-7">
                  在「个人规则」Tab 中复制规则内容，添加到 Trae 的个人规则中
                </p>
              </div>

              <div className="rounded-[12px] bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
                <h4 className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/[0.1] text-white/60 text-[10px] flex items-center justify-center font-bold">3</span>
                  开始使用
                </h4>
                <p className="text-xs text-white/35 pl-7">
                  打开任意项目，AI 会自动识别并询问是否同步到 Kanban。开发过程中 AI 会在关键节点自动写入开发日志。
                </p>
              </div>
            </div>

            <div className="rounded-[12px] bg-white/[0.03] border border-white/[0.06] p-4">
              <h4 className="text-sm font-medium text-white/60 mb-2">开发日志事件类型</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'start', label: '开始开发', color: 'text-white/50' },
                  { type: 'decision', label: '技术决策', color: 'text-white/50' },
                  { type: 'problem', label: '遇到问题', color: 'text-white/50' },
                  { type: 'fix', label: 'Bug修复', color: 'text-white/50' },
                  { type: 'refactor', label: '重构', color: 'text-white/50' },
                  { type: 'complete', label: '模块完成', color: 'text-white/50' },
                ].map(item => (
                  <div key={item.type} className="flex items-center gap-2 text-xs">
                    <span className={cn('font-mono', item.color)}>{item.type}</span>
                    <span className="text-white/30">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[12px] bg-white/[0.03] border border-white/[0.06] p-4">
              <h4 className="text-sm font-medium text-white/60 mb-2">支持的 AI Agent</h4>
              <p className="text-xs text-white/35">
                任何支持 MCP 协议的 AI Agent 都可以连接，包括 Trae、Cursor、Windsurf、Cline 等。
                只需将 MCP SSE 地址配置到对应 Agent 的 MCP 设置中即可。
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
