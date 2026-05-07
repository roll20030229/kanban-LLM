import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { connectDB } from "@/lib/db"
import Project from "@/models/project"
import Task from "@/models/task"
import { auth } from "@/lib/auth"
import { generateShareLink } from "@/lib/utils"

export const mcpServer = new McpServer({
  name: "vibe-kanban",
  version: "1.0.0",
})

mcpServer.tool(
  "create_project",
  "创建一个新项目，支持自动拆解模块任务。当在Trae中开始新项目开发时，应调用此工具同步创建Kanban项目",
  {
    name: z.string().describe("项目名称"),
    description: z.string().optional().describe("项目描述"),
    milestones: z.array(z.object({
      title: z.string().describe("里程碑标题"),
      date: z.string().describe("里程碑日期，ISO 8601格式"),
    })).optional().describe("项目里程碑列表"),
    modules: z.array(z.string()).optional().describe("项目模块列表，用于自动拆解任务。例如：['前端开发', '后端API', '数据库设计']"),
  },
  async ({ name, description, milestones, modules }) => {
    try {
      const session = await auth()
      if (!session?.user?.id) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "未授权，请先登录" }) }],
          isError: true,
        }
      }

      await connectDB()

      const project = await Project.create({
        name,
        description,
        shareLink: generateShareLink(),
        members: [session.user.id],
        milestones: milestones?.map(m => ({
          title: m.title,
          date: new Date(m.date),
          completed: false,
        })) || [],
        createdBy: session.user.id,
      })

      const createdTasks = []
      if (modules && modules.length > 0) {
        for (let i = 0; i < modules.length; i++) {
          const task = await Task.create({
            projectId: project._id.toString(),
            title: modules[i],
            description: `${name}项目 - ${modules[i]}模块`,
            status: "todo",
            priority: "medium",
            tags: [modules[i]],
            order: i,
          })
          createdTasks.push({
            id: task._id.toString(),
            title: task.title,
            status: task.status,
          })
        }
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            message: "项目创建成功",
            project: {
              id: project._id.toString(),
              name: project.name,
              description: project.description,
              shareLink: project.shareLink,
            },
            autoCreatedTasks: createdTasks,
            taskCount: createdTasks.length,
          }, null, 2)
        }],
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "创建项目失败", details: String(error) }) }],
        isError: true,
      }
    }
  }
)

mcpServer.tool(
  "update_project",
  "更新指定项目的信息，包括名称、描述、里程碑等",
  {
    projectId: z.string().describe("项目ID"),
    name: z.string().optional().describe("新项目名称"),
    description: z.string().optional().describe("新项目描述"),
    milestones: z.array(z.object({
      title: z.string().describe("里程碑标题"),
      date: z.string().describe("里程碑日期，ISO 8601格式"),
      completed: z.boolean().optional().describe("是否已完成"),
    })).optional().describe("更新里程碑列表"),
  },
  async ({ projectId, name, description, milestones }) => {
    try {
      const session = await auth()
      if (!session?.user?.id) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "未授权，请先登录" }) }],
          isError: true,
        }
      }

      await connectDB()
      const project = await Project.findOne({
        _id: projectId,
        members: session.user.id
      })

      if (!project) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "项目不存在或无权限访问" }) }],
          isError: true,
        }
      }

      const updateData: any = {}
      if (name !== undefined) updateData.name = name
      if (description !== undefined) updateData.description = description
      if (milestones !== undefined) {
        updateData.milestones = milestones.map(m => ({
          title: m.title,
          date: new Date(m.date),
          completed: m.completed || false,
        }))
      }

      const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        updateData,
        { new: true, runValidators: true }
      )

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            message: "项目更新成功",
            project: {
              id: updatedProject!._id.toString(),
              name: updatedProject!.name,
              description: updatedProject!.description,
              milestones: updatedProject!.milestones,
            },
          }, null, 2)
        }],
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "更新项目失败", details: String(error) }) }],
        isError: true,
      }
    }
  }
)

mcpServer.tool(
  "list_projects",
  "列出当前用户有权限访问的所有项目",
  {},
  async () => {
    try {
      const session = await auth()
      if (!session?.user?.id) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "未授权，请先登录" }) }],
          isError: true,
        }
      }

      await connectDB()
      const projects = await Project.find({
        members: session.user.id
      }).sort({ createdAt: -1 })

      return {
        content: [{ type: "text", text: JSON.stringify({ projects }, null, 2) }],
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "获取项目失败", details: String(error) }) }],
        isError: true,
      }
    }
  }
)

