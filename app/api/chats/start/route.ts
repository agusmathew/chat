import { NextResponse } from "next/server";
import connectMongo from "../../../../lib/mongodb";
import Chat from "../../../../models/Chat";
import { getCurrentUser } from "../../../../lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const targetId = String(formData.get("targetId") ?? "");
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.redirect(new URL("/signin", request.url), 303);
  }
  if (!targetId) {
    return NextResponse.redirect(new URL("/users", request.url), 303);
  }

  await connectMongo();
  const participants = [currentUser.id, targetId].sort();
  const existingChat = await Chat.findOne({ participants });
  const chatId = existingChat
    ? existingChat._id.toString()
    : (await Chat.create({ participants }))._id.toString();

  return NextResponse.redirect(new URL(`/chat/${chatId}`, request.url), 303);
}
