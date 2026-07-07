import { useCallback, useEffect, useRef, useState } from "react";

interface FullscreenModeOptions {
  setNotice: (notice: string) => void;
}

export function useFullscreenMode({ setNotice }: FullscreenModeOptions) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const enterFullscreen = useCallback(async () => {
    setIsFocusMode(true);

    try {
      if (!rootRef.current?.requestFullscreen) {
        setNotice("已进入大屏展示模式；如需隐藏浏览器工具栏，请手动全屏。");
        return;
      }

      if (!document.fullscreenElement) {
        await rootRef.current.requestFullscreen();
      }
    } catch {
      setNotice("已进入大屏展示模式；浏览器未允许原生全屏，可手动按 F11。");
    }
  }, [setNotice]);

  const exitFullscreen = useCallback(async () => {
    setIsFocusMode(false);

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      setNotice("无法退出全屏，请使用 Esc 或浏览器全屏按钮。");
    }
  }, [setNotice]);

  const toggleFullscreen = useCallback(() => {
    if (isFocusMode || document.fullscreenElement) {
      void exitFullscreen();
      return;
    }

    void enterFullscreen();
  }, [enterFullscreen, exitFullscreen, isFocusMode]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFocusMode(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return {
    rootRef,
    isFocusMode,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}
