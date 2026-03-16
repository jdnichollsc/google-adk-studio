import type { AgentResponse } from "@/lib/api-client";
import { useAgents, useDeleteAgent } from "../hooks/use-agents";

interface AgentListProps {
  onSelect: (agent: AgentResponse) => void;
}

export function AgentList({ onSelect }: AgentListProps) {
  const { data: agents, isLoading, error } = useAgents();
  const deleteAgent = useDeleteAgent();

  if (isLoading) return <p className="text-muted-foreground p-4">Loading agents...</p>;
  if (error) return <p className="text-red-500 p-4">Failed to load agents.</p>;
  if (!agents?.length) return <p className="text-muted-foreground p-4">No agents yet. Create one to get started.</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <div
          key={agent.id}
          onClick={() => onSelect(agent)}
          className="cursor-pointer rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-colors hover:bg-[hsl(var(--accent))]"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-[hsl(var(--card-foreground))]">{agent.name}</h3>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                {agent.agent_type} {agent.config.model ? `\u00B7 ${agent.config.model}` : ""}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteAgent.mutate(agent.id);
              }}
              className="rounded px-2 py-1 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive-foreground))]"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
