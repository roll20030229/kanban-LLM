import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getOrCreateMcpServer } from "@/lib/mcp/sessions"

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const isDev = process.env.NODE_ENV === 'development'
    const isLocalhost = request.headers.get("host")?.includes("localhost")

    if (!session?.user?.id && !isDev) {
      return NextResponse.json({ error: "未授权，请先登录" }, { status: 401 })
    }

    const mcpSession = await getOrCreateMcpServer()
    const sessionId = mcpSession.transport.sessionId

    const stream = new ReadableStream({
      start(controller) {
        mcpSession.transport.setSseController(controller)

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
