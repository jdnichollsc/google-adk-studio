import { useState } from "react";
import { AgentList } from "../components/agent-list";
import { AgentForm } from "../components/agent-form";

export function AgentsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Agents</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90"
        >
          {showForm ? "Cancel" : "New Agent"}
        </button>
      </div>
      {showForm && <AgentForm onClose={() => setShowForm(false)} />}
      <AgentList onSelect={() => {}} />
    </div>
  );
}
