"use client";

import { useEffect } from "react";

const PING_INTERVAL_MS = 30000;

export default function PresencePing() {
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const ping = () => {
      fetch("/api/presence/ping", { method: "POST" }).catch(() => undefined);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        ping();
      }
    };

    ping();
    intervalId = setInterval(ping, PING_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
