import { NextResponse } from "next/server";
import connectMongo from "../../../lib/mongodb";
import { getCurrentUser } from "../../../lib/auth";
import Post from "../../../models/Post";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await connectMongo();
  const posts = await Post.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(
    posts.map((post) => ({
      id: post._id.toString(),
      userId: post.userId,
      imageUrl: post.imageUrl,
      caption: post.caption ?? "",
      createdAt: post.createdAt,
    }))
  );
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const imageUrl = String(body?.imageUrl ?? "").trim();
  const caption = String(body?.caption ?? "").trim();

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
  }

  await connectMongo();
  const post = await Post.create({
    userId: currentUser.id,
    imageUrl,
    caption,
  });

  return NextResponse.json({
    id: post._id.toString(),
    userId: post.userId,
    imageUrl: post.imageUrl,
    caption: post.caption ?? "",
    createdAt: post.createdAt,
  });
}
