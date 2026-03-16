import { useEffect, useRef, useState } from "react";
import { useSSE } from "@/lib/use-sse";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AgentChat({ agentName }: { agentName: string }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const { messages: sseMessages, isStreaming, startStream, stopStream } = useSSE();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef("session-" + Date.now());

  useEffect(() => {
    if (sseMessages.length > 0) {
      const text = sseMessages
        .map((m) => {
          try {
            const parsed = JSON.parse(m.data);
            const parts = parsed?.content?.parts;
            if (Array.isArray(parts)) return parts.map((p: { text?: string }) => p.text ?? "").join("");
          } catch { /* raw text fallback */ }
          return m.data;
        })
        .join("");
      if (text) {
        setHistory((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return [...prev.slice(0, -1), { role: "assistant", content: text }];
          }
          return [...prev, { role: "assistant", content: text }];
        });
      }
    }
  }, [sseMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [history]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setHistory((prev) => [...prev, { role: "user", content: text }]);
    startStream("/run_sse", {
      app_name: agentName,
      user_id: "studio-user",
      session_id: sessionIdRef.current,
      new_message: { role: "user", parts: [{ text }] },
    });
  };

  return (
    <div className="flex h-96 flex-col rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="border-b border-[hsl(var(--border))] px-4 py-2 text-sm font-medium">
        Chat: {agentName}
      </div>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {history.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
            <span
              className={`inline-block max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                  : "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
        {isStreaming && (
          <div className="text-sm text-[hsl(var(--muted-foreground))]">Streaming...</div>
        )}
      </div>
      <div className="flex gap-2 border-t border-[hsl(var(--border))] p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Type a message..."
          className="flex-1 rounded-md border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        />
        {isStreaming ? (
          <button
            onClick={stopStream}
            className="rounded-md border border-[hsl(var(--border))] px-4 py-2 text-sm text-[hsl(var(--foreground))]"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={send}
            className="rounded-md bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
