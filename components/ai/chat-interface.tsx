"use client";

import { useState } from "react";
import { Sparkles, Send, Bot, User, ArrowRight, Activity, Flame, Target } from "lucide-react";
import { askAICoach, type AICoachResponse } from "@/lib/actions/ai-coach";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  actionables?: string[];
  contextData?: AICoachResponse["contextData"];
}

const PRESET_PROMPTS = [
  "How can I boost my daily score?",
  "Analyze my habit streak momentum",
  "Help me break down my primary goal",
  "Analyze my reflection sentiment",
];

export function AIChatInterface({ initialResponse }: { initialResponse: AICoachResponse }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "ai",
      text: initialResponse.reply,
      actionables: initialResponse.actionables,
      contextData: initialResponse.contextData,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      text: prompt,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await askAICoach(prompt);
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        sender: "ai",
        text: res.reply,
        actionables: res.actionables,
        contextData: res.contextData,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-zinc-900/60 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-start gap-3 max-w-3xl",
              msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl shrink-0 shadow-md",
                msg.sender === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
              )}
            >
              {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Message Bubble */}
            <div className="space-y-3">
              <div
                className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-zinc-950/80 border border-zinc-800/80 text-zinc-200 rounded-tl-none"
                )}
              >
                {msg.text}
              </div>

              {/* Context telemetry pill if present */}
              {msg.contextData && (
                <div className="flex flex-wrap gap-2 pt-1 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                    <Activity className="h-3 w-3 text-indigo-400" />
                    Score: {msg.contextData.dailyScore}/100
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                    <Flame className="h-3 w-3 text-amber-400" />
                    Streak: {msg.contextData.activeStreak}d
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                    <Target className="h-3 w-3 text-emerald-400" />
                    Goal: {msg.contextData.topGoal}
                  </span>
                </div>
              )}

              {/* Actionables */}
              {msg.actionables && msg.actionables.length > 0 && (
                <div className="bg-indigo-500/5 border border-indigo-500/15 p-3 rounded-xl space-y-1.5">
                  <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Recommended Actions
                  </div>
                  <div className="space-y-1">
                    {msg.actionables.map((act, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                        <ArrowRight className="h-3 w-3 text-indigo-400 shrink-0" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-400">
              <Bot className="h-4 w-4 animate-pulse" />
            </div>
            <div className="text-xs text-zinc-400 italic">LifeOS AI Companion is thinking...</div>
          </div>
        )}
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-zinc-950/60 border-t border-zinc-800/60 flex items-center gap-2 overflow-x-auto">
        {PRESET_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-indigo-600/20 hover:border-indigo-500/40 border border-zinc-800 text-zinc-300 text-xs whitespace-nowrap transition-all"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 md:p-4 bg-zinc-950 border-t border-zinc-800/80 flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI Companion about score, habits, goals, or reflections..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors shadow-lg shadow-indigo-600/25 shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
