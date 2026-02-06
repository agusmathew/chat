import { NextResponse } from "next/server";
import connectMongo from "../../../../lib/mongodb";
import { getCurrentUser } from "../../../../lib/auth";
import User from "../../../../models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.redirect(new URL("/signin", request.url), 303);
  }

  const formData = await request.formData();
  const targetId = String(formData.get("targetId") ?? "").trim();
  const action = String(formData.get("action") ?? "dislike");

  if (!targetId || targetId === currentUser.id) {
    return NextResponse.redirect(new URL("/users", request.url), 303);
  }

  await connectMongo();
  if (action === "undislike") {
    await User.findByIdAndUpdate(currentUser.id, { $pull: { dislikedUserIds: targetId } });
  } else {
    await User.findByIdAndUpdate(currentUser.id, {
      $addToSet: { dislikedUserIds: targetId },
      $pull: { likedUserIds: targetId },
    });
  }

  return NextResponse.redirect(new URL("/users", request.url), 303);
}
