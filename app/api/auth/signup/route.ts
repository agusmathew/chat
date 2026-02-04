import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import connectMongo from "../../../../lib/mongodb";
import User from "../../../../models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!name || !email || !password) {
    return new Response("Missing fields", { status: 400 });
  }

  await connectMongo();

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return new Response("Email already registered", { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  const cookieStore = await cookies();
  cookieStore.set("uid", user._id.toString(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return Response.json({ user: { id: user._id.toString(), name: user.name, email: user.email } });
}
