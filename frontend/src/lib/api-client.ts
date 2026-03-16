const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface AgentConfig {
  name: string;
  agent_type: "llm" | "sequential" | "parallel" | "loop";
  model?: string;
  description?: string;
  instruction?: string;
  tools?: string[];
  sub_agents?: string[];
}

export interface AgentResponse {
  id: string;
  name: string;
  agent_type: string;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ToolConfig {
  name: string;
  description?: string;
  tool_type: "builtin" | "custom";
  parameters?: Record<string, unknown>;
  source_code?: string;
}

export interface ToolResponse {
  id: string;
  name: string;
  tool_type: string;
  config: Record<string, unknown>;
  source_code?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowNode {
  id: string;
  type: "input" | "output" | "agent" | "tool" | "condition" | "parallel" | "loop" | "human_approval" | "delay";
  data: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface WorkflowConfig {
  name: string;
  graph: { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
}

export interface WorkflowResponse {
  id: string;
  name: string;
  graph: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const api = {
  agents: {
    list: () => request<{ agents: AgentResponse[] }>("/agents"),
    get: (id: string) => request<AgentResponse>(`/agents/${id}`),
    create: (data: AgentConfig) =>
      request<AgentResponse>("/agents", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: AgentConfig) =>
      request<AgentResponse>(`/agents/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/agents/${id}`, { method: "DELETE" }),
  },
  tools: {
    list: () => request<{ tools: ToolResponse[] }>("/tools"),
    get: (id: string) => request<ToolResponse>(`/tools/${id}`),
    create: (data: ToolConfig) =>
      request<ToolResponse>("/tools", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/tools/${id}`, { method: "DELETE" }),
  },
  workflows: {
    list: () => request<{ workflows: WorkflowResponse[] }>("/workflows"),
    get: (id: string) => request<WorkflowResponse>(`/workflows/${id}`),
    create: (data: WorkflowConfig) =>
      request<WorkflowResponse>("/workflows", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: WorkflowConfig) =>
      request<WorkflowResponse>(`/workflows/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/workflows/${id}`, { method: "DELETE" }),
  },
};
