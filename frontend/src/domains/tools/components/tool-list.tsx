import { useTools, useDeleteTool } from "../hooks/use-tools";

export function ToolList() {
  const { data: tools, isLoading, error } = useTools();
  const deleteTool = useDeleteTool();

  if (isLoading) return <p className="text-muted-foreground p-4">Loading tools...</p>;
  if (error) return <p className="text-red-500 p-4">Failed to load tools.</p>;
  if (!tools?.length) return <p className="text-muted-foreground p-4">No tools yet. Create one to get started.</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <div
          key={tool.id}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-[hsl(var(--card-foreground))]">{tool.name}</h3>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                {tool.tool_type}
                {tool.config.description ? ` \u00B7 ${tool.config.description}` : ""}
              </p>
            </div>
            <button
              onClick={() => deleteTool.mutate(tool.id)}
              className="rounded px-2 py-1 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive-foreground))]"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
