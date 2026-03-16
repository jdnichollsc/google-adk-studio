import { useState } from "react";
import { AgentList } from "../components/agent-list";
import { AgentChat } from "../components/agent-chat";

export function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <div className="space-y-6">
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
      <AgentList
        selectedAgent={selectedAgent}
        onSelect={(name) =>
          setSelectedAgent((prev) => (prev === name ? null : name))
        }
      />

      {/* Chat panel */}
      {selectedAgent && (
        <AgentChat
          agentName={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
