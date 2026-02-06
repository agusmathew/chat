import { NextResponse } from "next/server";
import connectMongo from "../../../../lib/mongodb";
import { getCurrentUser } from "../../../../lib/auth";
import User from "../../../../models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  await connectMongo();
  await User.findByIdAndUpdate(currentUser.id, { lastActiveAt: new Date() });
  return NextResponse.json({ ok: true });
}
