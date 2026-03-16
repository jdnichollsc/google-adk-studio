import { useState } from "react";
import { WorkflowCanvas } from "../components/workflow-canvas";
import { NodePalette } from "../components/node-palette";
import { useGraphStore } from "../hooks/use-graph-store";
import { useCreateWorkflow } from "../hooks/use-workflows";
import { useStartWorkflowRun, useWorkflowRunStatus } from "../hooks/use-workflow-run";
import { serializeGraph } from "../utils/graph-serializer";

export function WorkflowEditorPage() {
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const { nodes, edges } = useGraphStore();
  const createWorkflow = useCreateWorkflow();
  const startRun = useStartWorkflowRun();
  const { data: runStatus } = useWorkflowRunStatus(runId);

  const handleSave = () => {
    const graph = serializeGraph(nodes, edges);
    createWorkflow.mutate(
      { name: `workflow-${Date.now()}`, graph },
      { onSuccess: (res) => setWorkflowId(res.id) },
    );
  };

  const handleRun = () => {
    if (!workflowId) return;
    startRun.mutate(workflowId, {
      onSuccess: (res) => setRunId(res.run_id),
    });
  };

  const statusLabel = runStatus?.status ?? (runId ? "starting" : null);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] px-4 py-2">
        <h2 className="text-lg font-semibold">Workflow Editor</h2>
        <div className="flex-1" />
        {statusLabel && (
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            statusLabel === "running"
              ? "bg-blue-100 text-blue-700"
              : statusLabel === "completed"
                ? "bg-green-100 text-green-700"
                : statusLabel === "failed"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
          }`}>
            {statusLabel}
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={createWorkflow.isPending}
          className="rounded-md bg-[hsl(var(--primary))] px-4 py-1.5 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50"
        >
          {createWorkflow.isPending ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleRun}
          disabled={!workflowId || startRun.isPending}
          className="rounded-md border border-[hsl(var(--border))] px-4 py-1.5 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] disabled:opacity-50"
        >
          {startRun.isPending ? "Starting..." : "Run"}
        </button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <NodePalette />
        <div className="flex-1">
          <WorkflowCanvas />
        </div>
      </div>
    </div>
  );
}
