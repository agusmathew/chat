"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  _id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: string;
};

type ChatClientProps = {
  userId: string;
  userName: string;
  peerName: string;
  peerAvatarUrl?: string;
  userAvatarUrl?: string;
  chatId: string;
};

export default function ChatClient({
  userId,
  userName,
  peerName,
  peerAvatarUrl,
  userAvatarUrl,
  chatId,
}: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [pushStatus, setPushStatus] = useState("Enable notifications");
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkPush = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return;
      }
      try {
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(existing.toJSON ? existing.toJSON() : existing),
          });
          setPushStatus("Notifications enabled");
        }
      } catch {
        // ignore
      }
    };
    checkPush();
  }, []);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/chats/${chatId}/messages`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages ?? []);
    };

    load();
    pollRef.current = setInterval(load, 1500);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [chatId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    fetch(`/api/chats/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: trimmed,
        senderId: userId,
        senderName: userName,
      }),
    });
    setText("");
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/signin";
  };

  const enablePush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushStatus("Push not supported");
      return;
    }
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
    if (!publicKey) {
      setPushStatus("Missing VAPID key");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushStatus("Permission denied");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON ? subscription.toJSON() : subscription),
      });
      if (!res.ok) {
        const message = await res.text();
        setPushStatus(message || "Save failed");
        return;
      }
      setPushStatus("Notifications enabled");
    } catch (error) {
      setPushStatus("Enable failed");
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
        <header className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface-soft)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[var(--line)] bg-white text-xs font-semibold text-[var(--muted)]">
              {peerAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={peerAvatarUrl}
                  alt={peerName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{peerName.slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold">Chat with {peerName}</h1>
              <p className="text-xs text-[var(--muted)]">WhatsApp-like realtime messaging</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/users" className="text-xs text-[var(--muted)]">
              Users
            </a>
            <a href="/profile" className="text-xs text-[var(--muted)]">
              Profile
            </a>
            <button
              onClick={enablePush}
              className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)]"
            >
              {pushStatus}
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-[var(--line)] bg-white text-[0.6rem] font-semibold text-[var(--muted)]">
                {userAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userAvatarUrl}
                    alt={userName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{userName.slice(0, 1).toUpperCase()}</span>
                )}
              </div>
              <span className="text-xs text-[var(--muted)]">Signed in as {userName}</span>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)] hover:border-gray-300"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto bg-[var(--surface)] px-6 py-5">
          {messages.map((message) => {
            const mine = message.senderId === userId;
            return (
              <div
                key={String(message._id)}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow ${
                    mine
                      ? "bg-[var(--accent)] text-black"
                      : "bg-[var(--surface-soft)] text-[var(--foreground)]"
                  }`}
                >
                  <p
                    className={`text-[0.65rem] uppercase tracking-[0.2em] ${
                      mine ? "text-black/60" : "text-[var(--muted)]"
                    }`}
                  >
                    {message.senderName}
                  </p>
                  <p className="mt-1">{message.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <footer className="border-t border-[var(--line)] bg-[var(--surface-soft)] px-6 py-4">
          <div className="flex items-center gap-3">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSend();
              }}
              placeholder="Type a message"
              className="flex-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--foreground)]"
            />
            <button
              onClick={handleSend}
              className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-black"
            >
              Send
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
