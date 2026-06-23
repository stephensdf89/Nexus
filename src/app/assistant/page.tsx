"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { useSettingsStore } from "@/lib/settingsStore";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function AssistantPage() {
  const { aiMode } = useSettingsStore();
  const [threadId, setThreadId] = useState<string>("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [model, setModel] = useState<string>("local-fallback");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedThreadId = localStorage.getItem("assistant-thread-id");
    if (!storedThreadId) return;

    setThreadId(storedThreadId);

    const load = async () => {
      const res = await fetch(`/api/assistant?threadId=${encodeURIComponent(storedThreadId)}`);
      if (!res.ok) return;
      const data = await res.json();
      const mapped = (data.messages || [])
        .filter((m: any) => m.role === "user" || m.role === "assistant")
        .map((m: any) => ({ role: m.role, content: m.content }));
      setMessages(mapped);
    };

    load();
  }, []);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setError("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: threadId || undefined,
          message: text,
          mode: aiMode || "standard",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Assistant failed");
      }

      if (data.threadId && !threadId) {
        setThreadId(data.threadId);
        localStorage.setItem("assistant-thread-id", data.threadId);
      }

      setModel(data.model || "local-fallback");

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "No response." }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send message";
      setError(msg);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const clearThread = () => {
    localStorage.removeItem("assistant-thread-id");
    setThreadId("");
    setMessages([]);
    setError("");
  };

  return (
    <AuthGuard>
      <AppShell>
        <section className="mx-auto max-w-4xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-100">AI Assistant</h1>
              <p className="text-sm text-cyan-100/70 mt-1">
                Mode: <span className="font-semibold text-cyan-300">{aiMode || "standard"}</span>
              </p>
              <p className="text-xs text-cyan-100/60 mt-1">
                Provider: <span className="font-semibold text-cyan-200">{model === "local-fallback" ? "Free local test mode" : model}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={clearThread}
              className="rounded-lg border border-violet-400/40 bg-violet-500/10 px-4 py-2 text-sm text-violet-200 hover:bg-violet-500/20"
            >
              New Chat
            </button>
          </div>

          <div className="h-[58vh] overflow-y-auto rounded-xl border border-cyan-400/30 bg-slate-900/60 p-4">
            {messages.length === 0 ? (
              <p className="text-cyan-100/70">Ask about content strategy, scheduling, growth ideas, or pipeline automations.</p>
            ) : (
              <div className="space-y-3">
                {messages.map((m, idx) => (
                  <div
                    key={`${m.role}-${idx}`}
                    className={`rounded-lg p-3 text-sm ${
                      m.role === "user"
                        ? "ml-auto max-w-[80%] border border-cyan-400/40 bg-cyan-500/10 text-cyan-100"
                        : "mr-auto max-w-[85%] border border-violet-400/35 bg-violet-500/10 text-violet-100"
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-violet-300">{error}</p>}

          <form onSubmit={send} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the assistant..."
              className="flex-1 rounded-lg border border-cyan-400/40 bg-slate-950/80 px-4 py-3 text-cyan-100 placeholder-cyan-300/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 font-semibold text-slate-950 disabled:opacity-60"
            >
              {loading ? "Thinking..." : "Send"}
            </button>
          </form>
        </section>
      </AppShell>
    </AuthGuard>
  );
}
