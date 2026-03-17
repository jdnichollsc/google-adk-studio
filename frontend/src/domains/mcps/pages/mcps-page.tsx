export function McpsPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="border-b border-[hsl(var(--border-2))] px-6 py-5">
        <h2 className="text-2xl font-semibold text-[hsl(var(--neutral-6))]">
          MCP Servers
        </h2>
        <p className="mt-1 text-sm text-[hsl(var(--neutral-3))]">
          Model Context Protocol server connections
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div
          className="rounded-lg border border-[hsl(var(--border-1))] bg-[hsl(var(--surface-2))] p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h3 className="text-sm font-medium text-[hsl(var(--neutral-5))]">
            Configuring MCP Servers
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-[hsl(var(--neutral-3))]">
            Configure MCP servers in your agent files to connect external tool providers.
            MCP tools detected from your agents will appear here automatically.
          </p>
          <pre className="mt-4 rounded bg-[hsl(var(--surface-3))] p-4 font-mono text-xs leading-relaxed text-[hsl(var(--neutral-4))] overflow-auto">
{`from google.adk.tools.mcp import MCPTool

agent = Agent(
    tools=[MCPTool(server_url="http://...")],
)`}
          </pre>
        </div>
      </div>
    </div>
  );
}
