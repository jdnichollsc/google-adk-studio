import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type WorkflowConfig } from "@/lib/api-client";

export function useWorkflows() {
  return useQuery({
    queryKey: ["workflows"],
    queryFn: () => api.workflows.list(),
    select: (data) => data.workflows,
  });
}

export function useCreateWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: WorkflowConfig) => api.workflows.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workflows"] }),
  });
}

export function useSaveWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WorkflowConfig }) => api.workflows.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workflows"] }),
  });
}
