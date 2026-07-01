import type { ReminderNode, TimerSettings } from "../types";

export const MIN_DURATION_SECONDS = 1;
export const MAX_DURATION_SECONDS = 23 * 60 * 60 + 59 * 60 + 59;

export const PRESET_SECONDS = [
  { label: "5分钟", seconds: 5 * 60 },
  { label: "10分钟", seconds: 10 * 60 },
  { label: "15分钟", seconds: 15 * 60 },
  { label: "20分钟", seconds: 20 * 60 },
  { label: "30分钟", seconds: 30 * 60 },
] as const;

export const DEFAULT_REMINDERS: ReminderNode[] = [
  { id: "reminder-3-minutes", label: "剩余3分钟", seconds: 3 * 60, enabled: true },
  { id: "reminder-1-minute", label: "剩余1分钟", seconds: 60, enabled: true },
];

export const DEFAULT_SETTINGS: TimerSettings = {
  title: "赛课倒计时",
  totalSeconds: 15 * 60,
  reminders: DEFAULT_REMINDERS,
  soundEnabled: true,
  allowOvertime: true,
};

export function clampDuration(seconds: number): number {
  if (!Number.isFinite(seconds)) {
    return DEFAULT_SETTINGS.totalSeconds;
  }

  return Math.min(MAX_DURATION_SECONDS, Math.max(MIN_DURATION_SECONDS, Math.round(seconds)));
}

export function clampReminderSeconds(seconds: number): number {
  if (!Number.isFinite(seconds)) {
    return 60;
  }

  return Math.min(MAX_DURATION_SECONDS, Math.max(MIN_DURATION_SECONDS, Math.round(seconds)));
}

export function createReminderNode(seconds = 30, label = "自定义提醒"): ReminderNode {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `reminder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    label,
    seconds: clampReminderSeconds(seconds),
    enabled: true,
  };
}

export function splitDuration(totalSeconds: number): { hours: number; minutes: number; seconds: number } {
  const normalizedSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(normalizedSeconds / 3600);
  const minutes = Math.floor((normalizedSeconds % 3600) / 60);
  const seconds = normalizedSeconds % 60;

  return { hours, minutes, seconds };
}

export function durationFromParts(hours: number, minutes: number, seconds: number): number {
  const safeHours = Math.min(23, Math.max(0, Math.round(hours) || 0));
  const safeMinutes = Math.min(59, Math.max(0, Math.round(minutes) || 0));
  const safeSeconds = Math.min(59, Math.max(0, Math.round(seconds) || 0));

  return clampDuration(safeHours * 3600 + safeMinutes * 60 + safeSeconds);
}

export function formatClock(totalSeconds: number, forceHours = false): string {
  const absoluteSeconds = Math.max(0, Math.floor(Math.abs(totalSeconds)));
  const { hours, minutes, seconds } = splitDuration(absoluteSeconds);
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");

  if (forceHours || hours > 0) {
    return `${String(hours).padStart(2, "0")}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${paddedMinutes}:${paddedSeconds}`;
}

export function secondsToMinuteSecond(totalSeconds: number): { minutes: number; seconds: number } {
  const normalizedSeconds = Math.max(0, Math.floor(totalSeconds));

  return {
    minutes: Math.floor(normalizedSeconds / 60),
    seconds: normalizedSeconds % 60,
  };
}

export function minuteSecondToSeconds(minutes: number, seconds: number): number {
  const safeMinutes = Math.max(0, Math.round(minutes) || 0);
  const safeSeconds = Math.min(59, Math.max(0, Math.round(seconds) || 0));

  return clampReminderSeconds(safeMinutes * 60 + safeSeconds);
}

export function normalizeReminderNode(reminder: ReminderNode, index = 0): ReminderNode {
  const fallback = DEFAULT_REMINDERS[index] ?? createReminderNode();

  return {
    id: reminder.id || fallback.id,
    label: reminder.label.trim() || fallback.label,
    seconds: clampReminderSeconds(reminder.seconds),
    enabled: Boolean(reminder.enabled),
  };
}

export function normalizeSettings(settings: TimerSettings): TimerSettings {
  return {
    title: settings.title.trim() || DEFAULT_SETTINGS.title,
    totalSeconds: clampDuration(settings.totalSeconds),
    reminders: settings.reminders.map((reminder, index) => normalizeReminderNode(reminder, index)),
    soundEnabled: Boolean(settings.soundEnabled),
    allowOvertime: Boolean(settings.allowOvertime),
  };
}
