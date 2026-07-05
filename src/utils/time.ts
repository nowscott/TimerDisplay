import type { ReminderNode, TimerModePreset, TimerSettings } from "../types";

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
  title: "现场计时",
  totalSeconds: 15 * 60,
  reminders: DEFAULT_REMINDERS,
  soundEnabled: true,
  allowOvertime: true,
  showCurrentTimeInFullscreen: true,
  showFullscreenProgress: true,
  preventDisplaySleep: true,
};

export const TIMER_MODE_PRESETS: TimerModePreset[] = [
  {
    id: "speech",
    label: "演讲模式",
    title: "演讲计时",
    totalSeconds: 10 * 60,
    reminders: [
      { id: "speech-3-minutes", label: "剩余3分钟", seconds: 3 * 60, enabled: true },
      { id: "speech-1-minute", label: "剩余1分钟", seconds: 60, enabled: true },
    ],
    soundEnabled: true,
    allowOvertime: true,
    showCurrentTimeInFullscreen: true,
    showFullscreenProgress: true,
    preventDisplaySleep: true,
  },
  {
    id: "classroom",
    label: "课堂展示",
    title: "课堂展示计时",
    totalSeconds: 15 * 60,
    reminders: [
      { id: "classroom-5-minutes", label: "剩余5分钟", seconds: 5 * 60, enabled: true },
      { id: "classroom-1-minute", label: "剩余1分钟", seconds: 60, enabled: true },
    ],
    soundEnabled: true,
    allowOvertime: true,
    showCurrentTimeInFullscreen: true,
    showFullscreenProgress: true,
    preventDisplaySleep: true,
  },
  {
    id: "defense",
    label: "答辩模式",
    title: "答辩计时",
    totalSeconds: 8 * 60,
    reminders: [
      { id: "defense-2-minutes", label: "剩余2分钟", seconds: 2 * 60, enabled: true },
      { id: "defense-30-seconds", label: "剩余30秒", seconds: 30, enabled: true },
    ],
    soundEnabled: true,
    allowOvertime: true,
    showCurrentTimeInFullscreen: true,
    showFullscreenProgress: true,
    preventDisplaySleep: true,
  },
  {
    id: "meeting",
    label: "会议发言",
    title: "会议发言计时",
    totalSeconds: 5 * 60,
    reminders: [
      { id: "meeting-1-minute", label: "剩余1分钟", seconds: 60, enabled: true },
      { id: "meeting-30-seconds", label: "剩余30秒", seconds: 30, enabled: true },
    ],
    soundEnabled: true,
    allowOvertime: false,
    showCurrentTimeInFullscreen: true,
    showFullscreenProgress: true,
    preventDisplaySleep: true,
  },
  {
    id: "free",
    label: "自由计时",
    title: "现场计时",
    totalSeconds: 15 * 60,
    reminders: DEFAULT_REMINDERS,
    soundEnabled: true,
    allowOvertime: true,
    showCurrentTimeInFullscreen: true,
    showFullscreenProgress: true,
    preventDisplaySleep: true,
  },
];

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

  return Math.min(MAX_DURATION_SECONDS, Math.max(0, Math.round(seconds)));
}

export function createReminderNode(seconds = 30, label = "自定义提醒"): ReminderNode {
  const normalizedSeconds = clampReminderSeconds(seconds);
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `reminder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    label,
    seconds: normalizedSeconds,
    enabled: normalizedSeconds > 0,
  };
}

export function cloneReminderNode(reminder: ReminderNode): ReminderNode {
  return {
    ...reminder,
  };
}

export function createSettingsFromPreset(preset: TimerModePreset): TimerSettings {
  return normalizeSettings({
    title: preset.title,
    totalSeconds: preset.totalSeconds,
    reminders: preset.reminders.map(cloneReminderNode),
    soundEnabled: preset.soundEnabled,
    allowOvertime: preset.allowOvertime,
    showCurrentTimeInFullscreen: preset.showCurrentTimeInFullscreen,
    showFullscreenProgress: preset.showFullscreenProgress,
    preventDisplaySleep: preset.preventDisplaySleep,
  });
}

export function formatReminderSummary(reminders: ReminderNode[]): string {
  const enabledReminders = reminders.filter((reminder) => reminder.enabled && reminder.seconds > 0);

  if (enabledReminders.length === 0) {
    return "无提醒";
  }

  return enabledReminders.map((reminder) => reminder.label).join(" / ");
}

function isSameReminderSet(firstReminders: ReminderNode[], secondReminders: ReminderNode[]): boolean {
  if (firstReminders.length !== secondReminders.length) {
    return false;
  }

  return firstReminders.every((firstReminder, index) => {
    const secondReminder = secondReminders[index];
    return (
      firstReminder.label === secondReminder.label &&
      firstReminder.seconds === secondReminder.seconds &&
      firstReminder.enabled === secondReminder.enabled
    );
  });
}

export function isSettingsFromPreset(settings: TimerSettings, preset: TimerModePreset): boolean {
  const presetSettings = createSettingsFromPreset(preset);

  return (
    settings.title === presetSettings.title &&
    settings.totalSeconds === presetSettings.totalSeconds &&
    settings.soundEnabled === presetSettings.soundEnabled &&
    settings.allowOvertime === presetSettings.allowOvertime &&
    settings.showCurrentTimeInFullscreen === presetSettings.showCurrentTimeInFullscreen &&
    settings.showFullscreenProgress === presetSettings.showFullscreenProgress &&
    isSameReminderSet(settings.reminders, presetSettings.reminders)
  );
}

export function getMatchingTimerModePreset(settings: TimerSettings): TimerModePreset | null {
  return TIMER_MODE_PRESETS.find((preset) => isSettingsFromPreset(settings, preset)) ?? null;
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
  const seconds = clampReminderSeconds(reminder.seconds);

  return {
    id: reminder.id || fallback.id,
    label: reminder.label.trim() || fallback.label,
    seconds,
    enabled: Boolean(reminder.enabled) && seconds > 0,
  };
}

export function normalizeSettings(settings: TimerSettings): TimerSettings {
  return {
    title: settings.title.trim() || DEFAULT_SETTINGS.title,
    totalSeconds: clampDuration(settings.totalSeconds),
    reminders: settings.reminders.map((reminder, index) => normalizeReminderNode(reminder, index)),
    soundEnabled: Boolean(settings.soundEnabled),
    allowOvertime: Boolean(settings.allowOvertime),
    showCurrentTimeInFullscreen: Boolean(settings.showCurrentTimeInFullscreen),
    showFullscreenProgress: Boolean(settings.showFullscreenProgress),
    preventDisplaySleep: Boolean(settings.preventDisplaySleep),
  };
}
