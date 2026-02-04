import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import connectMongo from "../../../../lib/mongodb";
import User from "../../../../models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return new Response("Missing fields", { status: 400 });
  }

  await connectMongo();

  const user = await User.findOne({ email });
  if (!user) {
    return new Response("Invalid credentials", { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return new Response("Invalid credentials", { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("uid", user._id.toString(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return Response.json({ user: { id: user._id.toString(), name: user.name, email: user.email } });
}
