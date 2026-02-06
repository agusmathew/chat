"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "../components/BackButton";

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      setError(await res.text());
      setLoading(false);
      return;
    }
    router.push("/profile");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-7 shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <BackButton className="px-3 py-2" />
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Sign up to join chat and see other users.
        </p>

        <div className="mt-6 flex flex-col gap-4 text-sm">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Full name
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </label>
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
                placeholder="At least 6 characters"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
        >
          <span className="inline-flex h-4 w-4 items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </span>
          {loading ? "Creating..." : "Sign up"}
        </button>

        <p className="mt-4 text-xs text-[var(--muted)]">
          Already have an account?{" "}
          <a href="/signin" className="font-semibold text-[var(--foreground)]">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
