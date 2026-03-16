import { useQuery } from "@tanstack/react-query";

interface SessionResponse {
  id: string;
  agent_name: string;
  created_at: string;
}

function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await fetch("/api/sessions", {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res.json() as Promise<{ sessions: SessionResponse[] }>;
    },
    select: (data) => data.sessions,
  });
}

export function SessionsPage() {
  const { data: sessions, isLoading, error } = useSessions();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[hsl(var(--neutral-6))]">Sessions</h2>
        <p className="text-sm text-[hsl(var(--neutral-3))] mt-1">Agent conversation sessions</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-sm text-[hsl(var(--neutral-3))]">Loading sessions...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center p-8 rounded-lg border border-dashed border-[hsl(var(--accent-red)/0.3)] bg-[hsl(var(--accent-red-dark))] max-w-sm">
            <div className="text-3xl mb-3 opacity-40">!</div>
            <p className="text-[hsl(var(--neutral-5))] font-medium">Failed to load sessions</p>
            <p className="text-sm text-[hsl(var(--neutral-3))] mt-1">Check your connection and try again</p>
          </div>
        </div>
      )}

      {!isLoading && !error && !sessions?.length && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center p-8 rounded-lg border border-dashed border-[hsl(var(--border-2))] bg-[hsl(var(--surface-2))] max-w-sm">
            <div className="text-3xl mb-3 opacity-40">{"\u{1F4AC}"}</div>
            <p className="text-[hsl(var(--neutral-5))] font-medium">No sessions yet</p>
            <p className="text-sm text-[hsl(var(--neutral-3))] mt-1">Sessions will appear when you chat with agents</p>
          </div>
        </div>
      )}

      {sessions && sessions.length > 0 && (
        <div className="rounded-lg border border-[hsl(var(--border-1))] bg-[hsl(var(--surface-2))] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border-1))]">
                <th className="text-left text-xs font-medium text-[hsl(var(--neutral-3))] uppercase tracking-wider px-4 py-3">Agent</th>
                <th className="text-left text-xs font-medium text-[hsl(var(--neutral-3))] uppercase tracking-wider px-4 py-3">Session ID</th>
                <th className="text-left text-xs font-medium text-[hsl(var(--neutral-3))] uppercase tracking-wider px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border-1))]">
              {sessions.map((session) => (
                <tr
                  key={session.id}
                  className="transition-colors duration-[var(--duration-fast)] hover:bg-[hsl(var(--surface-4))]"
                >
                  <td className="px-4 py-3 text-sm text-[hsl(var(--neutral-6))] font-medium">{session.agent_name}</td>
                  <td className="px-4 py-3 text-sm text-[hsl(var(--neutral-4))] font-mono">{session.id}</td>
                  <td className="px-4 py-3 text-sm text-[hsl(var(--neutral-4))]">{new Date(session.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
