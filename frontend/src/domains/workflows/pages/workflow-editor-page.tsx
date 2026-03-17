import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WorkflowCanvas } from "../components/workflow-canvas";
import { NodePalette } from "../components/node-palette";
import { StepDetail } from "../components/step-detail";
import { useGraphStore } from "../hooks/use-graph-store";
import { useWorkflow, useCreateWorkflow, useSaveWorkflow } from "../hooks/use-workflows";
import { useStartWorkflowRun, useWorkflowRunStatus } from "../hooks/use-workflow-run";
import { serializeGraph } from "../utils/graph-serializer";
import type { Node, Edge } from "@xyflow/react";

const statusStyles: Record<string, string> = {
  running: "bg-[hsl(var(--accent-blue-dark))] text-[hsl(var(--accent-blue))] ring-1 ring-[hsl(var(--accent-blue)/0.3)]",
  starting: "bg-[hsl(var(--accent-blue-dark))] text-[hsl(var(--accent-blue))] ring-1 ring-[hsl(var(--accent-blue)/0.3)]",
  completed: "bg-[hsl(var(--accent-green-dark))] text-[hsl(var(--accent-green))] ring-1 ring-[hsl(var(--accent-green)/0.3)]",
  failed: "bg-[hsl(var(--accent-red-dark))] text-[hsl(var(--accent-red))] ring-1 ring-[hsl(var(--accent-red)/0.3)]",
};

export function WorkflowEditorPage() {
  const { id: urlId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [workflowId, setWorkflowId] = useState<string | null>(urlId ?? null);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [runId, setRunId] = useState<string | null>(null);

  const { nodes, edges, selectedNodeId, setGraph, updateNodeData } = useGraphStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  const { data: existingWorkflow } = useWorkflow(urlId);
  const createWorkflow = useCreateWorkflow();
  const saveWorkflow = useSaveWorkflow();
  const startRun = useStartWorkflowRun();
  const { data: runStatus } = useWorkflowRunStatus(workflowId, runId);

  // Load existing workflow when fetched
  useEffect(() => {
    if (existingWorkflow) {
      setWorkflowName(existingWorkflow.name);
      setWorkflowId(existingWorkflow.id);
      const graph = existingWorkflow.graph as { nodes?: Node[]; edges?: Edge[] } | undefined;
      if (graph?.nodes) {
        setGraph(graph.nodes, graph.edges ?? []);
      }
    }
  }, [existingWorkflow, setGraph]);

  const isSaving = createWorkflow.isPending || saveWorkflow.isPending;

  const handleSave = () => {
    const graph = serializeGraph(nodes, edges);
    if (workflowId) {
      saveWorkflow.mutate({ id: workflowId, data: { name: workflowName, graph } });
    } else {
      createWorkflow.mutate(
        { name: workflowName, graph },
        {
          onSuccess: (res) => {
            setWorkflowId(res.id);
            navigate(`/workflows/${res.id}`, { replace: true });
          },
        },
      );
    }
  };

  const handleRun = () => {
    if (!workflowId) return;
    startRun.mutate(workflowId, {
      onSuccess: (res) => setRunId(res.run_id),
    });
  };

  const handleUpdateNodeData = (data: Record<string, unknown>) => {
    if (selectedNodeId) {
      updateNodeData(selectedNodeId, data);
    }
  };

  const statusLabel = runStatus?.status ?? (runId ? "starting" : null);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-[hsl(var(--border-2))] bg-[hsl(var(--surface-2))] px-5 py-2.5">
        <button
          onClick={() => navigate("/workflows")}
          className="rounded p-1 text-[hsl(var(--neutral-3))] transition-colors hover:bg-[hsl(var(--surface-4))] hover:text-[hsl(var(--neutral-5))]"
          style={{ transitionDuration: "var(--duration-fast)", transitionTimingFunction: "var(--ease-out)" }}
          title="Back to Workflows"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8l4-4" />
          </svg>
        </button>

        <input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="rounded border border-transparent bg-transparent px-2 py-1 text-sm font-semibold tracking-tight text-[hsl(var(--neutral-6))] hover:border-[hsl(var(--border-2))] focus:border-[hsl(var(--border-2))] focus:bg-[hsl(var(--surface-3))] focus:outline-none"
          placeholder="Workflow name"
        />

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

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-[hsl(var(--accent-green))] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ transitionDuration: "var(--duration-fast)", transitionTimingFunction: "var(--ease-out)" }}
        >
          {isSaving ? "Saving\u2026" : "Save"}
        </button>

        {/* Run */}
        <button
          onClick={handleRun}
          disabled={!workflowId || startRun.isPending}
          className="rounded-md bg-[hsl(var(--surface-4))] px-4 py-1.5 text-xs font-semibold text-[hsl(var(--accent-green))] transition-all hover:bg-[hsl(var(--surface-5))] disabled:cursor-not-allowed disabled:opacity-40"
          style={{ transitionDuration: "var(--duration-fast)", transitionTimingFunction: "var(--ease-out)" }}
        >
          {startRun.isPending ? "Starting\u2026" : "Run"}
        </button>
      </div>

      {/* Body: palette | canvas | properties */}
      <div className="flex flex-1 overflow-hidden">
        <NodePalette />
        <div className="flex-1">
          <WorkflowCanvas />
        </div>
        {selectedNode && (
          <div className="w-80 border-l border-[hsl(var(--border-1))] bg-[hsl(var(--surface-1))] p-4 overflow-y-auto">
            <StepDetail node={selectedNode} onUpdate={handleUpdateNodeData} />
          </div>
        )}
      </div>
    </div>
  );
}
