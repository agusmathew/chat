import connectMongo from "../../../lib/mongodb";
import Message from "../../../models/Message";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await connectMongo();
  const messages = await Message.find().sort({ createdAt: -1 }).limit(50).lean();
  return Response.json({ messages: messages.reverse() });
}
