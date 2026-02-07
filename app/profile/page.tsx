"use client";

import { useEffect, useRef, useState } from "react";
import BackButton from "../components/BackButton";

type Profile = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

const MAX_IMAGE_BYTES = 1024 * 1024;

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [fileError, setFileError] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [cropScale, setCropScale] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropImageSize, setCropImageSize] = useState({ w: 0, h: 0 });
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cropImageRef = useRef<HTMLImageElement | null>(null);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null
  );

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/profile");
      if (res.status === 401) {
        window.location.href = "/signin";
        return;
      }
      const data = await res.json();
      setProfile(data.user);
      setName(data.user?.name ?? "");
      setAvatarUrl(data.user?.avatarUrl ?? "");
    };
    load();
  }, []);

  const saveProfile = async (nextName: string, nextAvatarUrl: string) => {
    setSaving(true);
    setStatus("");
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nextName, avatarUrl: nextAvatarUrl }),
    });
    if (!res.ok) {
      setStatus(await res.text());
      setSaving(false);
      return;
    }
    const data = await res.json();
    setProfile(data.user);
    setStatus("Profile updated.");
    setSaving(false);
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    setFileError("");
    if (file.size > MAX_IMAGE_BYTES) {
      setFileError("Image too large. Max 1MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      setCropImageUrl(result);
      const img = new Image();
      img.src = result;
      img.onload = () => {
        setCropImageSize({ w: img.width, h: img.height });
        setCropScale(1);
        setCropOffset({ x: 0, y: 0 });
        setCropOpen(true);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    await saveProfile(name, avatarUrl);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-[28px] border-2 border-[var(--line)] bg-[var(--surface)] p-8 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Your profile</h1>
            <p className="text-sm text-[var(--muted)]">
              Update your name and profile photo.
            </p>
          </div>
          <BackButton />
        </div>

        <form onSubmit={handleSave} className="mt-8 space-y-6">
          <div className="flex flex-col items-center gap-4 rounded-[20px] border border-[var(--line)] bg-[var(--surface-soft)] p-6 sm:flex-row">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--surface)] text-3xl font-semibold text-[var(--muted)]">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{name.slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-semibold">Profile photo</p>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleFile(event.target.files?.[0])}
                  className="text-xs"
                />
              </div>
              {fileError ? (
                <p className="text-xs text-red-600">{fileError}</p>
              ) : null}
            </div>
          </div>
          <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-soft)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Profile preview</p>
                <p className="text-xs text-[var(--muted)]">
                  This is how your card will look in the users grid.
                </p>
              </div>
              <span className="text-xs text-[var(--muted)]">Preview</span>
            </div>
            <div className="max-w-sm">
              <div className="flex flex-col overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)] text-sm shadow-[var(--shadow-soft)]">
                <div className="relative h-72 w-full overflow-hidden rounded-t-[28px] bg-[var(--surface-soft)]">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex h-full w-full items-center justify-center text-5xl font-semibold text-[var(--muted)]">
                      {name ? name.slice(0, 1).toUpperCase() : "?"}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-t-[28px] bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-lg font-semibold text-white">{name || "Your name"}</p>
                    <p className="text-xs text-white/70">{profile?.email ?? "you@example.com"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-xs text-[var(--muted)]">This is your profile card.</span>
                  <span className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-black shadow-[0_10px_20px_rgba(110,231,183,0.35)]">
                    You
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Full name
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--foreground)]"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Email
              </span>
              <input
                value={profile?.email ?? ""}
                disabled
                className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--muted)]"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-black shadow-[0_10px_20px_rgba(110,231,183,0.35)] disabled:opacity-60"
            >
              <span className="inline-flex h-4 w-4 items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V7l4-4h8l6 6v10a2 2 0 0 1-2 2z" />
                  <path d="M17 21v-8H7v8" />
                  <path d="M7 3v4h8" />
                </svg>
              </span>
              {saving ? "Saving..." : "Save changes"}
            </button>
            {status ? (
              <p className="text-xs text-[var(--muted)]">{status}</p>
            ) : null}
          </div>
        </form>
        {cropOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
            <div className="w-full max-w-2xl rounded-[28px] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">Crop your photo</p>
                  <p className="text-xs text-[var(--muted)]">
                    Drag to reposition, scroll or use the slider to zoom.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCropOpen(false)}
                  className="text-xs text-[var(--muted)]"
                >
                  Close
                </button>
              </div>
              <div className="mt-6 flex items-center justify-center">
                <div className="relative h-[360px] w-[360px] overflow-hidden rounded-[28px] border border-[var(--line)] bg-black">
                  <div
                    className="absolute inset-0"
                    onPointerDown={(event) => {
                      dragStart.current = {
                        x: event.clientX,
                        y: event.clientY,
                        ox: cropOffset.x,
                        oy: cropOffset.y,
                      };
                    }}
                    onPointerMove={(event) => {
                      if (!dragStart.current) return;
                      const dx = event.clientX - dragStart.current.x;
                      const dy = event.clientY - dragStart.current.y;
                      setCropOffset({
                        x: dragStart.current.ox + dx,
                        y: dragStart.current.oy + dy,
                      });
                    }}
                    onPointerUp={() => {
                      dragStart.current = null;
                    }}
                    onPointerLeave={() => {
                      dragStart.current = null;
                    }}
                    onWheel={(event) => {
                      event.preventDefault();
                      const delta = event.deltaY > 0 ? -0.05 : 0.05;
                      setCropScale((prev) =>
                        Math.min(3, Math.max(1, Number((prev + delta).toFixed(2))))
                      );
                    }}
                  >
                    <div className="absolute inset-0 bg-[var(--surface-soft)] opacity-40" />
                    <div className="absolute inset-0">
                      {cropImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cropImageUrl}
                          alt="Crop"
                          style={{
                            width:
                              cropImageSize.w === 0
                                ? "100%"
                                : `${cropImageSize.w *
                                    Math.min(
                                      360 / cropImageSize.w,
                                      360 / cropImageSize.h
                                    ) *
                                    cropScale}px`,
                            height:
                              cropImageSize.h === 0
                                ? "100%"
                                : `${cropImageSize.h *
                                    Math.min(
                                      360 / cropImageSize.w,
                                      360 / cropImageSize.h
                                    ) *
                                    cropScale}px`,
                            transform: `translate(calc(-50% + ${cropOffset.x}px), calc(-50% + ${cropOffset.y}px))`,
                            left: "50%",
                            top: "50%",
                          }}
                          className="absolute select-none pointer-events-none"
                        />
                      ) : null}
                    </div>
                    <div className="absolute inset-0 border-2 border-white/60" />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <span className="text-xs text-[var(--muted)]">Zoom</span>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={cropScale}
                  onChange={(event) => setCropScale(Number(event.target.value))}
                  className="w-full"
                />
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCropOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-xs"
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </span>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!cropCanvasRef.current) {
                      const canvas = document.createElement("canvas");
                      canvas.width = 512;
                      canvas.height = 512;
                      cropCanvasRef.current = canvas;
                    }
                    if (!cropImageRef.current) {
                      const img = new Image();
                      img.src = cropImageUrl;
                      await new Promise<void>((resolve) => {
                        img.onload = () => resolve();
                      });
                      cropImageRef.current = img;
                    }
                    const canvas = cropCanvasRef.current!;
                    const ctx = canvas.getContext("2d");
                    if (!ctx || !cropImageRef.current) return;
                    const img = cropImageRef.current;
                    const view = 512;
                    const previewSize = 360;
                    const baseScalePreview =
                      cropImageSize.w && cropImageSize.h
                        ? Math.min(previewSize / cropImageSize.w, previewSize / cropImageSize.h)
                        : 1;
                    const baseScaleOutput = Math.min(view / img.width, view / img.height);
                    const scale = baseScaleOutput * cropScale;
                    const scaleRatio = baseScaleOutput / baseScalePreview;
                    const offsetX = cropOffset.x * scaleRatio;
                    const offsetY = cropOffset.y * scaleRatio;
                    const displayW = img.width * scale;
                    const displayH = img.height * scale;
                    const left = (view - displayW) / 2 + offsetX;
                    const top = (view - displayH) / 2 + offsetY;
                    const sx = Math.max(0, -left / scale);
                    const sy = Math.max(0, -top / scale);
                    const sw = Math.min(img.width - sx, view / scale);
                    const sh = Math.min(img.height - sy, view / scale);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(
                      img,
                      sx,
                      sy,
                      sw,
                      sh,
                      0,
                      0,
                      canvas.width,
                      canvas.height
                    );
                    const blob = await new Promise<Blob | null>((resolve) =>
                      canvas.toBlob(resolve, "image/png")
                    );
                    if (!blob) return;
                    const presignRes = await fetch("/api/uploads/avatar", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        fileName: "avatar.png",
                        fileType: "image/png",
                      }),
                    });
                    if (!presignRes.ok) {
                      setFileError(await presignRes.text());
                      return;
                    }
                    const { uploadUrl, publicUrl } = (await presignRes.json()) as {
                      uploadUrl: string;
                      publicUrl: string;
                    };
                    const uploadRes = await fetch(uploadUrl, {
                      method: "PUT",
                      headers: { "Content-Type": "image/png" },
                      body: blob,
                    });
                    if (!uploadRes.ok) {
                      setFileError("Upload failed.");
                      return;
                    }
                    setAvatarUrl(publicUrl);
                    await saveProfile(name, publicUrl);
                    setCropOpen(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-black"
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  Save crop
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
