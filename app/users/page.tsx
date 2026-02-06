import { redirect } from "next/navigation";
import { getAllUsers, getCurrentUser } from "../../lib/auth";

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/signin");
  }
  const users = await getAllUsers();
  const likedSet = new Set(currentUser.likedUserIds ?? []);
  const dislikedSet = new Set(currentUser.dislikedUserIds ?? []);
  const blockedSet = new Set(currentUser.blockedUserIds ?? []);

  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {users
            .filter((user) => !blockedSet.has(user.id))
            .map((user) => {
            const isCurrent = user.id === currentUser.id;
            const isLiked = likedSet.has(user.id);
            const isDisliked = dislikedSet.has(user.id);
            return (
              <div
                key={user.id}
                className={`group relative flex flex-col overflow-hidden rounded-[32px] border text-sm shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                  isLiked
                    ? "border-emerald-300/60 bg-emerald-50/40 ring-1 ring-emerald-200"
                    : "border-[var(--line)] bg-[var(--surface)]"
                }`}
              >
                <div className="relative h-72 w-full overflow-hidden bg-[var(--surface-soft)]">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex h-full w-full items-center justify-center text-5xl font-semibold text-[var(--muted)]">
                      {user.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                  {isCurrent ? (
                    <span className="absolute right-4 top-4 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-black">
                      You
                    </span>
                  ) : isLiked ? (
                    <span className="absolute left-4 top-4 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                      Liked
                    </span>
                  ) : null}
                  <div className="absolute bottom-4 left-4">
                    <p className="text-lg font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-white/70">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-1 items-center justify-between px-5 py-4">
                  <span className="text-xs text-[var(--muted)]">
                    {isCurrent ? "This is your profile card." : ""}
                  </span>
                  {!isCurrent ? (
                    <div className="flex items-center gap-2">
                      <form action="/api/chats/start" method="post">
                        <input type="hidden" name="targetId" value={user.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-black transition hover:bg-[#1fb955] hover:text-white"
                        >
                          <span className="inline-flex h-4 w-4 items-center justify-center">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                          </span>
                          Chat
                        </button>
                      </form>
                      <form action="/api/relationships/like" method="post">
                        <input type="hidden" name="targetId" value={user.id} />
                        <input type="hidden" name="action" value={isLiked ? "unlike" : "like"} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--muted)] transition hover:border-emerald-400 hover:text-emerald-500"
                        >
                          <span className="inline-flex h-3.5 w-3.5 items-center justify-center">
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                            </svg>
                          </span>
                          {isLiked ? "Liked" : "Like"}
                        </button>
                      </form>
                      <form action="/api/relationships/dislike" method="post">
                        <input type="hidden" name="targetId" value={user.id} />
                        <input
                          type="hidden"
                          name="action"
                          value={isDisliked ? "undislike" : "dislike"}
                        />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--muted)] transition hover:border-amber-300 hover:text-amber-600"
                        >
                          <span className="inline-flex h-3.5 w-3.5 items-center justify-center">
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M10 14l4-4" />
                              <path d="M4 10h6l3-6 3 6h4" />
                            </svg>
                          </span>
                          {isDisliked ? "Disliked" : "Dislike"}
                        </button>
                      </form>
                      <details className="relative z-20">
                        <summary className="list-none cursor-pointer rounded-full border border-[var(--line)] p-2 text-[var(--muted)] transition hover:border-red-300 hover:text-red-600">
                          <span className="inline-flex h-5 w-5 items-center justify-center">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                              <circle cx="5" cy="12" r="2" />
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="19" cy="12" r="2" />
                            </svg>
                          </span>
                        </summary>
                        <div className="absolute right-0 z-30 mt-2 w-40 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-[0_12px_28px_rgba(15,23,42,0.18)]">
                          <form action="/api/relationships/block" method="post">
                            <input type="hidden" name="targetId" value={user.id} />
                            <input type="hidden" name="action" value="block" />
                            <button
                              type="submit"
                              className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-[var(--surface-soft)] hover:text-red-600"
                            >
                              <span className="inline-flex h-3.5 w-3.5 items-center justify-center">
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="9" />
                                  <path d="M5 5l14 14" />
                                </svg>
                              </span>
                              Block
                            </button>
                          </form>
                        </div>
                      </details>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {blockedSet.size > 0 ? (
          <div className="mt-10 rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-6 py-5">
            <h2 className="text-lg font-semibold">Blocked users</h2>
            <p className="text-xs text-[var(--muted)]">
              You can unblock them anytime.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {users
                .filter((user) => blockedSet.has(user.id))
                .map((user) => (
                  <div
                    key={`blocked-${user.id}`}
                    className="flex items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-xs"
                  >
                    <span className="font-semibold">{user.name}</span>
                    <form action="/api/relationships/block" method="post">
                      <input type="hidden" name="targetId" value={user.id} />
                      <input type="hidden" name="action" value="unblock" />
                      <button
                        type="submit"
                        className="rounded-full border border-[var(--line)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]"
                      >
                        Unblock
                      </button>
                    </form>
                  </div>
                ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
