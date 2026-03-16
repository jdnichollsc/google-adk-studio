import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTool } from "../hooks/use-tools";

const toolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  tool_type: z.enum(["builtin", "custom"]),
  source_code: z.string().optional(),
});

type ToolFormData = z.infer<typeof toolSchema>;

interface ToolFormProps {
  onClose: () => void;
}

export function ToolForm({ onClose }: ToolFormProps) {
  const createTool = useCreateTool();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ToolFormData>({
    resolver: zodResolver(toolSchema),
    defaultValues: { tool_type: "builtin" },
  });

  const toolType = watch("tool_type");

  const onSubmit = (data: ToolFormData) => {
    createTool.mutate(data, { onSuccess: onClose });
  };

  const inputClass =
    "w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]";
  const labelClass = "block text-sm font-medium text-[hsl(var(--foreground))] mb-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
      <div>
        <label className={labelClass}>Name</label>
        <input {...register("name")} className={inputClass} placeholder="My Tool" />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <input {...register("description")} className={inputClass} placeholder="Optional description" />
      </div>

      <div>
        <label className={labelClass}>Type</label>
        <select {...register("tool_type")} className={inputClass}>
          <option value="builtin">Built-in</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {toolType === "custom" && (
        <div>
          <label className={labelClass}>Source Code</label>
          <textarea {...register("source_code")} className={inputClass} rows={6} placeholder="def my_tool(input: str) -> str:&#10;    return input" />
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={createTool.isPending}
          className="rounded-md bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50"
        >
          {createTool.isPending ? "Creating..." : "Create Tool"}
        </button>
        <button type="button" onClick={onClose} className="rounded-md border border-[hsl(var(--border))] px-4 py-2 text-sm text-[hsl(var(--foreground))]">
          Cancel
        </button>
      </div>
    </form>
  );
}
