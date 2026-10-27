import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// MCP Server catalog — connection state stored in memory (would be DB in production)
const mcpServers = [
  { id: "github", name: "GitHub", icon: "Github", color: "emerald", desc: "访问仓库、Issue、PR、代码分析", tools: ["search_repos", "get_issue", "create_pr", "analyze_code"], connected: true, category: "开发" },
  { id: "notion", name: "Notion", icon: "BookOpen", color: "violet", desc: "读写 Notion 页面、数据库", tools: ["search_pages", "create_page", "query_db"], connected: true, category: "生产力" },
  { id: "gdrive", name: "Google Drive", icon: "FileText", color: "amber", desc: "访问文档、表格、演示文稿", tools: ["list_files", "read_doc", "upload"], connected: false, category: "生产力" },
  { id: "slack", name: "Slack", icon: "MessageSquare", color: "rose", desc: "发送消息、搜索频道", tools: ["send_message", "search", "list_channels"], connected: false, category: "沟通" },
  { id: "jira", name: "Jira", icon: "Calendar", color: "blue", desc: "管理任务、Sprint、Bug", tools: ["create_issue", "get_sprint", "update_status"], connected: true, category: "项目管理" },
  { id: "figma", name: "Figma", icon: "Figma", color: "cyan", desc: "读取设计文件、组件库", tools: ["get_file", "export_asset"], connected: false, category: "设计" },
  { id: "linear", name: "Linear", icon: "Layers", color: "violet", desc: "项目管理、Issue 追踪", tools: ["create_issue", "list_projects"], connected: false, category: "项目管理" },
  { id: "gmail", name: "Gmail", icon: "Mail", color: "rose", desc: "读取邮件、发送求职信", tools: ["send_email", "search_mail", "read_thread"], connected: false, category: "沟通" },
];

// In-memory state for connections (would be DB in production)
const connectionState = new Map<string, boolean>(
  mcpServers.map((s) => [s.id, s.connected])
);

// GET /api/mcp-servers — list all MCP servers
export async function GET() {
  const servers = mcpServers.map((s) => ({
    ...s,
    connected: connectionState.get(s.id) || false,
  }));
  return NextResponse.json({ servers });
}

// POST /api/mcp-servers — toggle connection
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action } = body;

    if (!id) {
      return NextResponse.json({ error: "Server ID is required" }, { status: 400 });
    }

    const current = connectionState.get(id) || false;
    const newState = action === "toggle" ? !current : action === "connect";
    connectionState.set(id, newState);

    const server = mcpServers.find((s) => s.id === id);
    return NextResponse.json({
      success: true,
      id,
      connected: newState,
      message: newState ? `已连接 ${server?.name}` : `已断开 ${server?.name}`,
    });
  } catch (error) {
    console.error("POST /api/mcp-servers error:", error);
    return NextResponse.json({ error: "Failed to toggle MCP server" }, { status: 500 });
  }
}
