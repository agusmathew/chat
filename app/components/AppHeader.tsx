import { getCurrentUser } from "../../lib/auth";
import ThemeToggle from "./ThemeToggle";

export default async function AppHeader() {
  const currentUser = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-6 py-3">
        <div className="flex items-center justify-between rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[var(--foreground)] shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3 text-sm">
            <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#bff3d7,#6ee7b7_60%)] shadow-[0_0_12px_rgba(110,231,183,0.55)]" />
          </div>
          <div className="flex items-center gap-2">
          <ThemeToggle />
          {currentUser ? (
            <details className="relative">
              <summary className="list-none cursor-pointer rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--foreground)] transition hover:border-emerald-300 hover:text-emerald-600">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--surface)] text-[0.6rem] font-semibold text-[var(--foreground)]">
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
              <div className="absolute right-0 mt-2 w-48 rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-2 shadow-[var(--shadow-soft)]">
                <a
                  href="/users"
                  className="block rounded-[14px] px-3 py-2 text-xs transition hover:bg-[var(--surface-soft)] hover:text-emerald-600"
                >
                  Users
                </a>
                <a
                  href="/posts"
                  className="block rounded-[14px] px-3 py-2 text-xs transition hover:bg-[var(--surface-soft)] hover:text-emerald-600"
                >
                  Posts
                </a>
                <a
                  href="/profile"
                  className="block rounded-[14px] px-3 py-2 text-xs transition hover:bg-[var(--surface-soft)] hover:text-emerald-600"
                >
                  Profile
                </a>
                <form action="/api/auth/logout?redirect=/signin" method="post">
                  <button
                    type="submit"
                    className="mt-1 inline-flex w-full items-center gap-2 rounded-[14px] px-3 py-2 text-xs text-red-500 transition hover:bg-[var(--surface-soft)] hover:text-red-600"
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
                className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-[var(--foreground)] transition hover:border-emerald-300 hover:text-emerald-600"
              >
                Sign in
              </a>
              <a
                href="/signup"
                className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-[var(--foreground)] transition hover:border-emerald-300 hover:text-emerald-600"
              >
                Sign up
              </a>
            </div>
          )}
        </div>
        </div>
      </div>
    </header>
  );
}
