import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { QueryProvider } from "@/lib/query-provider";
import { AgentsPage } from "@/domains/agents/pages/agents-page";
import { ToolsPage } from "@/domains/tools/pages/tools-page";
import { WorkflowEditorPage } from "@/domains/workflows/pages/workflow-editor-page";
import { SessionsPage } from "@/domains/sessions/pages/sessions-page";
import { RunsPage } from "@/domains/runs/pages/runs-page";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/agents", label: "Agents" },
  { to: "/tools", label: "Tools" },
  { to: "/workflows", label: "Workflows" },
  { to: "/sessions", label: "Sessions" },
  { to: "/runs", label: "Runs" },
];

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
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/workflows" element={<WorkflowEditorPage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/runs" element={<RunsPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryProvider>
  );
}
