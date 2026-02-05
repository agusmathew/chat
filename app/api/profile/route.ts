import { getCurrentUser } from "../../../lib/auth";
import connectMongo from "../../../lib/mongodb";
import User from "../../../models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }
  return Response.json({ user: currentUser });
}

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const avatarUrl = String(body.avatarUrl ?? "").trim();

  await connectMongo();
  const update: { name?: string; avatarUrl?: string } = {};
  if (name) update.name = name;
  if (avatarUrl) update.avatarUrl = avatarUrl;

  const user = await User.findByIdAndUpdate(currentUser.id, update, {
    new: true,
  }).lean();

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  return Response.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl ?? "",
    },
  });
}
