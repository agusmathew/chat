import webpush from "web-push";
import connectMongo from "./mongodb";
import PushSubscription from "../models/PushSubscription";

const publicKey = process.env.VAPID_PUBLIC_KEY ?? "";
const privateKey = process.env.VAPID_PRIVATE_KEY ?? "";
const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@example.com";

if (!publicKey || !privateKey) {
  throw new Error("Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY.");
}

webpush.setVapidDetails(subject, publicKey, privateKey);

export async function sendPushToUsers(userIds: string[], payload: Record<string, unknown>) {
  if (userIds.length === 0) return;
  await connectMongo();
  const subs = await PushSubscription.find({ userId: { $in: userIds } }).lean();
  await Promise.all(
    subs.map(async (sub: { endpoint: string; keys: { p256dh: string; auth: string } }) => {
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload));
      } catch (error) {
        // Ignore invalid subscriptions
      }
    })
  );
}
