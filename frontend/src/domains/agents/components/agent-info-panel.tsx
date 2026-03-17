import { useState } from "react";
import { useAgent } from "../hooks/use-agents";
import { cn } from "@/lib/utils";

interface AgentInfoPanelProps {
  agentName: string;
}

type Tab = "overview" | "settings";

export function AgentInfoPanel({ agentName }: AgentInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { data: agent, isLoading, error } = useAgent(agentName);

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border-1))] px-4 py-3">
        <h3 className="text-sm font-medium text-[hsl(var(--neutral-6))]">
          {agentName}
        </h3>
        <span className="mt-1 inline-block font-mono text-[10px] text-[hsl(var(--neutral-2))] select-all">
          {agentName}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[hsl(var(--border-1))]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 px-4 py-2 text-xs font-medium transition-colors duration-150",
              activeTab === tab.key
                ? "border-b-2 border-[hsl(var(--accent-green))] text-[hsl(var(--neutral-6))]"
                : "text-[hsl(var(--neutral-3))] hover:text-[hsl(var(--neutral-5))]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="space-y-3">
            <div className="h-4 w-20 animate-pulse rounded bg-[hsl(var(--surface-4))]" />
            <div className="h-20 animate-pulse rounded bg-[hsl(var(--surface-3))]" />
            <div className="h-4 w-16 animate-pulse rounded bg-[hsl(var(--surface-4))]" />
            <div className="h-8 animate-pulse rounded bg-[hsl(var(--surface-3))]" />
          </div>
        )}

        {error && (
          <p className="text-xs text-[hsl(var(--accent-red))]">
            Failed to load agent details.
          </p>
        )}

        {!isLoading && !error && activeTab === "overview" && (
          <OverviewTab agent={agent} />
        )}

        {!isLoading && !error && activeTab === "settings" && (
          <SettingsTab agent={agent} />
        )}
      </div>
    </div>
  );
}

function OverviewTab({
  agent,
}: {
  agent: ReturnType<typeof useAgent>["data"];
}) {
  return (
    <div className="space-y-5">
      {/* Description */}
      {agent?.description && (
        <Section label="Description">
          <p className="text-xs leading-relaxed text-[hsl(var(--neutral-4))]">
            {agent.description}
          </p>
        </Section>
      )}

      {/* System Prompt */}
      <Section label="System Prompt">
        {agent?.system_prompt ? (
          <div className="max-h-48 overflow-y-auto rounded-md bg-[hsl(var(--surface-3))] p-3">
            <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-[hsl(var(--neutral-4))]">
              {agent.system_prompt}
            </pre>
          </div>
        ) : (
          <p className="text-xs italic text-[hsl(var(--neutral-2))]">
            No system prompt configured
          </p>
        )}
      </Section>

      {/* Tools */}
      <Section label="Tools">
        {agent?.tools && agent.tools.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {agent.tools.map((tool) => (
              <span
                key={tool}
                className="rounded bg-[hsl(var(--surface-4))] px-2 py-0.5 font-mono text-[10px] text-[hsl(var(--neutral-4))]"
              >
                {tool}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-[hsl(var(--neutral-2))]">
            No tools configured
          </p>
        )}
      </Section>

      {/* Sub-agents */}
      {agent?.sub_agents && agent.sub_agents.length > 0 && (
        <Section label="Sub-agents">
          <div className="space-y-1">
            {agent.sub_agents.map((sub) => (
              <div
                key={sub}
                className="flex items-center gap-2 rounded-md bg-[hsl(var(--surface-3))] px-3 py-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent-blue))]" />
                <span className="text-xs text-[hsl(var(--neutral-5))]">
                  {sub}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function SettingsTab({
  agent,
}: {
  agent: ReturnType<typeof useAgent>["data"];
}) {
  return (
    <div className="space-y-5">
      {/* Model */}
      <Section label="Model">
        {agent?.model ? (
          <div className="rounded-md bg-[hsl(var(--surface-3))] px-3 py-2">
            <span className="font-mono text-xs text-[hsl(var(--neutral-5))]">
              {agent.model}
            </span>
          </div>
        ) : (
          <p className="text-xs italic text-[hsl(var(--neutral-2))]">
            Model not specified
          </p>
        )}
      </Section>

      {/* Agent Type */}
      <Section label="Agent Type">
        <span className="inline-block rounded-full bg-[hsl(var(--accent-blue-dark))] px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-[hsl(var(--accent-blue))]">
          {agent?.agent_type ?? "LLM"}
        </span>
      </Section>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--neutral-2))]">
        {label}
      </p>
      {children}
    </div>
  );
}
