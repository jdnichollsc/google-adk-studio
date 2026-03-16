import { Handle, Position, type NodeProps } from "@xyflow/react";

export function ConditionNode({ data }: NodeProps) {
  const d = data as { label?: string; expression?: string };

  return (
    <div
      className="min-w-[160px] rounded-lg border border-[hsl(var(--accent-purple)/0.5)] bg-[hsl(var(--surface-2))] px-4 py-3 shadow-[var(--shadow-card)]"
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 8,
          height: 8,
          background: "hsl(262, 83%, 58%)",
          border: "2px solid hsl(240, 5%, 7%)",
        }}
      />

      <div className="flex items-center gap-2">
        <span className="text-sm text-[hsl(var(--accent-purple))]">{"\u2747"}</span>
        <div>
          <div className="text-sm font-medium text-[hsl(var(--neutral-6))]">
            {d.label}
          </div>
          <div className="text-[11px] text-[hsl(var(--neutral-3))]">Condition</div>
        </div>
      </div>

      {d.expression && (
        <div className="mt-2 rounded bg-[hsl(var(--surface-3))] px-2 py-1 font-mono text-[11px] text-[hsl(var(--neutral-3))]">
          {d.expression}
        </div>
      )}

      {/* True / False outputs */}
      <div className="mt-2 flex justify-between text-[10px] font-medium">
        <span className="text-[hsl(var(--accent-green))]">True</span>
        <span className="text-[hsl(var(--accent-red))]">False</span>
      </div>

      <Handle
        type="source"
        id="true"
        position={Position.Bottom}
        style={{
          left: "30%",
          width: 8,
          height: 8,
          background: "hsl(142, 71%, 45%)",
          border: "2px solid hsl(240, 5%, 7%)",
        }}
      />
      <Handle
        type="source"
        id="false"
        position={Position.Bottom}
        style={{
          left: "70%",
          width: 8,
          height: 8,
          background: "hsl(0, 84%, 60%)",
          border: "2px solid hsl(240, 5%, 7%)",
        }}
      />
    </div>
  );
}
