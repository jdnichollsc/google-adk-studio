import { Handle, Position, type NodeProps } from "@xyflow/react";

export function AgentNode({ data }: NodeProps) {
  return (
    <div className="rounded-lg border border-blue-400 bg-[hsl(var(--card))] px-4 py-2 shadow">
      <Handle type="target" position={Position.Top} />
      <div className="text-sm font-medium text-[hsl(var(--card-foreground))]">{(data as { label?: string }).label}</div>
      <div className="text-xs text-[hsl(var(--muted-foreground))]">Agent</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
