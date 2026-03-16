import { useState } from "react";
import { ToolList } from "../components/tool-list";
import { ToolForm } from "../components/tool-form";

export function ToolsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Tools</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90"
        >
          {showForm ? "Cancel" : "New Tool"}
        </button>
      </div>
      {showForm && <ToolForm onClose={() => setShowForm(false)} />}
      <ToolList />
    </div>
  );
}
