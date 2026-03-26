# 项目管理Kanban技术开发文档

本文档基于产品需求文档与 UI 设计文档，定义了完整的技术实现方案，全部采用 Next\.js 生态下最成熟、最主流的开源技术栈，Trae 可直接识别该文档的技术定义，快速生成可运行的项目代码。

---

## 1\. 技术栈选型（Trae 原生适配）

所有选型均为当前行业最成熟的开源方案，Trae 已深度适配，可自动生成对应的代码与依赖配置：

|模块|选型|版本|说明|
|---|---|---|---|
|全栈框架|Next\.js|14\.2\.0|App Router 架构，支持服务端渲染与 API 路由，是当前 React 生态最主流的全栈框架|
|数据库|MongoDB|6\.0\+|文档型数据库，适配灵活的项目 / 任务数据结构，支持快速扩展|
|数据库 ODM|Mongoose|8\.2\.0|MongoDB 的成熟 ODM 框架，提供数据校验与类型定义，Trae 可自动生成 Model 代码|
|样式框架|Tailwind CSS|3\.4\.1|原子化 CSS 框架，完美适配响应式开发，Trae 原生支持生成 Tailwind 样式代码|
|UI 组件库|ShadCN/UI|最新|基于 Radix 的无样式组件库，无运行时依赖，可完全定制，Trae 已深度适配|
|拖拽交互|@dnd\-kit|11\.1\.0|成熟的 React 拖拽库，看板类项目的标配方案，稳定无 bug|
|数据可视化|Recharts|2\.12\.0|React 生态最主流的图表库，轻量易用，支持 SSR|
|表单处理|React Hook Form \+ Zod|7\.51\.0 \+ 3\.22\.4|主流的表单验证方案，和 ShadCN 完美适配|
|身份认证|NextAuth\.js|5\.0\.0|Next\.js 官方推荐的认证方案，支持多种登录方式|

---

## 2\. 项目目录结构

采用 Next\.js 14 App Router 的标准目录结构，Trae 可直接根据该结构生成对应的文件与目录：

```Plain Text
.
├── .env                # 环境变量配置
├── Dockerfile          # 部署配置
├── next.config.js      # Next.js配置
├── tailwind.config.js  # Tailwind配置
├── tsconfig.json       # TypeScript配置
└── src/
    ├── app/            # App Router路由目录
    │   ├── api/        # API路由目录
    │   │   ├── projects/ # 项目相关接口
    │   │   ├── tasks/    # 任务相关接口
    │   │   └── auth/     # 认证相关接口
    │   ├── (dashboard)/  # 团队端后台路由
    │   │   ├── page.tsx      # 首页/看板页
    │   │   ├── stats/        # 数据统计页
    │   │   └── settings/     # 设置页
    │   ├── share/          # 客户门户路由
    │   │   └── [projectId]/ # 客户专属门户，通过链接访问
    │   └── layout.tsx     # 全局布局
    ├── components/     # 通用组件目录
    │   ├── kanban/     # 看板相关组件
    │   │   ├── board.tsx       # 看板主体
    │   │   ├── column.tsx      # 看板列
    │   │   └── task-card.tsx   # 任务卡片
    │   ├── dashboard/ # 后台组件
    │   ├── share/     # 客户门户组件
    │   └── ui/        # ShadCN基础组件
    ├── lib/           # 工具函数目录
    │   ├── db.ts          # 数据库连接
    │   └── auth.ts        # 认证工具
    ├── models/        # 数据库Model目录
    │   ├── project.ts     # 项目Model
    │   ├── task.ts        # 任务Model
    │   └── user.ts        # 用户Model
    └── types/         # TypeScript类型定义
```

---

## 3\. 数据库设计

MongoDB 的 Collection 与 Schema 定义，Trae 可自动生成对应的 Mongoose Model 代码：

### 3\.1 User Collection（用户表）

```typescript
interface User {
  id: string;           // 用户ID
  name: string;         // 用户名
  email: string;        // 邮箱
  password: string;     // 加密后的密码
  avatar?: string;      // 头像
  role: 'admin' | 'member'; // 用户角色
  createdAt: Date;      // 创建时间
}
```

### 3\.2 Project Collection（项目表）

