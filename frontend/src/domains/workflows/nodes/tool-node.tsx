import { Handle, Position, type NodeProps } from "@xyflow/react";

export function ToolNode({ data }: NodeProps) {
  return (
    <div className="rounded-lg border border-amber-400 bg-white px-4 py-2 shadow">
      <Handle type="target" position={Position.Top} />
      <div className="text-sm font-medium">{(data as { label?: string }).label}</div>
      <div className="text-xs text-gray-500">Tool</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
