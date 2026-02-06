import { getCurrentUser } from "../../lib/auth";
import ThemeToggle from "./ThemeToggle";

export default async function AppHeader() {
  const currentUser = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface)] shadow-sm">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6 text-[var(--foreground)]">
        <div className="flex items-center gap-3 text-sm" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {currentUser ? (
            <details className="relative">
              <summary className="list-none cursor-pointer rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--foreground)] transition hover:border-emerald-300 hover:text-emerald-600">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--surface-soft)] text-[0.6rem] font-semibold text-[var(--foreground)]">
                    {currentUser.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{currentUser.name.slice(0, 1).toUpperCase()}</span>
                    )}
                  </span>
                  <span>{currentUser.name}</span>
                </span>
              </summary>
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-[0_12px_28px_rgba(15,23,42,0.18)]">
                <a
                  href="/users"
                  className="block rounded-xl px-3 py-2 text-xs transition hover:bg-[var(--surface-soft)] hover:text-emerald-600"
                >
                  Users
                </a>
                <a
                  href="/posts"
                  className="block rounded-xl px-3 py-2 text-xs transition hover:bg-[var(--surface-soft)] hover:text-emerald-600"
                >
                  Posts
                </a>
                <a
                  href="/profile"
                  className="block rounded-xl px-3 py-2 text-xs transition hover:bg-[var(--surface-soft)] hover:text-emerald-600"
                >
                  Profile
                </a>
                <form action="/api/auth/logout?redirect=/signin" method="post">
                  <button
                    type="submit"
                    className="mt-1 inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-500 transition hover:bg-[var(--surface-soft)] hover:text-red-600"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </details>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <a
                href="/signin"
                className="rounded-full border border-[var(--line)] px-3 py-1 text-[var(--foreground)] transition hover:border-emerald-300 hover:text-emerald-600"
              >
                Sign in
              </a>
              <a
                href="/signup"
                className="rounded-full border border-[var(--line)] px-3 py-1 text-[var(--foreground)] transition hover:border-emerald-300 hover:text-emerald-600"
              >
                Sign up
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
