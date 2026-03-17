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

/* Map node types to minimap accent colors */
const nodeColor = (node: { type?: string }) => {
  switch (node.type) {
    case "input":     return "hsl(142, 71%, 45%)";   /* accent-green */
    case "output":    return "hsl(0, 84%, 60%)";      /* accent-red */
    case "agent":     return "hsl(217, 91%, 60%)";    /* accent-blue */
    case "tool":      return "hsl(38, 92%, 50%)";     /* accent-amber */
    case "condition": return "hsl(262, 83%, 58%)";    /* accent-purple */
    default:          return "hsl(240, 4%, 14%)";     /* surface-4 */
  }
};

export function WorkflowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useGraphStore();
  const setSelectedNodeId = useGraphStore((s) => s.setSelectedNodeId);

  return (
    <div className="h-full w-full bg-[hsl(var(--surface-1))]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        nodeTypes={nodeTypes}
        fitView
        className="[&_.react-flow__controls]:overflow-hidden [&_.react-flow__controls]:rounded-lg [&_.react-flow__controls]:border-[hsl(var(--border-2))] [&_.react-flow__controls]:bg-[hsl(var(--surface-3))] [&_.react-flow__controls]:shadow-[var(--shadow-card)] [&_.react-flow__controls_button]:border-b-[hsl(var(--border-1))] [&_.react-flow__controls_button]:bg-transparent [&_.react-flow__controls_button]:fill-[hsl(var(--neutral-4))] [&_.react-flow__controls_button:hover]:bg-[hsl(var(--surface-4))]"
      >
        <Background
          gap={20}
          size={1}
          color="hsl(240, 4%, 30%)"
          style={{ opacity: 0.4 }}
        />
        <Controls />
        <MiniMap
          nodeColor={nodeColor}
          maskColor="hsla(240, 6%, 4%, 0.85)"
          style={{
            backgroundColor: "hsl(240, 5%, 7%)",
            borderRadius: 8,
            border: "1px solid hsla(0, 0%, 100%, 0.08)",
          }}
        />
      </ReactFlow>
    </div>
  );
}
