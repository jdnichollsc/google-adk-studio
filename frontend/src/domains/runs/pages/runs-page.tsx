import { useState } from "react";
import { useRuns, type WorkflowRun } from "../hooks/use-runs";
import { RunDetail } from "../components/run-detail";
import { StatusBadge } from "../components/status-badge";

export function RunsPage() {
  const { data: runs, isLoading, error } = useRuns();
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  function toggleRun(runId: string) {
    setExpandedRunId((prev) => (prev === runId ? null : runId));
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[hsl(var(--neutral-6))]">Runs</h2>
        <p className="text-sm text-[hsl(var(--neutral-3))] mt-1">Workflow execution history</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-sm text-[hsl(var(--neutral-3))]">Loading runs...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center p-8 rounded-lg border border-dashed border-[hsl(var(--accent-red)/0.3)] bg-[hsl(var(--accent-red-dark))] max-w-sm">
            <div className="text-3xl mb-3 opacity-40">!</div>
            <p className="text-[hsl(var(--neutral-5))] font-medium">Failed to load runs</p>
            <p className="text-sm text-[hsl(var(--neutral-3))] mt-1">Check your connection and try again</p>
          </div>
        </div>
      )}

      {!isLoading && !error && !runs?.length && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center p-8 rounded-lg border border-dashed border-[hsl(var(--border-2))] bg-[hsl(var(--surface-2))] max-w-sm">
            <div className="text-3xl mb-3 opacity-40">{"\u25B6"}</div>
            <p className="text-[hsl(var(--neutral-5))] font-medium">No runs yet</p>
            <p className="text-sm text-[hsl(var(--neutral-3))] mt-1">
              Run a workflow from the editor to see execution history
            </p>
          </div>
        </div>
      )}

      {runs && runs.length > 0 && (
        <div className="rounded-lg border border-[hsl(var(--border-1))] bg-[hsl(var(--surface-2))] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border-1))]">
                <th className="text-left text-xs font-medium text-[hsl(var(--neutral-3))] uppercase tracking-wider px-4 py-3">
                  Workflow
                </th>
                <th className="text-left text-xs font-medium text-[hsl(var(--neutral-3))] uppercase tracking-wider px-4 py-3">
                  Run ID
                </th>
                <th className="text-left text-xs font-medium text-[hsl(var(--neutral-3))] uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-[hsl(var(--neutral-3))] uppercase tracking-wider px-4 py-3">
                  Started
                </th>
                <th className="text-left text-xs font-medium text-[hsl(var(--neutral-3))] uppercase tracking-wider px-4 py-3">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border-1))]">
              {runs.map((run) => (
                <RunRow
                  key={run.run_id}
                  run={run}
                  isExpanded={expandedRunId === run.run_id}
                  onToggle={() => toggleRun(run.run_id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RunRow({
  run,
  isExpanded,
  onToggle,
}: {
  run: WorkflowRun;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="cursor-pointer transition-colors duration-[var(--duration-fast)] hover:bg-[hsl(var(--surface-4))]"
        onClick={onToggle}
      >
        <td className="px-4 py-3 text-sm text-[hsl(var(--neutral-6))] font-medium">
          {run.workflow_name}
        </td>
        <td className="px-4 py-3 text-sm text-[hsl(var(--neutral-4))] font-mono">
          {run.run_id.length > 12 ? `${run.run_id.slice(0, 12)}...` : run.run_id}
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={run.status} />
        </td>
        <td className="px-4 py-3 text-sm text-[hsl(var(--neutral-4))]">
          {new Date(run.started_at).toLocaleString()}
        </td>
        <td className="px-4 py-3 text-sm text-[hsl(var(--neutral-4))]">
          {run.duration_ms != null ? formatDuration(run.duration_ms) : "--"}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="px-4 py-3 bg-[hsl(var(--surface-3)/0.3)]">
            <RunDetail run={run} />
          </td>
        </tr>
      )}
    </>
  );
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
