import { NextResponse } from "next/server";
import connectMongo from "../../../../lib/mongodb";
import { getCurrentUser } from "../../../../lib/auth";
import FriendRequest from "../../../../models/FriendRequest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.redirect(new URL("/signin", request.url), 303);
  }

  const formData = await request.formData();
  const targetId = String(formData.get("targetId") ?? "").trim();
  const action = String(formData.get("action") ?? "request");

  if (!targetId || targetId === currentUser.id) {
    return NextResponse.redirect(new URL("/users", request.url), 303);
  }

  await connectMongo();

  if (action === "cancel") {
    await FriendRequest.deleteOne({
      requesterId: currentUser.id,
      recipientId: targetId,
      status: "pending",
    });
    return NextResponse.redirect(new URL("/users", request.url), 303);
  }

  const existing = await FriendRequest.findOne({
    $or: [
      { requesterId: currentUser.id, recipientId: targetId },
      { requesterId: targetId, recipientId: currentUser.id },
    ],
  });

  if (existing) {
    if (existing.status === "declined") {
      await FriendRequest.updateOne(
        { _id: existing._id },
        { requesterId: currentUser.id, recipientId: targetId, status: "pending" }
      );
    }
    return NextResponse.redirect(new URL("/users", request.url), 303);
  }

  await FriendRequest.create({
    requesterId: currentUser.id,
    recipientId: targetId,
    status: "pending",
  });

  return NextResponse.redirect(new URL("/users", request.url), 303);
}
