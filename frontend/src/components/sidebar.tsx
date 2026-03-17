import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function NavItem({ to, icon, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-all",
          "duration-[var(--duration-normal)]",
          isActive
            ? "bg-[hsl(var(--surface-3))] text-[hsl(var(--neutral-6))] border-l-2 border-[hsl(var(--accent-green))]"
            : "text-[hsl(var(--neutral-3))] hover:bg-[hsl(var(--surface-3)/0.5)] hover:text-[hsl(var(--neutral-5))] border-l-2 border-transparent"
        )
      }
    >
      <span className="w-4 text-center text-xs leading-none">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

interface NavSectionProps {
  label: string;
  children: React.ReactNode;
}

function NavSection({ label, children }: NavSectionProps) {
  return (
    <div>
      <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--neutral-1))]">
        {label}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

export function Sidebar() {
  return (
    <nav className="flex h-screen w-56 flex-col bg-[hsl(var(--surface-1))] border-r border-[hsl(var(--border))]">
      <div className="p-4 border-b border-[hsl(var(--border))]">
        <h1 className="text-sm font-semibold tracking-wide text-[hsl(var(--neutral-6))]">
          ADK Studio
        </h1>
        <p className="text-xs text-[hsl(var(--neutral-2))] mt-0.5">
          Agent Development Kit
        </p>
      </div>
      <div className="flex-1 py-3 px-2 space-y-4">
        <NavSection label="Build">
          <NavItem to="/agents" icon={<AgentsIcon />} label="Agents" />
          <NavItem to="/workflows" icon={<WorkflowsIcon />} label="Workflows" />
          <NavItem to="/tools" icon={<ToolsIcon />} label="Tools" />
          <NavItem to="/mcps" icon={<McpIcon />} label="MCP Servers" />
        </NavSection>
        <NavSection label="Inspect">
          <NavItem to="/sessions" icon={<SessionsIcon />} label="Sessions" />
          <NavItem to="/runs" icon={<RunsIcon />} label="Runs" />
        </NavSection>
      </div>
      <div className="border-t border-[hsl(var(--border))] px-4 py-3">
        <p className="text-[10px] text-[hsl(var(--neutral-1))] font-mono">
          v0.1.0
        </p>
      </div>
    </nav>
  );
}

/* Inline SVG icons — small, sharp, 16x16 */

function AgentsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 8a5 5 0 0 1-5 5m5-5a5 5 0 0 0-5-5m5 5h-2M8 13a5 5 0 0 1-5-5m5 5v-2M3 8a5 5 0 0 1 5-5M3 8h2M8 3v2" />
      <circle cx="8" cy="8" r="1.5" />
    </svg>
  );
}

function WorkflowsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="4" height="4" rx="0.5" />
      <rect x="11" y="1" width="4" height="4" rx="0.5" />
      <rect x="6" y="11" width="4" height="4" rx="0.5" />
      <path d="M5 3h6M3 5v4l5 2M13 5v4l-5 2" />
    </svg>
  );
}

function SessionsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.5" />
      <circle cx="8" cy="8" r="2.5" />
      <circle cx="8" cy="8" r="0.75" fill="currentColor" />
    </svg>
  );
}

function RunsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2.5v11l9-5.5z" />
    </svg>
  );
}

function ToolsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 2.5l3 3-7 7-4 1 1-4z" />
      <path d="M9 4l3 3" />
    </svg>
  );
}

function McpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="4" cy="8" r="2" />
      <circle cx="12" cy="4" r="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 7.5l4-2.5M6 8.5l4 2.5" />
    </svg>
  );
}
