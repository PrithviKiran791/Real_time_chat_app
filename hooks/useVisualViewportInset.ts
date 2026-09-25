"use client";

import { useEffect } from "react";

/**
 * Tracks the overlap between the layout viewport and the visual viewport
 * (typically the on-screen keyboard). On browsers where
 * `interactive-widget: resizes-content` already shrinks `window.innerHeight`,
 * the computed inset is ~0 and no extra padding is applied.
 */
export function useVisualViewportInset() {
  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const update = () => {
      const inset = Math.max(
        0,
        window.innerHeight - visualViewport.height - visualViewport.offsetTop
      );
      document.documentElement.style.setProperty("--keyboard-inset", `${Math.round(inset)}px`);
    };

    update();
    visualViewport.addEventListener("resize", update);
    visualViewport.addEventListener("scroll", update);
    window.addEventListener("orientationchange", update);

    return () => {
      visualViewport.removeEventListener("resize", update);
      visualViewport.removeEventListener("scroll", update);
      window.removeEventListener("orientationchange", update);
      document.documentElement.style.removeProperty("--keyboard-inset");
    };
  }, []);
}
