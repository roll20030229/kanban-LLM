import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js"
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js"

interface McpSession {
  server: McpServer
  transport: McpTransport
  lastActivity: Date
}

class McpTransport implements Transport {
  onclose?: () => void
  onerror?: (error: Error) => void
  onmessage?: <T extends JSONRPCMessage>(message: T) => void
  sessionId?: string
  private responseQueue: JSONRPCMessage[] = []
  private sseController?: ReadableStreamDefaultController

  constructor(sessionId: string) {
    this.sessionId = sessionId
  }

  async start(): Promise<void> {
  }

  async send(message: JSONRPCMessage): Promise<void> {
    if (this.sseController) {
      const encoder = new TextEncoder()
      const data = JSON.stringify(message)
      this.sseController.enqueue(encoder.encode(`data: ${data}\n\n`))
    } else {
      this.responseQueue.push(message)
    }
  }

  async close(): Promise<void> {
    this.onclose?.()
  }

  setSseController(controller: ReadableStreamDefaultController) {
    this.sseController = controller
    while (this.responseQueue.length > 0) {
      const message = this.responseQueue.shift()!
      const encoder = new TextEncoder()
      const data = JSON.stringify(message)
      this.sseController.enqueue(encoder.encode(`data: ${data}\n\n`))
    }
  }

  handleMessage(message: JSONRPCMessage): void {
    this.onmessage?.(message)
  }
}

const mcpSessions = new Map<string, McpSession>()

function cleanupExpiredSessions() {
  const now = new Date()
  const expiredIds: string[] = []
  mcpSessions.forEach((session, id) => {
    if (now.getTime() - session.lastActivity.getTime() > 30 * 60 * 1000) {
      session.transport.close()
      expiredIds.push(id)
    }
  })
  expiredIds.forEach(id => mcpSessions.delete(id))
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

export { mcpSessions, McpTransport, cleanupExpiredSessions, getOrCreateMcpServer }
export type { McpSession }
