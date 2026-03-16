import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ToolConfig } from "@/lib/api-client";

export function useTools() {
  return useQuery({
    queryKey: ["tools"],
    queryFn: () => api.tools.list(),
    select: (data) => data.tools,
  });
}

export function useCreateTool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ToolConfig) => api.tools.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tools"] }),
  });
}

export function useDeleteTool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.tools.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tools"] }),
  });
}
