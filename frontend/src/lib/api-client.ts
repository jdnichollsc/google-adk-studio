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

async function requestRaw<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json();
}

export interface AgentResponse {
  name: string;
  description?: string;
  tools?: string[];
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
    list: async (): Promise<AgentResponse[]> => {
      const names = await requestRaw<string[]>("/list-apps");
      return names.map((name) => ({ name }));
    },
    get: async (name: string): Promise<AgentResponse | undefined> => {
      const agents = await requestRaw<AgentResponse[]>("/list-apps?detailed=true");
      return agents.find((a) => a.name === name);
    },
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
