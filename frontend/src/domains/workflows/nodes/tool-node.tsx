import { Handle, Position, type NodeProps } from "@xyflow/react";

export function ToolNode({ data }: NodeProps) {
  return (
    <div
      className="min-w-[140px] rounded-lg border-l-[3px] border-l-[hsl(var(--accent-amber))] border-t border-r border-b border-t-[hsl(var(--border-1))] border-r-[hsl(var(--border-1))] border-b-[hsl(var(--border-1))] bg-[hsl(var(--surface-2))] px-4 py-3 shadow-[var(--shadow-card)]"
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 8,
          height: 8,
          background: "hsl(240, 2%, 52%)",
          border: "2px solid hsl(240, 5%, 7%)",
        }}
      />
      <div className="flex items-center gap-2">
        <span className="text-sm">{"\uD83D\uDD27"}</span>
        <div>
          <div className="text-sm font-medium text-[hsl(var(--neutral-6))]">
            {(data as { label?: string }).label}
          </div>
          <div className="text-[11px] text-[hsl(var(--neutral-3))]">Tool</div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 8,
          height: 8,
          background: "hsl(240, 2%, 52%)",
          border: "2px solid hsl(240, 5%, 7%)",
        }}
      />
    </div>
  );
}
