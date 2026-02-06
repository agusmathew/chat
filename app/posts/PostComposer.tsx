"use client";

import { useState } from "react";

type UploadResponse = {
  uploadUrl: string;
  publicUrl: string;
};

type PostComposerProps = {
  variant?: "card" | "modal";
  onPosted?: () => void;
};

export default function PostComposer({ variant = "card", onPosted }: PostComposerProps) {
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (nextFile: File | null) => {
    if (!nextFile) {
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
  };

  const createPost = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const presignRes = await fetch("/api/uploads/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!presignRes.ok) {
        throw new Error("Failed to get upload url");
      }
      const { uploadUrl, publicUrl } = (await presignRes.json()) as UploadResponse;
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) {
        throw new Error("Upload failed");
      }
      const postRes = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: publicUrl, caption }),
      });
      if (!postRes.ok) {
        throw new Error("Failed to create post");
      }
      setCaption("");
      setFile(null);
      setPreview(null);
      onPosted?.();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const containerClassName =
    variant === "modal"
      ? "rounded-3xl bg-[var(--surface)] p-6"
      : "rounded-3xl border-2 border-[var(--card-border)] bg-[var(--surface)] p-6";

  return (
    <div className={containerClassName}>
      <div className="flex flex-col gap-4 md:flex-row">
        <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface-soft)] px-4 py-6 text-xs text-[var(--muted)]">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />
          <span>Upload image</span>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Preview"
              className="mt-2 h-40 w-full rounded-2xl object-cover"
            />
          ) : null}
        </label>
        <div className="flex w-full flex-col gap-3">
          <textarea
            placeholder="Write a caption (optional)"
            className="h-32 w-full resize-none rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
          />
          {error ? <p className="text-xs text-red-500">{error}</p> : null}
          <button
            type="button"
            onClick={createPost}
            disabled={!file || isUploading}
            className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-black transition hover:brightness-95 disabled:opacity-50"
          >
            {isUploading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
