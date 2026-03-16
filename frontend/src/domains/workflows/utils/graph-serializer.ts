import type { Node, Edge } from "@xyflow/react";
import type { WorkflowNode, WorkflowEdge } from "@/lib/api-client";

export function serializeGraph(nodes: Node[], edges: Edge[]): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: (n.type ?? "agent") as WorkflowNode["type"],
      data: (n.data ?? {}) as Record<string, unknown>,
      position: n.position,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: typeof e.label === "string" ? e.label : undefined,
    })),
  };
}
