import { useEffect } from "react";

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";
}

interface TimerKeyboardShortcutsOptions {
  isFocusMode: boolean;
  onExitFullscreen: () => void;
  onToggleRun: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
}

export function useTimerKeyboardShortcuts({
  isFocusMode,
  onExitFullscreen,
  onToggleRun,
  onReset,
  onToggleFullscreen,
}: TimerKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFocusMode) {
        event.preventDefault();
        onExitFullscreen();
        return;
      }

      if (isEditableElement(event.target)) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        onToggleRun();
        return;
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        onReset();
        return;
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        onToggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode, onExitFullscreen, onReset, onToggleFullscreen, onToggleRun]);
}
