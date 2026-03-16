import { useState } from "react";
import { AgentList } from "../components/agent-list";
import { AgentChat } from "../components/agent-chat";

export function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Agents</h2>
      <AgentList onSelect={(agent) => setSelectedAgent(agent.name)} />
      {selectedAgent && <AgentChat agentName={selectedAgent} />}
    </div>
  );
}
