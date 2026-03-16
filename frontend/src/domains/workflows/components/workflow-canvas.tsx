import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useGraphStore } from "../hooks/use-graph-store";
import { InputNode, OutputNode } from "../nodes/terminal-node";
import { AgentNode } from "../nodes/agent-node";
import { ToolNode } from "../nodes/tool-node";
import { ConditionNode } from "../nodes/condition-node";

const nodeTypes = {
  input: InputNode,
  output: OutputNode,
  agent: AgentNode,
  tool: ToolNode,
  condition: ConditionNode,
};

export function WorkflowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useGraphStore();

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
    >
      <Background gap={16} size={1} />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}
