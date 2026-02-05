import { redirect } from "next/navigation";
import { getAllUsers, getCurrentUser } from "../../lib/auth";

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/signin");
  }
  const users = await getAllUsers();

  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-6 py-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold">Browse users</h1>
            <p className="text-sm text-[var(--muted)]">
              Signed in as {currentUser.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="rounded-full border border-[var(--line)] px-4 py-2 text-xs"
            >
              Back to chat
            </a>
            <a
              href="/profile"
              className="rounded-full border border-[var(--line)] px-4 py-2 text-xs"
            >
              Profile
            </a>
            <form action="/api/auth/logout?redirect=/signin" method="post">
              <button
                type="submit"
                className="rounded-full border border-[var(--line)] px-4 py-2 text-xs"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => {
            const isCurrent = user.id === currentUser.id;
            return (
              <div
                key={user.id}
                className="group flex flex-col overflow-hidden rounded-[32px] border border-[var(--line)] bg-[var(--surface)] text-sm shadow-sm transition hover:-translate-y-1 hover:shadow-md"
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
                  ) : null}
                  <div className="absolute bottom-4 left-4">
                    <p className="text-lg font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-white/70">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-1 items-center justify-between px-5 py-4">
                  <span className="text-xs text-[var(--muted)]">
                    {isCurrent ? "This is your profile card." : "Tap to start a chat"}
                  </span>
                  {!isCurrent ? (
                    <form action="/api/chats/start" method="post">
                      <input type="hidden" name="targetId" value={user.id} />
                      <button
                        type="submit"
                        className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-black"
                      >
                        Start chat
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
