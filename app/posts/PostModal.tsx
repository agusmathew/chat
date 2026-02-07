"use client";

import { useState } from "react";
import PostComposer from "./PostComposer";

export default function PostModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-black shadow-[0_10px_20px_rgba(110,231,183,0.35)] transition hover:brightness-95"
          aria-label="Create post"
          title="Create post"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-2xl">
            <div className="absolute right-4 top-4 z-10">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-soft)] transition hover:border-red-300 hover:text-red-500"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PostComposer variant="modal" onPosted={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
