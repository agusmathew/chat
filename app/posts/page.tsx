import { redirect } from "next/navigation";
import connectMongo from "../../lib/mongodb";
import { getCurrentUser } from "../../lib/auth";
import Post from "../../models/Post";
import User from "../../models/User";
import PostModal from "./PostModal";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/signin");
  }

  await connectMongo();
  const posts = await Post.find().sort({ createdAt: -1 }).lean();
  const userIds = [...new Set(posts.map((post) => post.userId))];
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const userMap = new Map(
    users.map((user) => [
      user._id.toString(),
      {
        name: user.name,
        avatarUrl: user.avatarUrl ?? "",
      },
    ])
  );

  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <PostModal />
        <div className="space-y-6">
          {posts.map((post) => {
            const author = userMap.get(post.userId);
            return (
              <article
                key={post._id.toString()}
                className="overflow-hidden rounded-3xl border-2 border-[var(--card-border)] bg-[var(--surface)]"
              >
                <div className="flex items-center gap-3 border-b border-[var(--line)] px-5 py-4">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--surface-soft)] text-xs font-semibold text-[var(--muted)]">
                    {author?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={author.avatarUrl}
                        alt={author.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{author?.name?.slice(0, 1).toUpperCase() ?? "U"}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{author?.name ?? "Unknown"}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="bg-[var(--surface-soft)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.imageUrl}
                    alt={post.caption || "Post image"}
                    className="h-[420px] w-full object-cover"
                  />
                </div>
                {post.caption ? (
                  <p className="px-5 py-4 text-sm">{post.caption}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
