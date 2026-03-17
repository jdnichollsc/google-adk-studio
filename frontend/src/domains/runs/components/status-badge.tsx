import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "running" | "completed" | "failed" | "unknown";
}

const statusStyles: Record<StatusBadgeProps["status"], string> = {
  running:
    "bg-[hsl(var(--accent-blue-dark))] text-[hsl(var(--accent-blue))] border-[hsl(var(--accent-blue)/0.3)]",
  completed:
    "bg-[hsl(var(--accent-green-dark))] text-[hsl(var(--accent-green))] border-[hsl(var(--accent-green)/0.3)]",
  failed:
    "bg-[hsl(var(--accent-red-dark))] text-[hsl(var(--accent-red))] border-[hsl(var(--accent-red)/0.3)]",
  unknown:
    "bg-[hsl(var(--surface-3))] text-[hsl(var(--neutral-3))] border-[hsl(var(--border-2))]",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
        statusStyles[status]
      )}
    >
      {status === "running" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--accent-blue))] opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent-blue))]" />
        </span>
      )}
      {status}
    </span>
  );
}
