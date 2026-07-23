import { askAICoach } from "@/lib/actions/ai-coach";
import { AIChatInterface } from "@/components/ai/chat-interface";
import { Sparkles } from "lucide-react";

export const revalidate = 0;

export default async function AIPage() {
  const initialResponse = await askAICoach("");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-violet-950/40 via-indigo-950/40 to-zinc-950/80 p-6 rounded-3xl border border-indigo-500/20 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            AI Life Coach & Companion
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Context-Aware AI Assistant
          </h1>
          <p className="text-xs text-zinc-400">
            Ask for personalized habit optimizations, score breakdown advice, or goal strategies tuned to your live data.
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <AIChatInterface initialResponse={initialResponse} />
    </div>
  );
}
