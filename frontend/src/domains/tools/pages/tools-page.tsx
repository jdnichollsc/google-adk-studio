import { ToolList } from "../components/tool-list";

export function ToolsPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="border-b border-[hsl(var(--border-2))] px-6 py-5">
        <h2 className="text-2xl font-semibold text-[hsl(var(--neutral-6))]">
          Tools
        </h2>
        <p className="mt-1 text-sm text-[hsl(var(--neutral-3))]">
          Tools discovered from your agents
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <ToolList />
      </div>
    </div>
  );
}
