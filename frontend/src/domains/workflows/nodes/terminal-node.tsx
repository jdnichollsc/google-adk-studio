import { Handle, Position, type NodeProps } from "@xyflow/react";

export function InputNode({ data }: NodeProps) {
  return (
    <div className="rounded-lg border-2 border-green-500 bg-[hsl(var(--card))] px-4 py-2 text-center text-sm text-[hsl(var(--card-foreground))] shadow">
      {(data as { label?: string }).label ?? "Start"}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function OutputNode({ data }: NodeProps) {
  return (
    <div className="rounded-lg border-2 border-red-500 bg-[hsl(var(--card))] px-4 py-2 text-center text-sm text-[hsl(var(--card-foreground))] shadow">
      {(data as { label?: string }).label ?? "End"}
      <Handle type="target" position={Position.Top} />
    </div>
  );
}
