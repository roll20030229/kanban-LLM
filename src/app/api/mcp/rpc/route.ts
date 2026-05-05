import { NextRequest, NextResponse } from "next/server"
import { mcpSessions } from "@/app/api/mcp/sse/route"

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const sessionId = url.searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "缺少sessionId参数" }, { status: 400 })
    }

    const mcpSession = mcpSessions.get(sessionId)
    if (!mcpSession) {
      return NextResponse.json({ error: "无效的sessionId" }, { status: 400 })
    }

    mcpSession.lastActivity = new Date()

    const body = await request.json()
    console.log("MCP POST received:", body)
    
    mcpSession.transport.handleMessage(body as any)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("MCP RPC错误:", error)
    return NextResponse.json({ error: "MCP RPC处理失败", details: String(error) }, { status: 500 })
  }
}
