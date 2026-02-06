import { redirect } from "next/navigation";
import { getAllUsers, getCurrentUser } from "../../lib/auth";
import connectMongo from "../../lib/mongodb";
import FriendRequest from "../../models/FriendRequest";
import MoreMenu from "../components/MoreMenu";

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/signin");
  }
  await connectMongo();
  const requests = await FriendRequest.find({
    $or: [{ requesterId: currentUser.id }, { recipientId: currentUser.id }],
  }).lean();
  const users = await getAllUsers();
  const likedSet = new Set(currentUser.likedUserIds ?? []);
  const dislikedSet = new Set(currentUser.dislikedUserIds ?? []);
  const blockedSet = new Set(currentUser.blockedUserIds ?? []);
  const outgoingPending = new Set(
    requests
      .filter(
        (request) => request.status === "pending" && request.requesterId === currentUser.id
      )
      .map((request) => request.recipientId)
  );
  const incomingPending = new Set(
    requests
      .filter(
        (request) => request.status === "pending" && request.recipientId === currentUser.id
      )
      .map((request) => request.requesterId)
  );
  const friendSet = new Set(
    requests
      .filter((request) => request.status === "accepted")
      .map((request) =>
        request.requesterId === currentUser.id ? request.recipientId : request.requesterId
      )
  );

  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {users
            .filter((user) => !blockedSet.has(user.id))
            .map((user) => {
            const isCurrent = user.id === currentUser.id;
            const isLiked = likedSet.has(user.id);
            const isFriended = friendSet.has(user.id);
            const isOutgoing = outgoingPending.has(user.id);
            const isIncoming = incomingPending.has(user.id);
            const isDisliked = dislikedSet.has(user.id);
            const lastActiveAt = user.lastActiveAt ? new Date(user.lastActiveAt).getTime() : 0;
            const isOnline = lastActiveAt > 0 && Date.now() - lastActiveAt < 2 * 60 * 1000;
            const cardTone = isLiked
              ? "border-[var(--card-border)] bg-[var(--card-liked)]"
              : isDisliked
              ? "border-[var(--card-border)] bg-[var(--card-disliked)]"
              : "border-[var(--card-border)] bg-[var(--card-bg)]";
            return (
              <div
                key={user.id}
                className={`group relative flex flex-col overflow-visible rounded-3xl border-2 text-sm ${cardTone}`}
              >
                <div className="relative h-64 w-full overflow-hidden rounded-t-3xl bg-[var(--surface-soft)]">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className={`h-full w-full object-cover ${isDisliked ? "grayscale" : ""}`}
                    />
                  ) : (
                    <div className="absolute inset-0 flex h-full w-full items-center justify-center text-5xl font-semibold text-[var(--muted)]">
                      {user.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-t-3xl bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                  {isCurrent ? (
                    <span className="absolute right-4 top-4 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-black">
                      You
                    </span>
                  ) : isFriended ? (
                    <span className="absolute left-4 top-4 rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white">
                      Friend
                    </span>
                  ) : isOutgoing ? (
                    <span className="absolute left-4 top-4 rounded-full bg-slate-600 px-3 py-1 text-xs font-semibold text-white">
                      Requested
                    </span>
                  ) : isIncoming ? (
                    <span className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                      Request
                    </span>
                  ) : isLiked ? (
                    <span className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">
                      Liked
                    </span>
                  ) : isDisliked ? (
                    <span className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                      Disliked
                    </span>
                  ) : null}
                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isOnline ? "bg-emerald-400" : "bg-slate-400"
                        }`}
                        aria-label={isOnline ? "Online" : "Offline"}
                        title={isOnline ? "Online" : "Offline"}
                      />
                      <p className="text-lg font-semibold text-white">{user.name}</p>
                    </div>
                    <p className="text-xs text-white/70">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-1 items-center justify-between px-4 py-4">
                  <span className="text-xs text-[var(--muted)]">
                    {isCurrent ? "This is your profile card." : ""}
                  </span>
                  {!isCurrent ? (
                    <div className="flex items-center gap-2">
                      <form action="/api/chats/start" method="post">
                        <input type="hidden" name="targetId" value={user.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-black transition hover:brightness-95"
                          title="Chat"
                          aria-label="Chat"
                        >
                          <span className="inline-flex h-4 w-4 items-center justify-center">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                          </span>
                        </button>
                      </form>
                      <form action="/api/relationships/like" method="post">
                        <input type="hidden" name="targetId" value={user.id} />
                        <input type="hidden" name="action" value={isLiked ? "unlike" : "like"} />
                        <button
                          type="submit"
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition ${
                            isLiked
                              ? "border-rose-300 text-rose-600"
                              : "border-[var(--line)] text-[var(--muted)]"
                          }`}
                          title={isLiked ? "Liked" : "Like"}
                          aria-label={isLiked ? "Liked" : "Like"}
                        >
                          <span className="inline-flex h-3.5 w-3.5 items-center justify-center">
                            <svg
                              viewBox="0 0 24 24"
                              className="h-3.5 w-3.5"
                              fill={isLiked ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                            </svg>
                          </span>
                        </button>
                      </form>
                      {!isFriended && !isIncoming ? (
                        <form action="/api/friends/request" method="post">
                          <input type="hidden" name="targetId" value={user.id} />
                          <input
                            type="hidden"
                            name="action"
                            value={isOutgoing ? "cancel" : "request"}
                          />
                          <button
                            type="submit"
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition ${
                              isOutgoing
                                ? "border-slate-400 text-slate-600"
                                : "border-[var(--line)] text-[var(--muted)]"
                            }`}
                            title={isOutgoing ? "Cancel request" : "Add friend"}
                            aria-label={isOutgoing ? "Cancel request" : "Add friend"}
                          >
                            <span className="inline-flex h-4 w-4 items-center justify-center">
                              <svg
                                viewBox="0 0 24 24"
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="9" cy="8" r="3" />
                                <path d="M2 20a7 7 0 0 1 14 0" />
                                <path d="M16 11h6" />
                                <path d="M19 8v6" />
                              </svg>
                            </span>
                          </button>
                        </form>
                      ) : null}
                      {isIncoming && !isFriended ? (
                        <>
                          <form action="/api/friends/respond" method="post">
                            <input type="hidden" name="requesterId" value={user.id} />
                            <input type="hidden" name="action" value="accept" />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-2 rounded-full border border-emerald-300 px-3 py-2 text-xs font-medium text-emerald-600 transition"
                              title="Accept friend"
                              aria-label="Accept friend"
                            >
                              <span className="inline-flex h-4 w-4 items-center justify-center">
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                              </span>
                            </button>
                          </form>
                          <form action="/api/friends/respond" method="post">
                            <input type="hidden" name="requesterId" value={user.id} />
                            <input type="hidden" name="action" value="decline" />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-2 rounded-full border border-red-300 px-3 py-2 text-xs font-medium text-red-600 transition"
                              title="Decline friend"
                              aria-label="Decline friend"
                            >
                              <span className="inline-flex h-4 w-4 items-center justify-center">
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 6L6 18" />
                                  <path d="M6 6l12 12" />
                                </svg>
                              </span>
                            </button>
                          </form>
                        </>
                      ) : null}
                      <form action="/api/relationships/dislike" method="post">
                        <input type="hidden" name="targetId" value={user.id} />
                        <input
                          type="hidden"
                          name="action"
                          value={isDisliked ? "undislike" : "dislike"}
                        />
                        <button
                          type="submit"
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition ${
                            isDisliked
                              ? "border-amber-300 text-amber-700"
                              : "border-[var(--line)] text-[var(--muted)]"
                          }`}
                          title={isDisliked ? "Disliked" : "Dislike"}
                          aria-label={isDisliked ? "Disliked" : "Dislike"}
                        >
                          <span className="inline-flex h-4 w-4 items-center justify-center">
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill={isDisliked ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M7 10v10a2 2 0 0 0 2 2h5.3a2 2 0 0 0 1.94-1.52L18 14V6a2 2 0 0 0-2-2H9.5a1 1 0 0 0-.97.76L7 10z" />
                              <path d="M4 10H2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2" />
                            </svg>
                          </span>
                        </button>
                      </form>
                      <MoreMenu userId={user.id} />
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
