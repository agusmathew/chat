"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-7 shadow-sm"
      >
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Sign in to continue.</p>

        <div className="mt-6 flex flex-col gap-4 text-sm">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Email address
            </span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
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
            <div className="flex items-center gap-3">
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
                placeholder="Your password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="rounded-full border border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          disabled={loading}
          className="mt-6 w-full rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
        >
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
