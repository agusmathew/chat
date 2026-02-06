import { cookies } from "next/headers";
import connectMongo from "./mongodb";
import User from "../models/User";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("uid")?.value;
  if (!userId) return null;

  await connectMongo();
  const user = await User.findById(userId).lean();
  if (!user) return null;
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? "",
    likedUserIds: user.likedUserIds ?? [],
    dislikedUserIds: user.dislikedUserIds ?? [],
    blockedUserIds: user.blockedUserIds ?? [],
    lastActiveAt: user.lastActiveAt ?? null,
  };
}

export async function getAllUsers() {
  await connectMongo();
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return users.map((user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? "",
    likedUserIds: user.likedUserIds ?? [],
    dislikedUserIds: user.dislikedUserIds ?? [],
    blockedUserIds: user.blockedUserIds ?? [],
    lastActiveAt: user.lastActiveAt ?? null,
  }));
}
