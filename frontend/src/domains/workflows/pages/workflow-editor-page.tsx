import { useState } from "react";
import { WorkflowCanvas } from "../components/workflow-canvas";
import { NodePalette } from "../components/node-palette";
import { useGraphStore } from "../hooks/use-graph-store";
import { useCreateWorkflow, useSaveWorkflow } from "../hooks/use-workflows";
import { useStartWorkflowRun, useWorkflowRunStatus } from "../hooks/use-workflow-run";
import { serializeGraph } from "../utils/graph-serializer";

const statusStyles: Record<string, string> = {
  running: "bg-[hsl(var(--accent-blue-dark))] text-[hsl(var(--accent-blue))] ring-1 ring-[hsl(var(--accent-blue)/0.3)]",
  starting: "bg-[hsl(var(--accent-blue-dark))] text-[hsl(var(--accent-blue))] ring-1 ring-[hsl(var(--accent-blue)/0.3)]",
  completed: "bg-[hsl(var(--accent-green-dark))] text-[hsl(var(--accent-green))] ring-1 ring-[hsl(var(--accent-green)/0.3)]",
  failed: "bg-[hsl(var(--accent-red-dark))] text-[hsl(var(--accent-red))] ring-1 ring-[hsl(var(--accent-red)/0.3)]",
};

export function WorkflowEditorPage() {
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const workflowName = "Untitled Workflow";
  const [runId, setRunId] = useState<string | null>(null);
  const { nodes, edges } = useGraphStore();
  const createWorkflow = useCreateWorkflow();
  const saveWorkflow = useSaveWorkflow();
  const startRun = useStartWorkflowRun();
  const { data: runStatus } = useWorkflowRunStatus(workflowId, runId);

  const isSaving = createWorkflow.isPending || saveWorkflow.isPending;

  const handleSave = () => {
    const graph = serializeGraph(nodes, edges);
    if (workflowId) {
      saveWorkflow.mutate({ id: workflowId, data: { name: workflowName, graph } });
    } else {
      createWorkflow.mutate(
        { name: workflowName, graph },
        { onSuccess: (res) => setWorkflowId(res.id) },
      );
    }
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
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-[hsl(var(--border-2))] bg-[hsl(var(--surface-2))] px-5 py-2.5">
        <h2 className="text-sm font-semibold tracking-tight text-[hsl(var(--neutral-6))]">
          Workflow Editor
        </h2>
        <div className="flex-1" />

        {/* Status badge */}
        {statusLabel && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              statusStyles[statusLabel] ??
              "bg-[hsl(var(--surface-4))] text-[hsl(var(--neutral-3))]"
            }`}
          >
            {statusLabel === "running" && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(var(--accent-blue))]" />
            )}
            {statusLabel}
          </span>
        )}

        {/* Save — primary CTA */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-[hsl(var(--accent-green))] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ transitionDuration: "var(--duration-fast)", transitionTimingFunction: "var(--ease-out)" }}
        >
          {isSaving ? "Saving\u2026" : "Save"}
        </button>

        {/* Run — secondary */}
        <button
          onClick={handleRun}
          disabled={!workflowId || startRun.isPending}
          className="rounded-md bg-[hsl(var(--surface-4))] px-4 py-1.5 text-xs font-semibold text-[hsl(var(--accent-green))] transition-all hover:bg-[hsl(var(--surface-5))] disabled:cursor-not-allowed disabled:opacity-40"
          style={{ transitionDuration: "var(--duration-fast)", transitionTimingFunction: "var(--ease-out)" }}
        >
          {startRun.isPending ? "Starting\u2026" : "Run"}
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <NodePalette />
        <div className="flex-1">
          <WorkflowCanvas />
        </div>
      </div>
    </div>
  );
}
