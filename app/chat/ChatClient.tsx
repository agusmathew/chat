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
  chatId: string;
};

export default function ChatClient({ userId, userName, peerName, chatId }: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
        <header className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface-soft)] px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">Chat with {peerName}</h1>
            <p className="text-xs text-[var(--muted)]">WhatsApp-like realtime messaging</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/users" className="text-xs text-[var(--muted)]">
              Users
            </a>
            <span className="text-xs text-[var(--muted)]">Signed in as {userName}</span>
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
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-black/60">
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
