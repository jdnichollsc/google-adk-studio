import { Handle, Position, type NodeProps } from "@xyflow/react";

export function ConditionNode({ data }: NodeProps) {
  return (
    <div className="flex h-16 w-32 items-center justify-center" style={{ transform: "rotate(45deg)" }}>
      <div
        className="flex h-full w-full items-center justify-center border border-purple-400 bg-[hsl(var(--card))] shadow"
        style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
      >
        <span className="text-xs font-medium text-[hsl(var(--card-foreground))]" style={{ transform: "rotate(-45deg)" }}>
          {(data as { label?: string }).label}
        </span>
      </div>
      <Handle type="target" position={Position.Top} style={{ transform: "rotate(-45deg)" }} />
      <Handle type="source" id="true" position={Position.Bottom} style={{ left: "30%", transform: "rotate(-45deg)" }} />
      <Handle type="source" id="false" position={Position.Bottom} style={{ left: "70%", transform: "rotate(-45deg)" }} />
    </div>
  );
}
