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
| `list_projects` | 列出所有项目 | 无 |
| `get_project` | 获取项目详情 | `projectId` |
| `list_tasks` | 查询任务列表 | `projectId`, `status?`, `assignee?`, `priority?` |
| `get_task` | 获取任务详情 | `taskId` |
| `create_task` | 创建新任务 | `projectId`, `title`, `description?`, `status?`, `priority?`, `assignee?`, `dueDate?`, `tags?` |
| `update_task` | 更新任务 | `taskId`, 更新字段 |
| `delete_task` | 删除任务 | `taskId` |
| `get_project_stats` | 获取项目统计 | `projectId` |

## 使用示例

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

### 查看统计
```
显示项目 xxx 的统计信息
```

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
