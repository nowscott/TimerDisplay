import type { TimerMode, TimerPhase, TimerSettings, TimerStatus } from "../types";
import { formatClock } from "./time";

export function getTimerPhase(settings: TimerSettings, remainingSeconds: number, status: TimerStatus): TimerPhase {
  if (settings.mode !== "countdown") {
    return "normal";
  }

  if (status === "finished") {
    return "finished";
  }

  if (remainingSeconds <= 0) {
    return "overtime";
  }

  const enabledThresholds = settings.reminders
    .filter((reminder) => reminder.enabled && reminder.seconds < settings.totalSeconds)
    .map((reminder) => reminder.seconds)
    .sort((first, second) => first - second);

  if (enabledThresholds.length === 0) {
    return "normal";
  }

  const dangerThreshold = enabledThresholds.find((seconds) => seconds <= 60) ?? enabledThresholds[0];
  const warningThreshold = enabledThresholds[enabledThresholds.length - 1];

  if (remainingSeconds <= dangerThreshold) {
    return "danger";
  }

  if (remainingSeconds <= warningThreshold) {
    return "warning";
  }

  return "normal";
}

export function getStatusText(mode: TimerMode, status: TimerStatus, phase: TimerPhase): string {
  if (mode === "clock") {
    return "实时时钟";
  }

  if (mode === "countup") {
    if (status === "idle") {
      return "准备正计时";
    }

    if (status === "paused") {
      return "已暂停";
    }

    return "正计时中";
  }

  if (status === "idle") {
    return "准备就绪";
  }

  if (status === "paused") {
    return "已暂停";
  }

  if (status === "finished") {
    return "时间到";
  }

  if (phase === "overtime") {
    return "已超时";
  }

  if (phase === "danger") {
    return "最后阶段";
  }

  if (phase === "warning") {
    return "提醒阶段";
  }

  return "计时中";
}

export function getSecondaryText(
  mode: TimerMode,
  status: TimerStatus,
  remainingSeconds: number,
  elapsedSeconds: number,
  totalSeconds: number
): string {
  if (mode === "clock") {
    return "适合课间、会议间歇和投屏待机";
  }

  if (mode === "countup") {
    const elapsedText = formatClock(elapsedSeconds, elapsedSeconds >= 3600);

    if (status === "idle") {
      return "从 00:00 开始累计";
    }

    if (status === "paused") {
      return `暂停在 ${elapsedText}`;
    }

    return `已累计 ${elapsedText}`;
  }

  const forceHours = totalSeconds >= 3600 || Math.abs(remainingSeconds) >= 3600;

  if (remainingSeconds < 0) {
    return `已超时 +${formatClock(Math.abs(remainingSeconds), forceHours)}`;
  }

  if (status === "idle") {
    return `总时长 ${formatClock(totalSeconds, forceHours)}`;
  }

  if (status === "paused") {
    return `暂停在 ${formatClock(remainingSeconds, forceHours)}`;
  }

  if (status === "finished") {
    return `时间到，用时 ${formatClock(totalSeconds, forceHours)}`;
  }

  return `距离结束 ${formatClock(remainingSeconds, forceHours)}`;
}
