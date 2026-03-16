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

async function getRunStatus(runId: string): Promise<RunResponse> {
  const res = await fetch(`/api/runs/${runId}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export function useStartWorkflowRun() {
  return useMutation({
    mutationFn: (workflowId: string) => startRun(workflowId),
  });
}

export function useWorkflowRunStatus(runId: string | null) {
  return useQuery({
    queryKey: ["run-status", runId],
    queryFn: () => getRunStatus(runId!),
    enabled: !!runId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "running" ? 2000 : false;
    },
  });
}
