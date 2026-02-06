"use client";

import { useEffect, useRef, useState } from "react";

type MoreMenuProps = {
  userId: string;
};

export default function MoreMenu({ userId }: MoreMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div ref={rootRef} className="relative z-20">
      <button
        type="button"
        className="rounded-full border border-[var(--line)] p-2 text-[var(--muted)] transition hover:border-red-300 hover:text-red-600"
        onClick={() => setOpen((value) => !value)}
        aria-label="More actions"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </span>
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-40 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-[0_12px_28px_rgba(15,23,42,0.18)]">
          <form action="/api/relationships/block" method="post">
            <input type="hidden" name="targetId" value={userId} />
            <input type="hidden" name="action" value="block" />
            <button
              type="submit"
              className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-[var(--surface-soft)] hover:text-red-600"
            >
              <span className="inline-flex h-3.5 w-3.5 items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M5 5l14 14" />
                </svg>
              </span>
              Block
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
