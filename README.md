# Vibe Kanban - 项目管理看板

基于 Next.js 14 + MongoDB 的项目管理看板系统，支持任务拖拽、数据统计和客户门户。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **数据库**: MongoDB + Mongoose
- **样式**: Tailwind CSS
- **UI组件**: ShadCN/UI
- **拖拽**: @dnd-kit
- **图表**: Recharts
- **表单**: React Hook Form + Zod
- **认证**: NextAuth.js

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并修改配置：

```bash
cp .env.example .env.local
```

需要配置的环境变量：
- `MONGODB_URI`: MongoDB连接字符串
- `NEXTAUTH_URL`: 应用URL（本地开发为 http://localhost:3000）
- `NEXTAUTH_SECRET`: NextAuth密钥（可用 `openssl rand -base64 32` 生成）

### 3. 启动MongoDB

确保MongoDB服务正在运行。如果没有安装MongoDB，可以：
- 本地安装: https://www.mongodb.com/docs/manual/installation/
- 使用Docker: `docker run -d -p 27017:27017 --name mongodb mongo:6`

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 功能特性

### 团队端功能
- 📋 看板视图：四列看板（待办、进行中、审核中、已完成）
- 🖱️ 拖拽操作：支持任务拖拽跨列流转
- 🔍 搜索筛选：支持任务搜索和优先级筛选
- 📊 数据统计：累积流图、燃尽图、核心指标
- ⚙️ 项目管理：创建项目、生成分享链接

### 客户门户
- 🔗 专属链接：通过分享链接访问项目
- 👁️ 只读模式：客户只能查看，不能编辑
- 📱 移动适配：完美适配移动端

## 项目结构

```
src/
├── app/                    # App Router路由
│   ├── (dashboard)/        # 团队端后台
│   │   ├── page.tsx        # 看板页
│   │   ├── stats/          # 统计页
│   │   └── settings/       # 设置页
│   ├── share/[projectId]/  # 客户门户
│   ├── login/              # 登录页
│   └── api/                # API路由
├── components/             # 组件
│   ├── kanban/             # 看板组件
│   ├── dashboard/          # 后台组件
│   └── ui/                 # ShadCN组件
├── lib/                    # 工具函数
├── models/                 # 数据库Model
└── types/                  # TypeScript类型
```

## 颜色系统

| 状态 | 颜色 | 色值 |
|------|------|------|
| 待办 | 蓝色 | #3b82f6 |
| 进行中 | 橙色 | #f59e0b |
| 审核中 | 紫色 | #8b5cf6 |
| 已完成 | 绿色 | #22c55e |

## 响应式设计

- **桌面端 (>1024px)**: 完整四栏布局
- **平板端 (768-1024px)**: 可折叠导航
- **移动端 (<768px)**: 底部导航、横向滚动看板

## 开发命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run start    # 启动生产服务器
npm run lint     # 运行ESLint检查
```
