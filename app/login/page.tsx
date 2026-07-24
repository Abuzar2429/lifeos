"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { loginUser, registerUser, loginAsDemoUser } from "@/lib/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      if (mode === "login") {
        const res = await loginUser({ email, password });
        if (res.success) {
          router.push("/");
          router.refresh();
        } else {
          setError(res.error || "Failed to sign in.");
        }
      } else {
        const res = await registerUser({ name, email, password });
        if (res.success) {
          router.push("/");
          router.refresh();
        } else {
          setError(res.error || "Failed to create account.");
        }
      }
    });
  };

  const handleQuickDemoLogin = () => {
    setError(null);
    startTransition(async () => {
      const res = await loginAsDemoUser();
      if (res.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(res.error || "Failed to sign in as demo user.");
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950 text-zinc-100 font-sans relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Ambient Glow Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

      {/* Main Glassmorphism Container */}
      <div className="relative z-10 w-full max-w-md bg-zinc-900/80 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl space-y-7">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 text-white shadow-xl shadow-indigo-600/30 mb-2">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">LifeOS</h1>
          <p className="text-xs text-zinc-400">
            Personal Operating System for Health, Focus & Goals
          </p>
        </div>

        {/* Tab Switcher (Sign In vs Create Account) */}
        <div className="flex rounded-2xl bg-zinc-950/80 p-1 border border-zinc-800">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
              mode === "login"
                ? "bg-zinc-800 text-white shadow-md border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
              mode === "register"
                ? "bg-zinc-800 text-white shadow-md border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium text-center animate-fadeIn">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="Ashraf"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                placeholder="you@lifeos.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 text-sm font-extrabold text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-2"
          >
            {isPending ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === "login" ? "Sign In to LifeOS" : "Create Account"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-zinc-800" />
          <span className="absolute bg-zinc-900 px-3 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            OR
          </span>
        </div>

        {/* 1-Click Quick Demo Login */}
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-950/90 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/10 hover:border-indigo-500/50 text-xs font-bold transition-all shadow-md"
        >
          <Zap className="h-4 w-4 text-indigo-400" />
          <span>🚀 Quick Demo Sign In (1-Click as Ashraf)</span>
        </button>

        {/* Security & Privacy Footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 pt-2">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
          <span>Local-first Encrypted Data Storage</span>
        </div>
      </div>
    </div>
  );
}
