"use client";

import { useEffect } from "react";

const SPINNER_DURATION_MS = 650;

export default function ButtonSpinner() {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const button = target.closest("button");
      if (!button) return;
      if (button.dataset.noSpinner === "true") return;

      button.setAttribute("data-loading", "true");
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        button.removeAttribute("data-loading");
      }, SPINNER_DURATION_MS);
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}
