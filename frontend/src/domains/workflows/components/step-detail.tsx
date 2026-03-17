import { useEffect, useState } from "react";
import type { Node } from "@xyflow/react";
import { api } from "@/lib/api-client";

interface StepDetailProps {
  node: Node;
  onUpdate: (data: Record<string, unknown>) => void;
}

const inputClass =
  "w-full rounded border border-[hsl(var(--border-2))] bg-[hsl(var(--surface-3))] px-3 py-2 text-sm text-[hsl(var(--neutral-5))] placeholder:text-[hsl(var(--neutral-2))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent-green)/0.5)]";

const labelClass = "text-xs text-[hsl(var(--neutral-3))] mb-1 block";

export function StepDetail({ node, onUpdate }: StepDetailProps) {
  const data = node.data as Record<string, unknown>;
  const nodeType = node.type ?? "unknown";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold capitalize text-[hsl(var(--neutral-6))]">
          {nodeType} Properties
        </h3>
        <span className="rounded bg-[hsl(var(--surface-4))] px-2 py-0.5 font-mono text-[10px] text-[hsl(var(--neutral-3))]">
          {node.id}
        </span>
      </div>

      {/* Common: Label */}
      <Field label="Label">
        <input
          className={inputClass}
          value={(data.label as string) ?? ""}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Node label"
        />
      </Field>

      {/* Type-specific fields */}
      {nodeType === "agent" && <AgentFields data={data} onUpdate={onUpdate} />}
      {nodeType === "tool" && <ToolFields data={data} onUpdate={onUpdate} />}
      {nodeType === "condition" && <ConditionFields data={data} onUpdate={onUpdate} />}
      {nodeType === "delay" && <DelayFields data={data} onUpdate={onUpdate} />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function AgentFields({
  data,
  onUpdate,
}: {
  data: Record<string, unknown>;
  onUpdate: (d: Record<string, unknown>) => void;
}) {
  const [agents, setAgents] = useState<string[]>([]);

  useEffect(() => {
    api.agents.list().then((list) => setAgents(list.map((a) => a.name)));
  }, []);

  return (
    <>
      <Field label="Agent">
        <select
          className={inputClass}
          value={(data.agentName as string) ?? ""}
          onChange={(e) => onUpdate({ agentName: e.target.value })}
        >
          <option value="">Select agent...</option>
          {agents.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Timeout (seconds)">
        <input
          className={inputClass}
          type="number"
          min={0}
          value={(data.timeout as number) ?? ""}
          onChange={(e) => onUpdate({ timeout: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="30"
        />
      </Field>
    </>
  );
}

function ToolFields({
  data,
  onUpdate,
}: {
  data: Record<string, unknown>;
  onUpdate: (d: Record<string, unknown>) => void;
}) {
  return (
    <>
      <Field label="Tool ID">
        <input
          className={inputClass}
          value={(data.toolId as string) ?? ""}
          onChange={(e) => onUpdate({ toolId: e.target.value })}
          placeholder="e.g. google_search"
        />
      </Field>
      <Field label="Timeout (seconds)">
        <input
          className={inputClass}
          type="number"
          min={0}
          value={(data.timeout as number) ?? ""}
          onChange={(e) => onUpdate({ timeout: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="30"
        />
      </Field>
    </>
  );
}

function ConditionFields({
  data,
  onUpdate,
}: {
  data: Record<string, unknown>;
  onUpdate: (d: Record<string, unknown>) => void;
}) {
  return (
    <>
      <Field label="Expression">
        <input
          className={inputClass}
          value={(data.expression as string) ?? ""}
          onChange={(e) => onUpdate({ expression: e.target.value })}
          placeholder='e.g. result.status == "ok"'
        />
      </Field>
      <div className="flex gap-3 text-xs">
        <span className="rounded bg-[hsl(var(--accent-green-dark))] px-2 py-1 text-[hsl(var(--accent-green))]">
          True
        </span>
        <span className="rounded bg-[hsl(var(--accent-red-dark))] px-2 py-1 text-[hsl(var(--accent-red))]">
          False
        </span>
      </div>
    </>
  );
}

function DelayFields({
  data,
  onUpdate,
}: {
  data: Record<string, unknown>;
  onUpdate: (d: Record<string, unknown>) => void;
}) {
  return (
    <Field label="Duration (seconds)">
      <input
        className={inputClass}
        type="number"
        min={0}
        value={(data.duration as number) ?? ""}
        onChange={(e) => onUpdate({ duration: e.target.value ? Number(e.target.value) : undefined })}
        placeholder="60"
      />
    </Field>
  );
}
