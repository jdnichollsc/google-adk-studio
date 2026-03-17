import type { WorkflowRun } from "../hooks/use-runs";
import { StatusBadge } from "./status-badge";

interface RunDetailProps {
  run: WorkflowRun;
}

export function RunDetail({ run }: RunDetailProps) {
  const temporalUrl = `http://localhost:8233/namespaces/default/workflows/${run.run_id}`;

  return (
    <div className="rounded-lg border border-[hsl(var(--border-1))] bg-[hsl(var(--surface-2))] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-[hsl(var(--neutral-3))]">{run.run_id}</span>
        <StatusBadge status={run.status} />
      </div>

      {run.current_step && (
        <div>
          <span className="text-xs text-[hsl(var(--neutral-3))]">Current Step</span>
          <p className="text-sm text-[hsl(var(--neutral-5))]">{run.current_step}</p>
        </div>
      )}

      <div className="flex gap-6">
        <div>
          <span className="text-xs text-[hsl(var(--neutral-3))]">Started</span>
          <p className="text-sm text-[hsl(var(--neutral-4))]">
            {new Date(run.started_at).toLocaleString()}
          </p>
        </div>
        {run.duration_ms != null && (
          <div>
            <span className="text-xs text-[hsl(var(--neutral-3))]">Duration</span>
            <p className="text-sm text-[hsl(var(--neutral-4))]">{formatDuration(run.duration_ms)}</p>
          </div>
        )}
      </div>

      {run.results && (
        <div>
          <span className="text-xs text-[hsl(var(--neutral-3))]">Results</span>
          <pre className="mt-1 rounded bg-[hsl(var(--surface-3))] p-3 text-xs font-mono text-[hsl(var(--neutral-4))] overflow-auto max-h-64">
            {JSON.stringify(run.results, null, 2)}
          </pre>
        </div>
      )}

      <a
        href={temporalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-xs text-[hsl(var(--accent-blue))] hover:underline"
      >
        View in Temporal UI &rarr;
      </a>
    </div>
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
