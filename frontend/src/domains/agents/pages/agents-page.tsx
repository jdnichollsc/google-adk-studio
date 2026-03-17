import { AgentList } from "../components/agent-list";

export function AgentsPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold text-[hsl(var(--neutral-6))]">
          Agents
        </h2>
        <p className="mt-1 text-sm text-[hsl(var(--neutral-3))]">
          Agents discovered from your code
        </p>
      </div>

      {/* Agent cards */}
      <AgentList />
    </div>
  );
}
