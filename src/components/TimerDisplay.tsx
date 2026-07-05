import { useEffect, useState, type ReactNode } from "react";
import type { TimerMode, TimerPhase } from "../types";
import { formatClock, formatCurrentDate, formatCurrentTime } from "../utils/time";

interface TimerDisplayProps {
  mode: TimerMode;
  title: string;
  remainingSeconds: number;
  elapsedSeconds: number;
  totalSeconds: number;
  phase: TimerPhase;
  statusText: string;
  secondaryText: string;
  controls?: ReactNode;
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
  mode,
  title,
  remainingSeconds,
  elapsedSeconds,
  totalSeconds,
  phase,
  statusText,
  secondaryText,
  controls,
  isFocusMode = false,
}: TimerDisplayProps) {
  const [now, setNow] = useState(() => new Date());
  const forceHours = totalSeconds >= 3600 || Math.abs(remainingSeconds) >= 3600;
  const visibleSeconds = Math.abs(remainingSeconds);
  const countdownElapsedSeconds = Math.max(0, totalSeconds - remainingSeconds);
  const displayElapsedSeconds = mode === "countup" ? elapsedSeconds : countdownElapsedSeconds;
  const elapsedForceHours = forceHours || displayElapsedSeconds >= 3600;
  const countdownTimeText =
    remainingSeconds < 0 ? `+${formatClock(visibleSeconds, forceHours)}` : formatClock(visibleSeconds, forceHours);
  const timeText =
    mode === "clock"
      ? formatCurrentTime(now)
      : mode === "countup"
        ? formatClock(elapsedSeconds, elapsedSeconds >= 3600)
        : countdownTimeText;
  const elapsedClock = formatClock(displayElapsedSeconds, elapsedForceHours);
  const totalClock = formatClock(totalSeconds, elapsedForceHours);
  const progress = Math.max(0, Math.min(100, (Math.max(0, remainingSeconds) / totalSeconds) * 100));
  const stageAlertText = mode === "countdown" ? getStageAlertText(phase, remainingSeconds, forceHours) : "";
  const stageLabel = mode === "clock" ? "当前时间" : mode === "countup" ? "正计时" : "剩余时间";
  const stageClass = mode === "countdown" ? phase : "normal";
  const secondaryContent = mode === "clock" ? formatCurrentDate(now) : secondaryText;
  const primaryMetricValue = mode === "clock" ? "待机" : elapsedClock;
  const primaryMetricLabel = mode === "countup" ? "已计时" : mode === "clock" ? "模式" : "已用时";
  const secondaryMetricValue = mode === "clock" ? "全屏" : totalClock;
  const secondaryMetricLabel = mode === "countdown" ? "总时长" : mode === "countup" ? "参考时长" : "建议";

  useEffect(() => {
    if (mode !== "clock") {
      return;
    }

    const intervalId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(intervalId);
  }, [mode]);

  return (
    <section
      className={`timer-stage timer-stage--${stageClass} timer-stage--mode-${mode} ${
        isFocusMode ? "timer-stage--focus" : ""
      }`}
      data-testid="timer-stage"
    >
      <div className="stage-header">
        <span className="stage-label">{stageLabel}</span>
        <span className="stage-status" data-testid="timer-status">
          {statusText}
        </span>
      </div>
      <div className="stage-main">
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
          {secondaryContent}
        </div>
        <div className="stage-metrics" aria-label="计时概览">
          <div className="stage-metric" data-testid="timer-elapsed">
            <strong>{primaryMetricValue}</strong>
            <span>{primaryMetricLabel}</span>
          </div>
          <div className="stage-metric" data-testid="timer-context">
            <strong>{secondaryMetricValue}</strong>
            <span>{secondaryMetricLabel}</span>
          </div>
        </div>
      </div>
      <div className="stage-footer">
        {controls ? <div className="stage-actions">{controls}</div> : null}
        {mode === "countdown" ? (
          <div className="progress-track" aria-hidden="true">
            <span className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
