"use client";

type BackButtonProps = {
  label?: string;
  className?: string;
};

export default function BackButton({ label = "Back", className }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className={`inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-xs ${className ?? ""}`}
    >
      <span className="inline-flex h-4 w-4 items-center justify-center">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </span>
      {label}
    </button>
  );
}