```typescript
interface Project {
  id: string;             // 项目ID
  name: string;           // 项目名称
  description?: string;   // 项目描述
  shareLink: string;      // 客户专属访问链接（唯一随机字符串）
  members: string[];      // 团队成员ID列表
  milestones: {          // 里程碑
    title: string;
    date: Date;
    completed: boolean;
  }[];
  createdBy: string;      // 创建人ID
  createdAt: Date;        // 创建时间
}
```

### 3\.3 Task Collection（任务表）

```typescript
interface Task {
  id: string;                 // 任务ID
  projectId: string;          // 所属项目ID
  title: string;              // 任务标题
  description?: string;       // 任务描述
  status: 'todo' | 'in_progress' | 'in_review' | 'done'; // 任务状态，对齐UI的四列
  priority: 'low' | 'medium' | 'high'; // 优先级
  assignee?: string;          // 负责人ID
  dueDate?: Date;             // 截止日期
  tags?: string[];            // 标签
  createdAt: Date;            // 创建时间
  updatedAt: Date;            // 更新时间
}

// 索引：projectId + status，加快项目任务的查询速度
```

---

## 4\. API 接口设计

采用 RESTful 标准接口设计，Trae 可自动生成 Next\.js 的 API 路由代码：

### 4\.1 项目相关接口

|接口|方法|说明|
|---|---|---|
|`/api/projects`|GET|获取当前用户的所有项目|
|`/api/projects`|POST|创建新项目|
|`/api/projects/:id`|GET|获取项目详情|
|`/api/projects/:id`|PATCH|更新项目信息|

### 4\.2 任务相关接口

|接口|方法|说明|
|---|---|---|
|`/api/projects/:projectId/tasks`|GET|获取项目下的所有任务|
|`/api/projects/:projectId/tasks`|POST|创建新任务|
|`/api/tasks/:id`|PATCH|更新任务信息（包括状态修改）|
|`/api/tasks/:id`|DELETE|删除任务|

### 4\.3 统计相关接口

|接口|方法|说明|
|---|---|---|
|`/api/projects/:projectId/stats`|GET|获取项目的效率统计数据|

### 4\.4 客户门户接口

|接口|方法|说明|
|---|---|---|
|`/api/share/:shareLink`|GET|通过分享链接获取项目的只读信息|
|`/api/share/:shareLink/tasks`|GET|获取分享项目的只读任务列表|

---

## 5\. 核心功能技术实现

### 5\.1 看板拖拽功能

使用`@dnd\-kit`实现，核心逻辑：

1. 用`DndContext`包裹整个看板

2. 每个列用`SortableContext`包裹

3. 任务卡片用`useSortable`实现拖拽

4. 拖拽结束后，调用 PATCH 接口更新任务状态
Trae 可自动生成该功能的完整代码，无需额外适配。

### 5\.2 客户门户权限控制

1. 客户通过专属的 shareLink 访问，无需登录

2. 接口层校验 shareLink 的有效性，仅返回对应项目的只读数据

3. 前端禁用所有编辑、拖拽交互，完全只读

4. 自动适配移动端，保证客户的访问体验

### 5\.3 效率统计功能

1. 后端自动聚合任务的流转数据，计算完成率、周期时间、吞吐量等指标

2. 前端用 Recharts 渲染累积流图、燃尽图等图表

3. 支持按周 / 月筛选时间范围

---

## 6\. Trae 开发指南

你可以直接将本文档的完整内容，复制到 Trae 的 Builder 模式的输入框中，Trae 会：

1. 自动识别所有的技术栈选型，自动安装对应的依赖

2. 自动生成标准的 Next\.js 项目目录结构

3. 自动生成 MongoDB 的 Model 与 API 接口代码

4. 自动生成对齐参考 UI 的前端组件与交互代码

5. 自动生成 Dockerfile 与环境变量配置文件

整个过程无需你手动编写代码，10 分钟内即可生成可运行的完整项目原型。

---

## 7\. 部署方案

采用 Docker 容器化部署，Trae 会自动生成 Dockerfile 与 docker\-compose\.yml，你可以一键部署到你的服务器，支持：

1. 环境变量配置，区分开发 / 生产环境

2. MongoDB 的持久化存储

3. 自动重启与健康检查

> （注：文档部分内容可能由 AI 生成）
