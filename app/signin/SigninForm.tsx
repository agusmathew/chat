"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "../components/BackButton";

export default function SigninForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setError(await res.text());
      setLoading(false);
      return;
    }
    router.push("/users");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(110,231,183,0.35),rgba(110,231,183,0)_70%)]" />
        <div className="absolute bottom-[-120px] right-[-80px] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(247,179,209,0.35),rgba(247,179,209,0)_70%)]" />
      </div>
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm rounded-[28px] border-2 border-[var(--line)] bg-[var(--surface)] p-7 shadow-[var(--shadow-soft)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <BackButton className="px-3 py-2" />
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">Sign in to continue.</p>

        <div className="mt-6 flex flex-col gap-4 text-sm">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Email address
            </span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--foreground)]"
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Password
            </span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--foreground)]"
              placeholder="Your password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_20px_rgba(110,231,183,0.35)] disabled:opacity-60"
        >
          <span className="inline-flex h-4 w-4 items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v4" />
              <path d="M10 14L21 3" />
              <path d="M21 7v-4h-4" />
              <path d="M5 21a2 2 0 0 1-2-2v-4" />
              <path d="M3 17v4h4" />
            </svg>
          </span>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="mt-4 text-xs text-[var(--muted)]">
          New here?{" "}
          <a href="/signup" className="font-semibold text-[var(--foreground)]">
            Create an account
          </a>
        </p>
      </form>
    </div>
  );
}
