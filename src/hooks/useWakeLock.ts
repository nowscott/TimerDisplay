import { useCallback, useEffect, useRef, useState } from "react";
import type { WakeLockStatus } from "../types";

type ScreenWakeLockSentinel = EventTarget & {
  readonly released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: "release", listener: () => void, options?: boolean | AddEventListenerOptions) => void;
};

type ScreenWakeLock = {
  request: (type: "screen") => Promise<ScreenWakeLockSentinel>;
};

type WakeLockNavigator = Navigator & {
  wakeLock?: ScreenWakeLock;
};

function getScreenWakeLock(): ScreenWakeLock | null {
  if (typeof navigator === "undefined" || typeof window === "undefined" || !window.isSecureContext) {
    return null;
  }

  return (navigator as WakeLockNavigator).wakeLock ?? null;
}

function getUnsupportedWakeLockStatus(): WakeLockStatus {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return "unsupported-insecure";
  }

  return "unsupported";
}

function getInitialWakeLockStatus(): WakeLockStatus {
  return getScreenWakeLock() ? "available" : getUnsupportedWakeLockStatus();
}

export function useWakeLock(preventDisplaySleep: boolean, setNotice: (notice: string) => void) {
  const [wakeLockStatus, setWakeLockStatus] = useState<WakeLockStatus>(() => getInitialWakeLockStatus());
  const wakeLockRef = useRef<ScreenWakeLockSentinel | null>(null);
  const preventDisplaySleepRef = useRef(preventDisplaySleep);

  useEffect(() => {
    preventDisplaySleepRef.current = preventDisplaySleep;
  }, [preventDisplaySleep]);

  const requestScreenWakeLock = useCallback(
    async (showFeedback = true, force = false): Promise<boolean> => {
      const wakeLock = getScreenWakeLock();

      if (!wakeLock) {
        const unsupportedStatus = getUnsupportedWakeLockStatus();
        setWakeLockStatus(unsupportedStatus);

        if (showFeedback) {
          setNotice(
            unsupportedStatus === "unsupported-insecure"
              ? "屏幕常亮需要 HTTPS 或 localhost 环境。"
              : "当前浏览器不支持屏幕常亮，请检查系统电源设置。"
          );
        }

        return false;
      }

      if (!force && !preventDisplaySleepRef.current) {
        setWakeLockStatus("available");
        return false;
      }

      if (document.visibilityState !== "visible") {
        setWakeLockStatus("blocked-hidden");
        return false;
      }

      if (wakeLockRef.current && !wakeLockRef.current.released) {
        setWakeLockStatus("active");

        if (showFeedback) {
          setNotice("屏幕常亮已启用。");
        }

        return true;
      }

      setWakeLockStatus("requesting");

      try {
        const sentinel = await wakeLock.request("screen");
        wakeLockRef.current = sentinel;
        setWakeLockStatus("active");

        sentinel.addEventListener("release", () => {
          if (wakeLockRef.current !== sentinel) {
            return;
          }

          wakeLockRef.current = null;
          setWakeLockStatus(getScreenWakeLock() ? "released" : "unsupported");
        });

        if (showFeedback) {
          setNotice("已启用屏幕常亮，投屏时会尽量避免自动息屏。");
        }

        return true;
      } catch {
        wakeLockRef.current = null;
        setWakeLockStatus(getScreenWakeLock() ? "blocked-permission" : getUnsupportedWakeLockStatus());

        if (showFeedback) {
          setNotice("无法启用屏幕常亮，请允许浏览器权限或检查系统电源设置。");
        }

        return false;
      }
    },
    [setNotice]
  );

  const releaseScreenWakeLock = useCallback(async (): Promise<void> => {
    const sentinel = wakeLockRef.current;
    wakeLockRef.current = null;

    if (sentinel && !sentinel.released) {
      try {
        await sentinel.release();
      } catch {
        // The browser may release wake locks during visibility changes.
      }
    }

    setWakeLockStatus(getScreenWakeLock() ? "available" : getUnsupportedWakeLockStatus());
  }, []);

  useEffect(() => {
    if (!preventDisplaySleep) {
      void releaseScreenWakeLock();
      return;
    }

    void requestScreenWakeLock(false);
  }, [preventDisplaySleep, releaseScreenWakeLock, requestScreenWakeLock]);

  useEffect(() => {
    if (
      !preventDisplaySleep ||
      wakeLockStatus === "active" ||
      wakeLockStatus === "requesting" ||
      wakeLockStatus === "unsupported"
    ) {
      return;
    }

    const handleFirstInteraction = () => {
      void requestScreenWakeLock(false);
    };

    window.addEventListener("pointerdown", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [preventDisplaySleep, requestScreenWakeLock, wakeLockStatus]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && preventDisplaySleepRef.current) {
        void requestScreenWakeLock(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [requestScreenWakeLock]);

  useEffect(
    () => () => {
      const sentinel = wakeLockRef.current;
      wakeLockRef.current = null;

      if (sentinel && !sentinel.released) {
        void sentinel.release();
      }
    },
    []
  );

  return {
    wakeLockStatus,
    requestScreenWakeLock,
    releaseScreenWakeLock,
  };
}
