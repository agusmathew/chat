import { redirect } from "next/navigation";
import { getAllUsers, getCurrentUser } from "../../lib/auth";

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/signin");
  }
  const users = await getAllUsers();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-xl rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Users</h1>
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

        <ul className="mt-6 space-y-3">
          {users.map((user) => {
            const isCurrent = user.id === currentUser.id;
            return (
              <li
                key={user.id}
                className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-[var(--muted)]">{user.email}</p>
                </div>
                {isCurrent ? (
                  <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-black">
                    You
                  </span>
                ) : (
                  <form action="/api/chats/start" method="post">
                    <input type="hidden" name="targetId" value={user.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-[var(--line)] px-4 py-1 text-xs"
                    >
                      Chat
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
