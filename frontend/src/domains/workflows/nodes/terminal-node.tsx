import { Handle, Position, type NodeProps } from "@xyflow/react";

export function InputNode({ data }: NodeProps) {
  return (
    <div
      className="min-w-[120px] rounded-lg border border-[hsl(var(--accent-green)/0.5)] bg-[hsl(var(--surface-2))] px-5 py-3 text-center shadow-[var(--shadow-card)]"
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--accent-green))]">
        Input
      </div>
      <div className="mt-0.5 text-sm font-medium text-[hsl(var(--neutral-6))]">
        {(data as { label?: string }).label ?? "Start"}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 8,
          height: 8,
          background: "hsl(142, 71%, 45%)",
          border: "2px solid hsl(240, 5%, 7%)",
        }}
      />
    </div>
  );
}

export function OutputNode({ data }: NodeProps) {
  return (
    <div
      className="min-w-[120px] rounded-lg border border-[hsl(var(--accent-red)/0.5)] bg-[hsl(var(--surface-2))] px-5 py-3 text-center shadow-[var(--shadow-card)]"
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--accent-red))]">
        Output
      </div>
      <div className="mt-0.5 text-sm font-medium text-[hsl(var(--neutral-6))]">
        {(data as { label?: string }).label ?? "End"}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 8,
          height: 8,
          background: "hsl(0, 84%, 60%)",
          border: "2px solid hsl(240, 5%, 7%)",
        }}
      />
    </div>
  );
}
