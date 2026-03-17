import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryProvider } from "@/lib/query-provider";
import { AgentsPage } from "@/domains/agents/pages/agents-page";
import { AgentDetailPage } from "@/domains/agents/pages/agent-detail-page";
import { WorkflowsPage } from "@/domains/workflows/pages/workflows-page";
import { WorkflowEditorPage } from "@/domains/workflows/pages/workflow-editor-page";
import { SessionsPage } from "@/domains/sessions/pages/sessions-page";
import { RunsPage } from "@/domains/runs/pages/runs-page";
import { Sidebar } from "@/components/sidebar";

export default function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 bg-[hsl(var(--surface-2))] m-2 ml-0 rounded-lg border border-[hsl(var(--border))] overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/agents" replace />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/agents/:agentName" element={<AgentDetailPage />} />
              <Route path="/workflows" element={<WorkflowsPage />} />
              <Route path="/workflows/new" element={<WorkflowEditorPage />} />
              <Route path="/workflows/:id" element={<WorkflowEditorPage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/runs" element={<RunsPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryProvider>
  );
}
