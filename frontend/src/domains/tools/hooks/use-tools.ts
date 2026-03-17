import { useQuery } from "@tanstack/react-query";
import type { AgentResponse } from "@/lib/api-client";

export interface Tool {
  name: string;
  description?: string;
  agent: string;
  parameters?: Record<string, unknown>;
}

async function fetchTools(): Promise<Tool[]> {
  const res = await fetch("/list-apps?detailed=true", {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const agents: AgentResponse[] = await res.json();

  const seen = new Set<string>();
  const tools: Tool[] = [];

  for (const agent of agents) {
    if (!agent.tools) continue;
    for (const toolName of agent.tools) {
      const key = `${agent.name}:${toolName}`;
      if (seen.has(key)) continue;
      seen.add(key);
      tools.push({ name: toolName, agent: agent.name });
    }
  }

  return tools;
}

export function useTools() {
  return useQuery({
    queryKey: ["tools"],
    queryFn: fetchTools,
  });
}
