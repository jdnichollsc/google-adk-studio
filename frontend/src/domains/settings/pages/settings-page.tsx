import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await fetch("/health");
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json() as Promise<Record<string, unknown>>;
    },
    retry: 1,
  });
}

function useAgentList() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () => api.agents.list(),
  });
}

export function SettingsPage() {
  const { data: health, isLoading: healthLoading, error: healthError } = useHealth();
  const { data: agents } = useAgentList();

  const isHealthy = !!health && !healthError;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[hsl(var(--neutral-6))]">Settings</h2>
        <p className="text-sm text-[hsl(var(--neutral-3))] mt-1">ADK Studio configuration</p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Connection */}
        <section className="rounded-lg border border-[hsl(var(--border-1))] bg-[hsl(var(--surface-2))] p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--neutral-6))]">Connection</h3>

          <SettingsRow label="Backend URL">
            <code className="font-mono text-xs text-[hsl(var(--neutral-4))]">http://localhost:8000</code>
          </SettingsRow>

          <SettingsRow label="Temporal Address">
            <code className="font-mono text-xs text-[hsl(var(--neutral-4))]">localhost:7233</code>
          </SettingsRow>

          <SettingsRow label="Health Status">
            {healthLoading ? (
              <span className="text-xs text-[hsl(var(--neutral-3))]">Checking...</span>
            ) : isHealthy ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--accent-green))]">
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent-green))]" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--accent-red))]">
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent-red))]" />
                Disconnected
              </span>
            )}
          </SettingsRow>
        </section>

        {/* Agent Directory */}
        <section className="rounded-lg border border-[hsl(var(--border-1))] bg-[hsl(var(--surface-2))] p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--neutral-6))]">Agent Directory</h3>

          <SettingsRow label="Path">
            <code className="font-mono text-xs text-[hsl(var(--neutral-4))]">./agents</code>
          </SettingsRow>

          <div>
            <span className="text-xs text-[hsl(var(--neutral-3))]">Discovered Agents</span>
            {agents && agents.length > 0 ? (
              <div className="mt-2 space-y-1.5">
                {agents.map((agent) => (
                  <div
                    key={agent.name}
                    className="flex items-center justify-between rounded-md bg-[hsl(var(--surface-3))] px-3 py-2"
                  >
                    <span className="text-sm text-[hsl(var(--neutral-5))]">{agent.name}</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-[hsl(var(--accent-green))]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent-green))]" />
                      Active
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-[hsl(var(--neutral-2))]">No agents discovered</p>
            )}
          </div>
        </section>

        {/* About */}
        <section className="rounded-lg border border-[hsl(var(--border-1))] bg-[hsl(var(--surface-2))] p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--neutral-6))]">About</h3>

          <SettingsRow label="Version">
            <span className="font-mono text-xs text-[hsl(var(--neutral-4))]">v0.1.0</span>
          </SettingsRow>

          <div className="flex flex-wrap gap-4 pt-1">
            <a
              href="https://github.com/google/adk-python"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[hsl(var(--accent-blue))] hover:underline"
            >
              ADK Documentation
            </a>
            <a
              href="https://docs.temporal.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[hsl(var(--accent-blue))] hover:underline"
            >
              Temporal Documentation
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[hsl(var(--neutral-3))]">{label}</span>
      {children}
    </div>
  );
}
