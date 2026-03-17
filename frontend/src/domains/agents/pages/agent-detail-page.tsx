import { useParams, Link } from "react-router-dom";
import { AgentChat } from "../components/agent-chat";
import { AgentInfoPanel } from "../components/agent-info-panel";

export function AgentDetailPage() {
  const { agentName } = useParams<{ agentName: string }>();

  if (!agentName) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-[hsl(var(--neutral-3))]">Agent not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left panel - thread list */}
      <div className="w-64 border-r border-[hsl(var(--border-1))] bg-[hsl(var(--surface-1))] p-3 flex flex-col">
        <button className="w-full rounded-md bg-[hsl(var(--accent-green))] px-3 py-2 text-sm font-medium text-black mb-3 transition-opacity duration-150 hover:opacity-90">
          + New Chat
        </button>
        <div className="flex-1 flex items-start">
          <p className="text-xs text-[hsl(var(--neutral-3))]">
            Your conversations will appear here
          </p>
        </div>
      </div>

      {/* Center - Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Breadcrumb header */}
        <div className="border-b border-[hsl(var(--border-1))] px-4 py-3 flex items-center gap-2">
          <Link
            to="/agents"
            className="text-sm text-[hsl(var(--neutral-3))] hover:text-[hsl(var(--neutral-5))] transition-colors duration-150"
          >
            Agents
          </Link>
          <span className="text-[hsl(var(--neutral-2))]">/</span>
          <span className="text-sm font-medium text-[hsl(var(--neutral-6))]">
            {agentName}
          </span>
        </div>
        {/* Chat area */}
        <AgentChat agentName={agentName} />
      </div>

      {/* Right panel - Agent info */}
      <div className="w-80 border-l border-[hsl(var(--border-1))] bg-[hsl(var(--surface-1))] overflow-y-auto">
        <AgentInfoPanel agentName={agentName} />
      </div>
    </div>
  );
}
