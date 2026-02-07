"use client";

import { useEffect, useRef, useState } from "react";
import BackButton from "../components/BackButton";

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
  chatId: string;
};

export default function ChatClient({
  userId,
  userName,
  peerName,
  peerAvatarUrl,
  chatId,
}: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
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

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-4">
      <div className="flex h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-[28px] border border-[var(--line)] bg-[radial-gradient(120%_120%_at_50%_0%,rgba(110,231,183,0.12),transparent_60%)] shadow-[var(--shadow-soft)]">
        <header className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface)]/80 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--surface-soft)] text-xs font-semibold text-[var(--muted)]">
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
              <h1 className="text-lg font-semibold">{peerName}</h1>
              <p className="text-xs text-[var(--muted)]">Direct chat</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BackButton className="px-3 py-1" />
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
                  className={`max-w-[70%] rounded-[20px] px-4 py-2 text-sm ${
                    mine
                      ? "bg-[var(--accent)] text-black shadow-[0_8px_20px_rgba(110,231,183,0.25)]"
                      : "bg-[var(--surface-soft)] text-[var(--foreground)] shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
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

        <footer className="border-t border-[var(--line)] bg-[var(--surface)]/80 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 shadow-[var(--shadow-soft)]">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSend();
              }}
              placeholder="Type a message"
              className="flex-1 rounded-full bg-transparent px-4 py-2 text-sm text-[var(--foreground)]"
            />
            <button
              onClick={handleSend}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-black shadow-[0_10px_20px_rgba(110,231,183,0.3)]"
            >
              <span className="inline-flex h-4 w-4 items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13" />
                  <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </span>
              Send
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
