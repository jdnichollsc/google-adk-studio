import { useMutation, useQuery } from "@tanstack/react-query";

interface RunResponse {
  run_id: string;
  status: string;
}

async function startRun(workflowId: string): Promise<RunResponse> {
  const res = await fetch(`/api/workflows/${workflowId}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function getRunStatus(workflowId: string, runId: string): Promise<RunResponse> {
  const res = await fetch(`/api/workflows/${workflowId}/runs/${runId}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export function useStartWorkflowRun() {
  return useMutation({
    mutationFn: (workflowId: string) => startRun(workflowId),
  });
}

export function useWorkflowRunStatus(workflowId: string | null, runId: string | null) {
  return useQuery({
    queryKey: ["run-status", workflowId, runId],
    queryFn: () => getRunStatus(workflowId!, runId!),
    enabled: !!workflowId && !!runId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "running" ? 2000 : false;
    },
  });
}
