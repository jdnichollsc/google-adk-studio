export function RunsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[hsl(var(--neutral-6))]">Runs</h2>
        <p className="text-sm text-[hsl(var(--neutral-3))] mt-1">Workflow execution history</p>
      </div>

      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 rounded-lg border border-dashed border-[hsl(var(--border-2))] bg-[hsl(var(--surface-2))] max-w-sm">
          <div className="text-3xl mb-3 opacity-40">{"\u{25B6}"}</div>
          <p className="text-[hsl(var(--neutral-5))] font-medium">No runs yet</p>
          <p className="text-sm text-[hsl(var(--neutral-3))] mt-1">Run a workflow from the editor to see execution history</p>
        </div>
      </div>
    </div>
  );
}
