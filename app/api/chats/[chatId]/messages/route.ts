import connectMongo from "../../../../../lib/mongodb";
import Message from "../../../../../models/Message";
import Chat from "../../../../../models/Chat";
import { sendPushToUsers } from "../../../../../lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ chatId: string }>;
};

export async function GET(_: Request, { params }: RouteParams) {
  const { chatId } = await params;
  await connectMongo();
  const messages = await Message.find({ chatId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  return Response.json({ messages: messages.reverse() });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { chatId } = await params;
  const body = await request.json();
  const text = String(body.text ?? "").trim();
  const senderId = String(body.senderId ?? "").trim();
  const senderName = String(body.senderName ?? "").trim();

  if (!text || !senderId || !senderName) {
    return new Response("Missing fields", { status: 400 });
  }

  await connectMongo();
  const message = await Message.create({
    chatId,
    text,
    senderId,
    senderName,
  });

  const chat = await Chat.findById(chatId);
  const participants = (chat?.participants ?? []).filter(
    (userId: string) => userId && userId !== senderId
  );
  await sendPushToUsers(participants, {
    title: `New message from ${senderName}`,
    body: text,
    chatId,
  });

  return Response.json({ message });
}
