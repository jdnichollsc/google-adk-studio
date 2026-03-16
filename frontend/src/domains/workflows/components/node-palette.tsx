import type { Node } from "@xyflow/react";
import { useGraphStore } from "../hooks/use-graph-store";

const paletteItems = [
  { type: "input", label: "Input" },
  { type: "agent", label: "Agent" },
  { type: "tool", label: "Tool" },
  { type: "condition", label: "Condition" },
  { type: "output", label: "Output" },
] as const;

export function NodePalette() {
  const addNode = useGraphStore((s) => s.addNode);

  const handleAdd = (type: string, label: string) => {
    const node: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label },
    };
    addNode(node);
  };

  return (
    <div className="flex w-48 flex-col gap-2 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Nodes</h3>
      {paletteItems.map(({ type, label }) => (
        <button
          key={type}
          onClick={() => handleAdd(type, label)}
          className="rounded-md border border-[hsl(var(--border))] px-3 py-2 text-left text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
