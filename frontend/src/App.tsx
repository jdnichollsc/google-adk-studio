import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { QueryProvider } from "@/lib/query-provider";
import { AgentsPage } from "@/domains/agents/pages/agents-page";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/agents", label: "Agents" },
  { to: "/tools", label: "Tools" },
  { to: "/workflows", label: "Workflows" },
  { to: "/sessions", label: "Sessions" },
  { to: "/runs", label: "Runs" },
];

function Placeholder({ title }: { title: string }) {
  return <h2 className="text-2xl font-semibold">{title}</h2>;
}

export default function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <div className="flex h-screen">
          <aside className="flex w-56 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <div className="p-4">
              <h1 className="text-lg font-bold">ADK Studio</h1>
            </div>
            <nav className="flex flex-col gap-1 px-2">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                        : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <main className="flex-1 overflow-auto p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/agents" replace />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/tools" element={<Placeholder title="Tools" />} />
              <Route path="/workflows" element={<Placeholder title="Workflows" />} />
              <Route path="/sessions" element={<Placeholder title="Sessions" />} />
              <Route path="/runs" element={<Placeholder title="Runs" />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryProvider>
  );
}
