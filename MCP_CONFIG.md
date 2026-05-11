# MCP Server 配置指南

## 概述

Vibe Kanban现已支持通过MCP（Model Context Protocol）协议与Trae IDE集成，实现双向任务管理。

## 架构

```
Trae IDE (MCP Client)
    ↓ HTTP + SSE
Vibe Kanban (MCP Server)
    ↓
任务/项目API
```

## 在Trae中配置MCP连接

### 步骤1：启动Kanban服务

```bash
npm run dev
```

确保服务运行在 `http://localhost:3000`

### 步骤2：配置Trae MCP

在Trae IDE中，打开设置，找到MCP配置部分，添加以下配置：

```json
{
  "mcpServers": {
    "vibe-kanban": {
      "url": "http://localhost:3000/api/mcp/sse",
      "name": "Vibe Kanban",
      "description": "项目管理看板系统"
    }
  }
}
```

### 步骤3：验证连接

在Trae对话框中输入：
```
列出我的所有项目
```

如果配置正确，Trae将调用MCP工具并返回您的项目列表。

## 可用的MCP Tools

| Tool名称 | 功能 | 参数 |
|---------|------|------|
| `create_project` | 创建新项目（支持自动拆解模块任务） | `name`, `description?`, `milestones?`, `modules?` |
| `update_project` | 更新项目信息 | `projectId`, `name?`, `description?`, `milestones?` |
| `list_projects` | 列出所有项目 | 无 |
| `get_project` | 获取项目详情 | `projectId` |
| `list_tasks` | 查询任务列表 | `projectId`, `status?`, `assignee?`, `priority?` |
| `get_task` | 获取任务详情 | `taskId` |
| `create_task` | 创建新任务 | `projectId`, `title`, `description?`, `status?`, `priority?`, `assignee?`, `dueDate?`, `tags?` |
| `update_task` | 更新任务 | `taskId`, 更新字段 |
| `delete_task` | 删除任务 | `taskId` |
| `add_dev_log` | 添加开发日志 | `taskId`, `eventType`, `content`, `author` |
| `get_project_stats` | 获取项目统计 | `projectId` |

## 使用示例

### 创建项目（自动拆解任务）
```
帮我创建一个电商系统项目，包含前端开发、后端API、数据库设计模块
```

### 查看项目
```
列出我的所有项目
```

### 查看任务
```
查看项目 xxx 的所有待办任务
```

### 创建任务
```
在项目 xxx 中创建一个高优先级任务：修复登录bug，负责人是张三，截止日期2026-05-01
```

### 更新任务
```
将任务 xxx 的状态改为进行中
```

### 更新项目
```
更新项目 xxx 的描述为"新版电商系统"
```

### 查看统计
```
显示项目 xxx 的统计信息
```

### 添加开发日志

AI Agent 在开发过程中会自动在关键节点写入开发日志，也可以手动触发：

```
为任务 xxx 添加一条开发日志：开始开发用户认证模块
```

```
为任务 xxx 记录一个技术决策：选择 Redis 作为会话存储
```

#### eventType 参数说明

| eventType | 含义 | 使用场景 |
|-----------|------|---------|
| `start` | 开始开发 | AI 开始编写某个模块的代码时 |
| `decision` | 技术决策 | 做出技术选型、架构设计等决策时 |
| `problem` | 遇到问题 | 开发过程中遇到阻碍性问题时 |
| `fix` | Bug修复 | 修复 Bug 或解决上述问题时 |
| `refactor` | 重构 | 进行重要代码重构时 |
| `complete` | 模块完成 | 模块开发完成时 |

#### author 参数格式

格式为 `Agent类型-用户名`，用于区分不同团队成员的 AI Agent 写入的日志：
- 使用 Trae 的用户：`Trae-张三`
- 使用 Cursor 的用户：`Cursor-李四`
- 使用其他 Agent 的用户：`AgentType-用户名`

## 认证

MCP接口支持两种认证方式：

### 方式1：API Key认证（推荐用于Trae IDE）

1. 在 `.env.local` 文件中设置 `MCP_API_KEY`：
```
MCP_API_KEY=your-secure-api-key-here
```

2. 在Trae MCP配置中添加API Key：
```json
{
  "mcpServers": {
    "vibe-kanban": {
      "url": "http://localhost:3000/api/mcp/sse",
      "name": "Vibe Kanban",
      "description": "项目管理看板系统",
      "headers": {
        "Authorization": "Bearer your-secure-api-key-here"
      }
    }
  }
}
```

### 方式2：Session认证

MCP接口也复用NextAuth认证。确保您已登录Kanban系统，Trae将使用相同的session进行认证。

## 权限控制

- 用户只能访问自己有权限的项目
- 基于项目成员关系进行权限验证
- 所有操作都会验证用户身份

## 故障排除

### 连接失败
1. 确认Kanban服务正在运行
2. 检查MCP URL是否正确
3. 确认已登录Kanban系统

### 权限错误
1. 确认用户是项目成员
2. 检查session是否有效

### 工具调用失败
1. 检查参数是否正确
2. 查看控制台日志获取详细错误信息

## 跨项目同步配置

Vibe Kanban 支持在 Trae 中创建的任何项目自动同步到看板，不仅限于 Kanban 项目本身。

### 前提条件

1. **Kanban 服务持续运行**：确保 `http://localhost:3000` 可访问
2. **MCP 全局配置**：MCP 连接已配置在 Trae 全局设置中（非项目级别）

### 配置步骤

#### 1. 确认 MCP 全局配置

MCP 配置文件位于：`%APPDATA%\Trae CN\User\mcp.json`

确保内容包含：
```json
{
  "mcpServers": {
    "vibe-kanban": {
      "url": "http://localhost:3000/api/mcp/sse",
      "name": "Vibe Kanban",
      "description": "项目管理看板系统"
    }
  }
}
```

这样配置后，**所有 Trae 项目**都可以访问 Kanban MCP 工具。

#### 2. 配置个人规则（全局生效）

在 Trae 中添加个人规则，使所有项目都自动同步到 Kanban：

1. 点击 Trae 右上角 **设置** 图标
2. 在左侧导航栏选择 **规则和技能**
3. 在 **个人规则** 部分，点击 **+ 创建 user_rules.md**
4. 将 `.trae/rules/user_rules_template.md` 的内容复制到 `user_rules.md` 中
5. 保存文件

配置完成后，无论你在 Trae 中打开哪个项目，AI 都会：
- 自动识别项目信息（名称、描述、模块结构）
- 询问你是否同步到 Kanban
- 你确认后自动创建项目和拆解任务

#### 3. 新项目工作流

当你在 Trae 中创建一个新项目时：

```
1. 打开新项目目录
2. AI 自动识别项目信息
3. AI 询问："检测到新项目 [项目名]，是否同步到 Kanban？"
4. 你确认后，AI 调用 create_project 创建项目和模块任务
5. 开始开发时，AI 自动将对应任务状态改为 in_progress，并写入 start 类型开发日志
6. 开发过程中，AI 在关键节点自动写入开发日志（技术决策、遇到问题、Bug修复、重构等）
7. 模块完成时，AI 自动将任务状态改为 in_review，并写入 complete 类型开发日志
```

这样团队成员可以通过查看任务的开发日志，了解每个模块的完整开发过程和决策依据，实现追根溯源。

#### 4. 为新项目添加项目级规则（可选）

如果你希望某个项目有更细粒度的同步规则，可以在该项目根目录创建 `.trae/rules/project_rules.md`，将 Kanban 项目的规则模板复制过去即可。
