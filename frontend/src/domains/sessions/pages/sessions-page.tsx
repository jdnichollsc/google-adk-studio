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
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Sessions</h2>
      {isLoading && <p className="text-muted-foreground p-4">Loading sessions...</p>}
      {error && <p className="text-red-500 p-4">Failed to load sessions.</p>}
      {!isLoading && !error && !sessions?.length && (
        <p className="text-muted-foreground p-4">No sessions yet.</p>
      )}
      {sessions && sessions.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
            >
              <h3 className="font-medium text-[hsl(var(--card-foreground))]">{session.agent_name}</h3>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                {new Date(session.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
