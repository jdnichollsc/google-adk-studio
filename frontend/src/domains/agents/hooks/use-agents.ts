import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type AgentConfig } from "@/lib/api-client";

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () => api.agents.list(),
    select: (data) => data.agents,
  });
}

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AgentConfig) => api.agents.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agents"] }),
  });
}

export function useDeleteAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.agents.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agents"] }),
  });
}
