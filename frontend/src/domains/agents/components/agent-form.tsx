import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateAgent } from "../hooks/use-agents";

const agentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  agent_type: z.enum(["llm", "sequential", "parallel", "loop"]),
  model: z.string().optional(),
  description: z.string().optional(),
  instruction: z.string().optional(),
});

type AgentFormData = z.infer<typeof agentSchema>;

interface AgentFormProps {
  onClose: () => void;
}

export function AgentForm({ onClose }: AgentFormProps) {
  const createAgent = useCreateAgent();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: { agent_type: "llm", model: "gemini-2.0-flash" },
  });

  const agentType = watch("agent_type");

  const onSubmit = (data: AgentFormData) => {
    createAgent.mutate(data, { onSuccess: onClose });
  };

  const inputClass =
    "w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]";
  const labelClass = "block text-sm font-medium text-[hsl(var(--foreground))] mb-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
      <div>
        <label className={labelClass}>Name</label>
        <input {...register("name")} className={inputClass} placeholder="My Agent" />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Type</label>
        <select {...register("agent_type")} className={inputClass}>
          <option value="llm">LLM</option>
          <option value="sequential">Sequential</option>
          <option value="parallel">Parallel</option>
          <option value="loop">Loop</option>
        </select>
      </div>

      {agentType === "llm" && (
        <>
          <div>
            <label className={labelClass}>Model</label>
            <input {...register("model")} className={inputClass} placeholder="gemini-2.0-flash" />
          </div>
          <div>
            <label className={labelClass}>Instruction</label>
            <textarea {...register("instruction")} className={inputClass} rows={3} placeholder="You are a helpful assistant..." />
          </div>
        </>
      )}

      <div>
        <label className={labelClass}>Description</label>
        <input {...register("description")} className={inputClass} placeholder="Optional description" />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={createAgent.isPending}
          className="rounded-md bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50"
        >
          {createAgent.isPending ? "Creating..." : "Create Agent"}
        </button>
        <button type="button" onClick={onClose} className="rounded-md border border-[hsl(var(--border))] px-4 py-2 text-sm text-[hsl(var(--foreground))]">
          Cancel
        </button>
      </div>
    </form>
  );
}
