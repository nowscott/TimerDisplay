import type { TimerPhase } from "../types";
import { formatClock } from "../utils/time";

interface TimerDisplayProps {
  title: string;
  remainingSeconds: number;
  totalSeconds: number;
  phase: TimerPhase;
  statusText: string;
  secondaryText: string;
  isFocusMode?: boolean;
}

export function TimerDisplay({
  title,
  remainingSeconds,
  totalSeconds,
  phase,
  statusText,
  secondaryText,
  isFocusMode = false,
}: TimerDisplayProps) {
  const forceHours = totalSeconds >= 3600 || Math.abs(remainingSeconds) >= 3600;
  const visibleSeconds = Math.abs(remainingSeconds);
  const progress = Math.max(0, Math.min(100, (Math.max(0, remainingSeconds) / totalSeconds) * 100));

  return (
    <section
      className={`timer-stage timer-stage--${phase} ${isFocusMode ? "timer-stage--focus" : ""}`}
      data-testid="timer-stage"
    >
      <div className="stage-header">
        <span className="stage-label">剩余时间</span>
        <span className="stage-status" data-testid="timer-status">
          {statusText}
        </span>
      </div>
      <h1 className="stage-title" data-testid="timer-title">
        {title}
      </h1>
      <div className="time-display" aria-live="polite" data-testid="time-display">
        {formatClock(visibleSeconds, forceHours)}
      </div>
      <div className="stage-secondary" data-testid="timer-secondary">
        {secondaryText}
      </div>
      <div className="progress-track" aria-hidden="true">
        <span className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}
