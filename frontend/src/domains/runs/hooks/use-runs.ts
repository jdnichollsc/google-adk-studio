import { useQuery } from "@tanstack/react-query";
import { api, type WorkflowResponse } from "@/lib/api-client";

export interface WorkflowRun {
  workflow_id: string;
  workflow_name: string;
  run_id: string;
  status: "running" | "completed" | "failed" | "unknown";
  started_at: string;
  duration_ms: number | null;
  current_step: string | null;
  results: Record<string, unknown> | null;
}

async function fetchRunsForWorkflow(workflow: WorkflowResponse): Promise<WorkflowRun[]> {
  try {
    const res = await fetch(`/api/workflows/${workflow.id}/runs`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const runs: unknown[] = Array.isArray(data) ? data : data.runs ?? [];
    return runs.map((r: any) => ({
      workflow_id: workflow.id,
      workflow_name: workflow.name,
      run_id: r.run_id ?? r.id ?? "unknown",
      status: normalizeStatus(r.status),
      started_at: r.started_at ?? r.created_at ?? new Date().toISOString(),
      duration_ms: r.duration_ms ?? r.duration ?? null,
      current_step: r.current_step ?? r.step ?? null,
      results: r.results ?? r.result ?? null,
    }));
  } catch {
    return [];
  }
}

function normalizeStatus(status: string | undefined): WorkflowRun["status"] {
  if (!status) return "unknown";
  const s = status.toLowerCase();
  if (s === "running" || s === "in_progress" || s === "started") return "running";
  if (s === "completed" || s === "success" || s === "succeeded") return "completed";
  if (s === "failed" || s === "error" || s === "errored") return "failed";
  return "unknown";
}

export function useRuns() {
  return useQuery({
    queryKey: ["runs"],
    queryFn: async (): Promise<WorkflowRun[]> => {
      const { workflows } = await api.workflows.list();
      if (!workflows.length) return [];
      const allRuns = await Promise.all(workflows.map(fetchRunsForWorkflow));
      return allRuns
        .flat()
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    },
    refetchInterval: (query) => {
      const runs = query.state.data;
      const hasRunning = runs?.some((r) => r.status === "running");
      return hasRunning ? 3000 : false;
    },
  });
}
