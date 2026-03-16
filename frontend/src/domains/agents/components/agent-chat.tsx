import { useEffect, useRef, useState } from "react";
import { useSSE } from "@/lib/use-sse";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AgentChatProps {
  agentName: string;
  onClose: () => void;
}

export function AgentChat({ agentName, onClose }: AgentChatProps) {
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
            if (Array.isArray(parts))
              return parts.map((p: { text?: string }) => p.text ?? "").join("");
          } catch {
            /* raw text fallback */
          }
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
    <div
      className="flex h-[28rem] flex-col rounded-lg border border-[hsl(var(--border-1))] bg-[hsl(var(--surface-2))]"
      style={{ boxShadow: "var(--shadow-elevated)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border-1))] px-4 py-2.5">
        <span className="text-sm font-medium text-[hsl(var(--neutral-5))]">
          Chat:{" "}
          <span className="text-[hsl(var(--neutral-6))]">{agentName}</span>
        </span>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded text-[hsl(var(--neutral-3))] transition-colors duration-150 hover:bg-[hsl(var(--surface-4))] hover:text-[hsl(var(--neutral-5))]"
          aria-label="Close chat"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto p-4"
      >
        {history.length === 0 && !isStreaming && (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-[hsl(var(--neutral-2))]">
              Send a message to start chatting with{" "}
              <span className="font-medium text-[hsl(var(--neutral-4))]">
                {agentName}
              </span>
            </p>
          </div>
        )}
        {history.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`inline-block max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[hsl(var(--accent-blue-dark))] text-[hsl(var(--neutral-6))]"
                  : "bg-[hsl(var(--surface-3))] text-[hsl(var(--neutral-5))]"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
        {isStreaming && (
          <div className="flex items-center gap-1.5 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(var(--accent-green))]" />
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(var(--accent-green))]"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(var(--accent-green))]"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t border-[hsl(var(--border-1))] p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Type a message..."
          className="flex-1 rounded-md border border-[hsl(var(--border-2))] bg-[hsl(var(--surface-3))] px-3 py-2 text-sm text-[hsl(var(--neutral-6))] placeholder:text-[hsl(var(--neutral-2))] transition-colors duration-150 focus:border-[hsl(var(--accent-blue)/0.5)] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent-blue)/0.3)]"
        />
        {isStreaming ? (
          <button
            onClick={stopStream}
            className="rounded-md border border-[hsl(var(--border-2))] bg-[hsl(var(--surface-3))] px-4 py-2 text-sm font-medium text-[hsl(var(--neutral-4))] transition-colors duration-150 hover:bg-[hsl(var(--surface-4))] hover:text-[hsl(var(--neutral-5))]"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={send}
            className="rounded-md bg-[hsl(var(--accent-green))] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:opacity-90"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
