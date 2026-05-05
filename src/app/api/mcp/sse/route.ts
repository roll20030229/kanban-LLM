import { NextRequest, NextResponse } from "next/server"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js"
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js"
import { auth } from "@/lib/auth"

// 存储所有活跃的MCP会话
interface McpSession {
  server: McpServer
  transport: McpTransport
  lastActivity: Date
}

class McpTransport implements Transport {
  private onclose?: () => void
  private onerror?: (error: Error) => void
  private onmessage?: (message: JSONRPCMessage) => void
  private sessionId: string
  private responseQueue: JSONRPCMessage[] = []
  private sseController?: ReadableStreamDefaultController

  constructor(sessionId: string) {
    this.sessionId = sessionId
  }

  async start(): Promise<void> {
    console.log(`MCP Transport started for session: ${this.sessionId}`)
  }

  async send(message: JSONRPCMessage): Promise<void> {
    console.log(`MCP Transport sending message for session: ${this.sessionId}`, message)
    if (this.sseController) {
      const encoder = new TextEncoder()
      const data = JSON.stringify(message)
      this.sseController.enqueue(encoder.encode(`data: ${data}\n\n`))
    } else {
      this.responseQueue.push(message)
    }
  }

  async close(): Promise<void> {
    console.log(`MCP Transport closed for session: ${this.sessionId}`)
    this.onclose?.()
  }

  setSseController(controller: ReadableStreamDefaultController) {
    this.sseController = controller
    // 发送队列中的消息
    while (this.responseQueue.length > 0) {
      const message = this.responseQueue.shift()!
      const encoder = new TextEncoder()
      const data = JSON.stringify(message)
      this.sseController.enqueue(encoder.encode(`data: ${data}\n\n`))
    }
  }

  setCallbacks(callbacks: {
    onclose?: () => void
    onerror?: (error: Error) => void
    onmessage?: (message: JSONRPCMessage) => void
  }): void {
    this.onclose = callbacks.onclose
    this.onerror = callbacks.onerror
    this.onmessage = callbacks.onmessage
  }

  getSessionId(): string {
    return this.sessionId
  }

  handleMessage(message: JSONRPCMessage): void {
    console.log(`MCP Transport handling message for session: ${this.sessionId}`, message)
    this.onmessage?.(message)
  }
}

const mcpSessions = new Map<string, McpSession>()

// 清理过期会话（30分钟无活动）
function cleanupExpiredSessions() {
  const now = new Date()
  for (const [id, session] of mcpSessions) {
    if (now.getTime() - session.lastActivity.getTime() > 30 * 60 * 1000) {
      session.transport.close()
      mcpSessions.delete(id)
    }
  }
}

async function getOrCreateMcpServer(): Promise<McpSession> {
  const sessionId = crypto.randomUUID()
  
  const { mcpServer } = await import("@/lib/mcp/server")
  const transport = new McpTransport(sessionId)
  
  await mcpServer.connect(transport)
  
  const session: McpSession = {
    server: mcpServer,
    transport,
    lastActivity: new Date()
  }
  
  mcpSessions.set(sessionId, session)
  cleanupExpiredSessions()
  
  return session
}

export async function GET(request: NextRequest) {
  try {
    // 开发环境允许无认证访问
    const session = await auth()
    const isDev = process.env.NODE_ENV === 'development'
    const isLocalhost = request.headers.get("host")?.includes("localhost")
    
    if (!session?.user?.id && !isDev) {
      return NextResponse.json({ error: "未授权，请先登录" }, { status: 401 })
    }

    const mcpSession = await getOrCreateMcpServer()
    const sessionId = mcpSession.transport.getSessionId()

    const stream = new ReadableStream({
      start(controller) {
        mcpSession.transport.setSseController(controller)
        
        // 发送endpoint URL，包含sessionId作为查询参数
        const encoder = new TextEncoder()
        const endpointUrl = `/api/mcp/rpc?sessionId=${sessionId}`
        controller.enqueue(encoder.encode(`event: endpoint\ndata: ${endpointUrl}\n\n`))
      }
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("MCP SSE连接错误:", error)
    return NextResponse.json({ error: "SSE连接失败", details: String(error) }, { status: 500 })
  }
}

export { mcpSessions }
