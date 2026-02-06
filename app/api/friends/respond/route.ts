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
  const requesterId = String(formData.get("requesterId") ?? "").trim();
  const action = String(formData.get("action") ?? "accept");

  if (!requesterId || requesterId === currentUser.id) {
    return NextResponse.redirect(new URL("/users", request.url), 303);
  }

  await connectMongo();

  const requestDoc = await FriendRequest.findOne({
    requesterId,
    recipientId: currentUser.id,
    status: "pending",
  });

  if (!requestDoc) {
    return NextResponse.redirect(new URL("/users", request.url), 303);
  }

  if (action === "decline") {
    await FriendRequest.updateOne({ _id: requestDoc._id }, { status: "declined" });
  } else {
    await FriendRequest.updateOne({ _id: requestDoc._id }, { status: "accepted" });
  }

  return NextResponse.redirect(new URL("/users", request.url), 303);
}