mcpServer.tool(
  "get_project",
  "获取指定项目的详细信息，包括里程碑",
  {
    projectId: z.string().describe("项目ID"),
  },
  async ({ projectId }) => {
    try {
      const session = await auth()
      if (!session?.user?.id) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "未授权，请先登录" }) }],
          isError: true,
        }
      }

      await connectDB()
      const project = await Project.findOne({
        _id: projectId,
        members: session.user.id
      })

      if (!project) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "项目不存在或无权限访问" }) }],
          isError: true,
        }
      }

      return {
        content: [{ type: "text", text: JSON.stringify({ project }, null, 2) }],
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "获取项目详情失败", details: String(error) }) }],
        isError: true,
      }
    }
  }
)

mcpServer.tool(
  "list_tasks",
  "查询指定项目的任务列表，支持按状态、负责人、优先级筛选",
  {
    projectId: z.string().describe("项目ID"),
    status: z.enum(["todo", "in_progress", "in_review", "done"]).optional().describe("任务状态筛选"),
    assignee: z.string().optional().describe("负责人筛选"),
    priority: z.enum(["low", "medium", "high"]).optional().describe("优先级筛选"),
  },
  async ({ projectId, status, assignee, priority }) => {
    try {
      const session = await auth()
      if (!session?.user?.id) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "未授权，请先登录" }) }],
          isError: true,
        }
      }

      const project = await Project.findOne({
        _id: projectId,
        members: session.user.id
      })

      if (!project) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "项目不存在或无权限访问" }) }],
          isError: true,
        }
      }

      await connectDB()
      
      const filter: any = { projectId }
      if (status) filter.status = status
      if (assignee) filter.assignee = assignee
      if (priority) filter.priority = priority

      const tasks = await Task.find(filter).sort({ status: 1, order: 1 })

      return {
        content: [{ type: "text", text: JSON.stringify({ tasks, count: tasks.length }, null, 2) }],
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "获取任务列表失败", details: String(error) }) }],
        isError: true,
      }
    }
  }
)

mcpServer.tool(
  "get_task",
  "获取指定任务的详细信息",
  {
    taskId: z.string().describe("任务ID"),
  },
  async ({ taskId }) => {
    try {
      const session = await auth()
      if (!session?.user?.id) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "未授权，请先登录" }) }],
          isError: true,
        }
      }

      await connectDB()
      const task = await Task.findById(taskId)

      if (!task) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "任务不存在" }) }],
          isError: true,
        }
      }

      const project = await Project.findOne({
        _id: task.projectId,
        members: session.user.id
      })

      if (!project) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "无权限访问此任务" }) }],
          isError: true,
        }
      }

      return {
        content: [{ type: "text", text: JSON.stringify({ task }, null, 2) }],
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "获取任务详情失败", details: String(error) }) }],
        isError: true,
      }
    }
  }
)

mcpServer.tool(
  "create_task",
  "在指定项目中创建新任务",
  {
    projectId: z.string().describe("项目ID"),
    title: z.string().describe("任务标题"),
    description: z.string().optional().describe("任务描述"),
    status: z.enum(["todo", "in_progress", "in_review", "done"]).optional().describe("任务状态，默认为todo"),
    priority: z.enum(["low", "medium", "high"]).optional().describe("优先级，默认为medium"),
    assignee: z.string().optional().describe("负责人"),
    dueDate: z.string().optional().describe("截止日期，ISO 8601格式"),
    tags: z.array(z.string()).optional().describe("标签列表"),
  },
  async ({ projectId, title, description, status, priority, assignee, dueDate, tags }) => {
    try {
      const session = await auth()
      if (!session?.user?.id) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "未授权，请先登录" }) }],
          isError: true,
        }
      }

      const project = await Project.findOne({
        _id: projectId,
        members: session.user.id
      })

      if (!project) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "项目不存在或无权限访问" }) }],
          isError: true,
        }
      }

      await connectDB()

      const maxOrderTask = await Task.findOne({ 
        projectId,
        status: status || "todo"
      }).sort({ order: -1 })

      const newOrder = maxOrderTask ? maxOrderTask.order + 1 : 0

      const task = await Task.create({
        projectId,
        title,
        description,
        status: status || "todo",
        priority: priority || "medium",
        assignee,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        tags: tags || [],
        order: newOrder,
      })

      return {
        content: [{ type: "text", text: JSON.stringify({ message: "任务创建成功", task }, null, 2) }],
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "创建任务失败", details: String(error) }) }],
        isError: true,
      }
    }
  }
)

