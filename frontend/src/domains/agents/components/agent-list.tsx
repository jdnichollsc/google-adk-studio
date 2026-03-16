import type { AgentResponse } from "@/lib/api-client";
import { useAgents } from "../hooks/use-agents";

interface AgentListProps {
  onSelect: (agent: AgentResponse) => void;
}

export function AgentList({ onSelect }: AgentListProps) {
  const { data: agents, isLoading, error } = useAgents();

  if (isLoading) return <p className="text-muted-foreground p-4">Loading agents...</p>;
  if (error) return <p className="text-red-500 p-4">Failed to load agents.</p>;
  if (!agents?.length) return <p className="text-muted-foreground p-4">No agents found. Add agent directories to your backend.</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <div
          key={agent.name}
          onClick={() => onSelect(agent)}
          className="cursor-pointer rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-colors hover:bg-[hsl(var(--accent))]"
        >
          <h3 className="font-medium text-[hsl(var(--card-foreground))]">{agent.name}</h3>
          {agent.description && (
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{agent.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
