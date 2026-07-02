import type { TimerPhase, TimerStatus } from "../types";
import { formatClock } from "../utils/time";
import { TimerControls } from "./TimerControls";

interface FullscreenViewProps {
  remainingSeconds: number;
  totalSeconds: number;
  phase: TimerPhase;
  status: TimerStatus;
  soundEnabled: boolean;
  isResetArmed: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  onToggleSound: () => void;
  onPreviewSound: () => void;
}

export function FullscreenView({
  remainingSeconds,
  totalSeconds,
  phase,
  status,
  soundEnabled,
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
  const remainingText =
    remainingSeconds < 0
      ? `+${formatClock(Math.abs(remainingSeconds), forceHours)}`
      : formatClock(remainingSeconds, forceHours);

  return (
    <main className={`fullscreen-view fullscreen-view--${phase}`}>
      <section className="fullscreen-timer" aria-label="大屏倒计时">
        <div className="fullscreen-time" aria-live="polite" data-testid="time-display">
          {timeText}
        </div>
        <div className="fullscreen-meta" aria-label="计时概览">
          <span data-testid="timer-elapsed">已进行 {elapsedText}</span>
          <span data-testid="timer-remaining">剩余 {remainingText}</span>
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
