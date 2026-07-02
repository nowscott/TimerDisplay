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

function getStageAlertText(phase: TimerPhase, remainingSeconds: number, forceHours: boolean): string {
  if (phase === "warning") {
    return "提醒阶段";
  }

  if (phase === "danger") {
    return "最后阶段";
  }

  if (phase === "overtime") {
    return `已超时 +${formatClock(Math.abs(remainingSeconds), forceHours)}`;
  }

  if (phase === "finished") {
    return "时间到";
  }

  return "";
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
  const timeText = remainingSeconds < 0 ? `+${formatClock(visibleSeconds, forceHours)}` : formatClock(visibleSeconds, forceHours);
  const elapsedSeconds = Math.max(0, totalSeconds - remainingSeconds);
  const elapsedForceHours = forceHours || elapsedSeconds >= 3600;
  const elapsedClock = formatClock(elapsedSeconds, elapsedForceHours);
  const totalClock = formatClock(totalSeconds, elapsedForceHours);
  const progress = Math.max(0, Math.min(100, (Math.max(0, remainingSeconds) / totalSeconds) * 100));
  const stageAlertText = getStageAlertText(phase, remainingSeconds, forceHours);

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
      <div className="stage-alert-slot" aria-live="polite">
        {stageAlertText ? (
          <div className="stage-alert" data-testid="timer-alert">
            {stageAlertText}
          </div>
        ) : null}
      </div>
      <div className="time-display" aria-live="polite" data-testid="time-display">
        {timeText}
      </div>
      <div className="stage-secondary" data-testid="timer-secondary">
        {secondaryText}
      </div>
      <div className="stage-metrics" aria-label="计时概览">
        <div className="stage-metric" data-testid="timer-elapsed">
          <strong>{elapsedClock}</strong>
          <span>已用时</span>
        </div>
        <div className="stage-metric">
          <strong>{totalClock}</strong>
          <span>总时长</span>
        </div>
      </div>
      <div className="progress-track" aria-hidden="true">
        <span className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}
