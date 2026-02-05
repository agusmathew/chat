import { getCurrentUser } from "../../../../lib/auth";
import connectMongo from "../../../../lib/mongodb";
import PushSubscription from "../../../../models/PushSubscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const endpoint = String(body?.endpoint ?? "").trim();
  const keys = body?.keys ?? {};
  const p256dh = String(keys.p256dh ?? "").trim();
  const auth = String(keys.auth ?? "").trim();

  if (!endpoint || !p256dh || !auth) {
    return new Response("Invalid subscription", { status: 400 });
  }

  await connectMongo();
  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { userId: currentUser.id, endpoint, keys: { p256dh, auth } },
    { upsert: true }
  );

  return Response.json({ ok: true });
}