mcpServer.tool(
  "update_task",
  "更新指定任务的信息",
  {
    taskId: z.string().describe("任务ID"),
    title: z.string().optional().describe("新任务标题"),
    description: z.string().optional().describe("新任务描述"),
    status: z.enum(["todo", "in_progress", "in_review", "done"]).optional().describe("新任务状态"),
    priority: z.enum(["low", "medium", "high"]).optional().describe("新优先级"),
    assignee: z.string().optional().describe("新负责人"),
    dueDate: z.string().optional().describe("新截止日期，ISO 8601格式"),
    tags: z.array(z.string()).optional().describe("新标签列表"),
  },
  async ({ taskId, title, description, status, priority, assignee, dueDate, tags }) => {
    try {
      const session = await auth()
      if (!session?.user?.id) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "未授权，请先登录" }) }],
          isError: true,
        }
      }

      await connectDB()
      const task = await Task.findById(taskId)

      if (!task) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "任务不存在" }) }],
          isError: true,
        }
      }

      const project = await Project.findOne({
        _id: task.projectId,
        members: session.user.id
      })

      if (!project) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "无权限修改此任务" }) }],
          isError: true,
        }
      }

      const updateData: any = {}
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (status !== undefined) updateData.status = status
      if (priority !== undefined) updateData.priority = priority
      if (assignee !== undefined) updateData.assignee = assignee
      if (dueDate !== undefined) updateData.dueDate = new Date(dueDate)
      if (tags !== undefined) updateData.tags = tags
      updateData.updatedAt = new Date()

      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        updateData,
        { new: true, runValidators: true }
      )

      return {
        content: [{ type: "text", text: JSON.stringify({ message: "任务更新成功", task: updatedTask }, null, 2) }],
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "更新任务失败", details: String(error) }) }],
        isError: true,
      }
    }
  }
)

mcpServer.tool(
  "delete_task",
  "删除指定的任务",
  {
    taskId: z.string().describe("任务ID"),
  },
  async ({ taskId }) => {
    try {
      const session = await auth()
      if (!session?.user?.id) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "未授权，请先登录" }) }],
          isError: true,
        }
      }

      await connectDB()
      const task = await Task.findById(taskId)

      if (!task) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "任务不存在" }) }],
          isError: true,
        }
      }

      const project = await Project.findOne({
        _id: task.projectId,
        members: session.user.id
      })

      if (!project) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "无权限删除此任务" }) }],
          isError: true,
        }
      }

      await Task.findByIdAndDelete(taskId)

      return {
        content: [{ type: "text", text: JSON.stringify({ message: "任务删除成功", taskId }) }],
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "删除任务失败", details: String(error) }) }],
        isError: true,
      }
    }
  }
)

mcpServer.tool(
  "get_project_stats",
  "获取项目的统计信息，包括任务数量、完成率等",
  {
    projectId: z.string().describe("项目ID"),
  },
  async ({ projectId }) => {
    try {
      const session = await auth()
      if (!session?.user?.id) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "未授权，请先登录" }) }],
          isError: true,
        }
      }

      const project = await Project.findOne({
        _id: projectId,
        members: session.user.id
      })

      if (!project) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "项目不存在或无权限访问" }) }],
          isError: true,
        }
      }

      await connectDB()
      
      const totalTasks = await Task.countDocuments({ projectId })
      const todoTasks = await Task.countDocuments({ projectId, status: "todo" })
      const inProgressTasks = await Task.countDocuments({ projectId, status: "in_progress" })
      const inReviewTasks = await Task.countDocuments({ projectId, status: "in_review" })
      const doneTasks = await Task.countDocuments({ projectId, status: "done" })

      const completionRate = totalTasks > 0 ? ((doneTasks / totalTasks) * 100).toFixed(2) : 0

      const stats = {
        totalTasks,
        statusBreakdown: {
          todo: todoTasks,
          in_progress: inProgressTasks,
          in_review: inReviewTasks,
          done: doneTasks,
        },
        completionRate: `${completionRate}%`,
      }

      return {
        content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "获取项目统计失败", details: String(error) }) }],
        isError: true,
      }
    }
  }
)
