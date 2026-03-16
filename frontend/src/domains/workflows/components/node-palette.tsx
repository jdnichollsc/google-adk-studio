import type { Node } from "@xyflow/react";
import { useGraphStore } from "../hooks/use-graph-store";

const nodeAccent: Record<string, { dot: string; border: string }> = {
  input:     { dot: "bg-[hsl(var(--accent-green))]",  border: "border-l-[hsl(var(--accent-green))]" },
  agent:     { dot: "bg-[hsl(var(--accent-blue))]",   border: "border-l-[hsl(var(--accent-blue))]" },
  tool:      { dot: "bg-[hsl(var(--accent-amber))]",  border: "border-l-[hsl(var(--accent-amber))]" },
  condition: { dot: "bg-[hsl(var(--accent-purple))]",  border: "border-l-[hsl(var(--accent-purple))]" },
  output:    { dot: "bg-[hsl(var(--accent-red))]",    border: "border-l-[hsl(var(--accent-red))]" },
};

const nodeIcon: Record<string, string> = {
  input: "\u25B6",
  agent: "\u26A1",
  tool: "\uD83D\uDD27",
  condition: "\u2747",
  output: "\u23F9",
};

const flowNodes = [
  { type: "input", label: "Input" },
  { type: "output", label: "Output" },
] as const;

const logicNodes = [
  { type: "agent", label: "Agent" },
  { type: "tool", label: "Tool" },
  { type: "condition", label: "Condition" },
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

  const renderButton = ({ type, label }: { type: string; label: string }) => {
    const accent = nodeAccent[type];
    return (
      <button
        key={type}
        onClick={() => handleAdd(type, label)}
        className={`flex items-center gap-2.5 rounded-md border-l-[3px] bg-[hsl(var(--surface-3))] px-3 py-2 text-left text-sm text-[hsl(var(--neutral-5))] transition-colors hover:bg-[hsl(var(--surface-4))] ${accent?.border ?? ""}`}
        style={{ transitionDuration: "var(--duration-fast)", transitionTimingFunction: "var(--ease-out)" }}
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${accent?.dot ?? ""}`} />
        <span className="mr-0.5 text-xs">{nodeIcon[type]}</span>
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex w-52 flex-col gap-1 border-r border-[hsl(var(--border-2))] bg-[hsl(var(--surface-2))] px-3 py-4">
      {/* Section: Flow */}
      <h3 className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--neutral-3))]">
        Flow
      </h3>
      <div className="flex flex-col gap-1.5">
        {flowNodes.map(renderButton)}
      </div>

      {/* Divider */}
      <div className="my-3 h-px bg-[hsl(var(--border-1))]" />

      {/* Section: Logic */}
      <h3 className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--neutral-3))]">
        Logic
      </h3>
      <div className="flex flex-col gap-1.5">
        {logicNodes.map(renderButton)}
      </div>
    </div>
  );
}
