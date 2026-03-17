import { useNavigate } from "react-router-dom";
import { useAgents } from "../hooks/use-agents";

export function AgentList() {
  const { data: agents, isLoading, error } = useAgents();
  const navigate = useNavigate();

  /* Loading skeleton */
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-[hsl(var(--border-1))] bg-[hsl(var(--surface-2))] p-4"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="mb-3 h-4 w-24 rounded bg-[hsl(var(--surface-4))]" />
            <div className="h-3 w-full rounded bg-[hsl(var(--surface-3))]" />
            <div className="mt-1.5 h-3 w-2/3 rounded bg-[hsl(var(--surface-3))]" />
          </div>
        ))}
      </div>
    );
  }

  /* Error state */
  if (error) {
    return (
      <div
        className="rounded-lg border border-[hsl(var(--accent-red)/0.3)] bg-[hsl(var(--accent-red-dark))] p-6 text-center"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <svg
          className="mx-auto mb-2 h-8 w-8 text-[hsl(var(--accent-red))]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        <p className="text-sm text-[hsl(var(--accent-red))]">
          Failed to load agents.
        </p>
      </div>
    );
  }

  /* Empty state */
  if (!agents?.length) {
    return (
      <div
        className="rounded-lg border border-[hsl(var(--border-1))] bg-[hsl(var(--surface-2))] p-10 text-center"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <svg
          className="mx-auto mb-3 h-10 w-10 text-[hsl(var(--neutral-2))]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
        <p className="text-sm font-medium text-[hsl(var(--neutral-4))]">
          No agents found
        </p>
        <p className="mt-1 text-xs text-[hsl(var(--neutral-2))]">
          Add agent directories to your backend to get started.
        </p>
      </div>
    );
  }

  /* Agent cards */
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <div
          key={agent.name}
          onClick={() => navigate(`/agents/${agent.name}`)}
          className="cursor-pointer rounded-lg border border-[hsl(var(--border-1))] bg-[hsl(var(--surface-2))] p-4 transition-all duration-200 hover:border-[hsl(var(--border-2))] hover:bg-[hsl(var(--surface-3)/0.5)]"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[hsl(var(--neutral-6))]">
              {agent.name}
            </h3>
            <span className="rounded-full bg-[hsl(var(--accent-blue-dark))] px-2 py-0.5 text-[10px] font-medium tracking-wide text-[hsl(var(--accent-blue))]">
              LLM
            </span>
          </div>
          {agent.description && (
            <p className="mt-2 text-xs leading-relaxed text-[hsl(var(--neutral-3))]">
              {agent.description}
            </p>
          )}
          {agent.tools && agent.tools.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {agent.tools.map((tool) => (
                <span
                  key={tool}
                  className="rounded bg-[hsl(var(--surface-4))] px-1.5 py-0.5 font-mono text-[10px] text-[hsl(var(--neutral-3))]"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
