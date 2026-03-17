import { useEffect, useRef, useState } from "react";
import { useSSE } from "@/lib/use-sse";

interface ChatMessage {
  role: "user" | "assistant" | "tool_call" | "tool_result";
  content: string;
}

interface AgentChatProps {
  agentName: string;
}

export function AgentChat({ agentName }: AgentChatProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const { messages: sseMessages, isStreaming, startStream, stopStream } = useSSE();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef("session-" + Date.now());

  useEffect(() => {
    if (sseMessages.length === 0) return;

    const textParts: string[] = [];
    const toolMessages: ChatMessage[] = [];

    for (const m of sseMessages) {
      try {
        const parsed = JSON.parse(m.data);
        const parts = parsed?.content?.parts;
        if (Array.isArray(parts)) {
          for (const p of parts) {
            // Tool call part
            if (p.function_call) {
              const name = p.function_call.name ?? "unknown";
              const args = p.function_call.args
                ? typeof p.function_call.args === "string"
                  ? p.function_call.args
                  : JSON.stringify(p.function_call.args)
                : "";
              toolMessages.push({
                role: "tool_call",
                content: `${name}(${args})`,
              });
            }
            // Tool response part
            else if (p.function_response) {
              const name = p.function_response.name ?? "tool";
              const result = p.function_response.response
                ? typeof p.function_response.response === "string"
                  ? p.function_response.response
                  : JSON.stringify(p.function_response.response)
                : "";
              const truncated =
                result.length > 200 ? result.slice(0, 200) + "..." : result;
              toolMessages.push({
                role: "tool_result",
                content: `${name}: ${truncated}`,
              });
            }
            // Text part
            else if (p.text) {
              textParts.push(p.text);
            }
          }
        }
      } catch {
        textParts.push(m.data);
      }
    }

    setHistory((prev) => {
      // Keep user messages from history, then append tool messages
      // and text from the current SSE stream
      const userMessages = prev.filter((m) => m.role === "user");
      const result: ChatMessage[] = [...userMessages, ...toolMessages];

      const text = textParts.join("");
      if (text) {
        result.push({ role: "assistant", content: text });
      }

      return result;
    });
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
    <div className="flex flex-1 flex-col min-h-0">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
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
        {history.map((msg, i) => {
          if (msg.role === "tool_call") {
            return (
              <div key={i} className="flex justify-start">
                <div className="max-w-[85%] rounded-md border-l-2 border-[hsl(var(--accent-amber))] bg-[hsl(var(--surface-3))] px-3 py-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--accent-amber))]">
                    Tool Call
                  </span>
                  <p className="mt-0.5 font-mono text-xs text-[hsl(var(--neutral-4))]">
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          }
          if (msg.role === "tool_result") {
            return (
              <div key={i} className="flex justify-start">
                <div className="max-w-[85%] rounded-md border-l-2 border-[hsl(var(--accent-green))] bg-[hsl(var(--surface-3))] px-3 py-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--accent-green))]">
                    Tool Result
                  </span>
                  <p className="mt-0.5 font-mono text-xs text-[hsl(var(--neutral-4))] break-all">
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          }
          return (
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
          );
        })}
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