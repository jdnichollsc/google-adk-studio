import { useNavigate } from "react-router-dom";
import { useWorkflows } from "../hooks/use-workflows";

export function WorkflowsPage() {
  const navigate = useNavigate();
  const { data: workflows, isLoading } = useWorkflows();

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border-2))] px-6 py-5">
        <div>
          <h2 className="text-2xl font-semibold text-[hsl(var(--neutral-6))]">
            Workflows
          </h2>
          <p className="mt-1 text-sm text-[hsl(var(--neutral-3))]">
            Visual agent orchestration pipelines
          </p>
        </div>
        <button
          onClick={() => navigate("/workflows/new")}
          className="rounded-md bg-[hsl(var(--accent-green))] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110"
          style={{ transitionDuration: "var(--duration-fast)", transitionTimingFunction: "var(--ease-out)" }}
        >
          Create Workflow
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-sm text-[hsl(var(--neutral-3))]">Loading workflows...</span>
          </div>
        ) : !workflows?.length ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-sm text-[hsl(var(--neutral-3))]">No workflows yet</div>
            <p className="mt-1 text-xs text-[hsl(var(--neutral-2))]">
              Create your first workflow to get started.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[hsl(var(--surface-3))]">
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--neutral-3))]">
                  Name
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--neutral-3))]">
                  Nodes
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--neutral-3))]">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((wf) => {
                const graph = wf.graph as { nodes?: unknown[] } | undefined;
                const nodeCount = graph?.nodes?.length ?? 0;

                return (
                  <tr
                    key={wf.id}
                    onClick={() => navigate(`/workflows/${wf.id}`)}
                    className="cursor-pointer border-b border-[hsl(var(--border-1))] bg-[hsl(var(--surface-2))] transition-colors hover:bg-[hsl(var(--surface-3))]"
                    style={{ transitionDuration: "var(--duration-fast)", transitionTimingFunction: "var(--ease-out)" }}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-[hsl(var(--neutral-5))]">
                      {wf.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-[hsl(var(--neutral-4))]">
                      {nodeCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-[hsl(var(--neutral-4))]">
                      {new Date(wf.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
