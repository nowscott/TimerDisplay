import { useEffect, useState } from "react";
import type { TimerPhase, TimerStatus } from "../types";
import { formatClock } from "../utils/time";
import { TimerControls } from "./TimerControls";

interface FullscreenViewProps {
  title: string;
  remainingSeconds: number;
  totalSeconds: number;
  phase: TimerPhase;
  status: TimerStatus;
  soundEnabled: boolean;
  showCurrentTime: boolean;
  isResetArmed: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  onToggleSound: () => void;
  onPreviewSound: () => void;
}

function formatCurrentTime(): string {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function FullscreenView({
  title,
  remainingSeconds,
  totalSeconds,
  phase,
  status,
  soundEnabled,
  showCurrentTime,
  isResetArmed,
  onToggleRun,
  onReset,
  onToggleFullscreen,
  onToggleSound,
  onPreviewSound,
}: FullscreenViewProps) {
  const forceHours = totalSeconds >= 3600 || Math.abs(remainingSeconds) >= 3600;
  const visibleSeconds = Math.abs(remainingSeconds);
  const timeText =
    remainingSeconds < 0 ? `+${formatClock(visibleSeconds, forceHours)}` : formatClock(visibleSeconds, forceHours);
  const elapsedSeconds = Math.max(0, totalSeconds - remainingSeconds);
  const elapsedText = formatClock(elapsedSeconds, forceHours || elapsedSeconds >= 3600);
  const remainingLabel = remainingSeconds < 0 ? "已超时" : "剩余";
  const remainingText =
    remainingSeconds < 0
      ? `+${formatClock(Math.abs(remainingSeconds), forceHours)}`
      : formatClock(remainingSeconds, forceHours);
  const [currentTime, setCurrentTime] = useState(() => formatCurrentTime());

  useEffect(() => {
    if (!showCurrentTime) {
      return;
    }

    const intervalId = window.setInterval(() => setCurrentTime(formatCurrentTime()), 1000);
    return () => window.clearInterval(intervalId);
  }, [showCurrentTime]);

  return (
    <main className={`fullscreen-view fullscreen-view--${phase}`}>
      {showCurrentTime ? (
        <div className="fullscreen-clock" aria-label="当前时间" data-testid="fullscreen-current-time">
          {currentTime}
        </div>
      ) : null}
      <section className="fullscreen-timer" aria-label="大屏倒计时">
        <h1 className="fullscreen-title" data-testid="fullscreen-title">
          {title}
        </h1>
        <div className="fullscreen-time" aria-live="polite" data-testid="time-display">
          {timeText}
        </div>
        <div className="fullscreen-meta" aria-label="计时概览">
          <span data-testid="timer-elapsed">已进行 {elapsedText}</span>
          <span data-testid="timer-remaining">
            {remainingLabel} {remainingText}
          </span>
        </div>
      </section>
      <div className="fullscreen-controls" aria-label="大屏控制">
        <TimerControls
          status={status}
          isFocusMode
          soundEnabled={soundEnabled}
          isResetArmed={isResetArmed}
          compact
          onToggleRun={onToggleRun}
          onReset={onReset}
          onToggleFullscreen={onToggleFullscreen}
          onToggleSound={onToggleSound}
          onPreviewSound={onPreviewSound}
        />
      </div>
    </main>
  );
}
