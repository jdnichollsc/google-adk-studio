import { useState } from "react";
import { useTools } from "../hooks/use-tools";

export function ToolList() {
  const { data: tools, isLoading, error } = useTools();
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-sm text-[hsl(var(--neutral-3))]">Loading tools...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-lg border border-[hsl(var(--accent-red)/0.3)] bg-[hsl(var(--accent-red-dark))] p-6 text-center"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <p className="text-sm text-[hsl(var(--accent-red))]">Failed to load tools.</p>
      </div>
    );
  }

  if (!tools?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-sm text-[hsl(var(--neutral-3))]">No tools discovered</div>
        <p className="mt-1 text-xs text-[hsl(var(--neutral-2))]">
          Tools will appear here once your agents declare them.
        </p>
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="bg-[hsl(var(--surface-3))]">
          <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--neutral-3))]">
            Name
          </th>
          <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--neutral-3))]">
            Description
          </th>
          <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--neutral-3))]">
            Agent
          </th>
        </tr>
      </thead>
      <tbody>
        {tools.map((tool) => {
          const key = `${tool.agent}:${tool.name}`;
          const isExpanded = expandedTool === key;

          return (
            <tr
              key={key}
              onClick={() => setExpandedTool(isExpanded ? null : key)}
              className="cursor-pointer border-b border-[hsl(var(--border-1))] bg-[hsl(var(--surface-2))] transition-colors hover:bg-[hsl(var(--surface-3))]"
              style={{ transitionDuration: "var(--duration-fast)", transitionTimingFunction: "var(--ease-out)" }}
            >
              <td className="px-4 py-3 align-top">
                <div className="text-sm font-medium text-[hsl(var(--neutral-6))]">{tool.name}</div>
                {isExpanded && tool.parameters && (
                  <pre className="mt-2 rounded bg-[hsl(var(--surface-3))] p-3 font-mono text-xs text-[hsl(var(--neutral-4))] overflow-auto max-h-60">
                    {JSON.stringify(tool.parameters, null, 2)}
                  </pre>
                )}
              </td>
              <td className="px-4 py-3 align-top text-sm text-[hsl(var(--neutral-3))]">
                {tool.description || "\u2014"}
              </td>
              <td className="px-4 py-3 align-top">
                <span className="rounded-full bg-[hsl(var(--accent-blue-dark))] px-2 py-0.5 text-[10px] font-medium tracking-wide text-[hsl(var(--accent-blue))]">
                  {tool.agent}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
