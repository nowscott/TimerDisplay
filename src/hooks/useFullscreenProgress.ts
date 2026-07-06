import { useEffect, useRef, useState } from "react";

interface FullscreenProgressOptions {
  enabled: boolean;
  status: "idle" | "running" | "paused" | "finished";
  elapsedProgress: number;
  remainingSeconds: number;
  totalSeconds: number;
}

export function useFullscreenProgress({
  enabled,
  status,
  elapsedProgress,
  remainingSeconds,
  totalSeconds,
}: FullscreenProgressOptions) {
  const [visualElapsedProgress, setVisualElapsedProgress] = useState(elapsedProgress);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  function syncTextContrastProgress(progress: number): void {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const fillEdge = window.innerWidth * (progress / 100);

    [titleRef.current, timeRef.current].forEach((element) => {
      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const overlapPercent = rect.width > 0 ? ((fillEdge - rect.left) / rect.width) * 100 : 0;
      const clampedPercent = Math.max(0, Math.min(100, overlapPercent));
      element.style.setProperty("--text-progress", `${clampedPercent}%`);
    });
  }

  useEffect(() => {
    if (!enabled || status !== "running") {
      setVisualElapsedProgress(elapsedProgress);
      return;
    }

    const syncedAt = performance.now();
    const syncedRemainingSeconds = remainingSeconds;
    let animationFrameId = 0;

    const updateProgress = (timestamp: number) => {
      const elapsedSinceSync = (timestamp - syncedAt) / 1000;
      const preciseRemainingSeconds = syncedRemainingSeconds - elapsedSinceSync;
      const nextProgress = Math.max(
        0,
        Math.min(100, ((totalSeconds - Math.max(0, preciseRemainingSeconds)) / totalSeconds) * 100)
      );

      setVisualElapsedProgress(nextProgress);
      animationFrameId = window.requestAnimationFrame(updateProgress);
    };

    animationFrameId = window.requestAnimationFrame(updateProgress);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [elapsedProgress, enabled, remainingSeconds, status, totalSeconds]);

  useEffect(() => {
    syncTextContrastProgress(visualElapsedProgress);
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleResize = () => syncTextContrastProgress(visualElapsedProgress);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [enabled, visualElapsedProgress]);

  return {
    visualElapsedProgress,
    titleRef,
    timeRef,
  };
}
