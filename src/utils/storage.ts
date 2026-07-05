import type { ReminderNode, TimerSettings } from "../types";
import { DEFAULT_SETTINGS, normalizeSettings } from "./time";

const STORAGE_KEY = "TimerDisplay.settings.v1";
const LEGACY_DEFAULT_TITLE = "赛课倒计时";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseReminder(value: unknown): ReminderNode | null {
  if (!isObject(value)) {
    return null;
  }

  return {
    id: typeof value.id === "string" ? value.id : "",
    label: typeof value.label === "string" ? value.label : "",
    seconds: typeof value.seconds === "number" ? value.seconds : Number(value.seconds),
    enabled: Boolean(value.enabled),
  };
}

export function loadTimerSettings(): TimerSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return DEFAULT_SETTINGS;
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);
    if (!isObject(parsedValue)) {
      return DEFAULT_SETTINGS;
    }

    const reminders = Array.isArray(parsedValue.reminders)
      ? parsedValue.reminders.map(parseReminder).filter((reminder): reminder is ReminderNode => Boolean(reminder))
      : DEFAULT_SETTINGS.reminders;

    const storedTitle = typeof parsedValue.title === "string" ? parsedValue.title : DEFAULT_SETTINGS.title;

    return normalizeSettings({
      title: storedTitle === LEGACY_DEFAULT_TITLE ? DEFAULT_SETTINGS.title : storedTitle,
      totalSeconds:
        typeof parsedValue.totalSeconds === "number"
          ? parsedValue.totalSeconds
          : Number(parsedValue.totalSeconds),
      reminders,
      soundEnabled:
        typeof parsedValue.soundEnabled === "boolean"
          ? parsedValue.soundEnabled
          : DEFAULT_SETTINGS.soundEnabled,
      allowOvertime:
        typeof parsedValue.allowOvertime === "boolean"
          ? parsedValue.allowOvertime
          : DEFAULT_SETTINGS.allowOvertime,
      showCurrentTimeInFullscreen:
        typeof parsedValue.showCurrentTimeInFullscreen === "boolean"
          ? parsedValue.showCurrentTimeInFullscreen
          : DEFAULT_SETTINGS.showCurrentTimeInFullscreen,
      showFullscreenProgress:
        typeof parsedValue.showFullscreenProgress === "boolean"
          ? parsedValue.showFullscreenProgress
          : DEFAULT_SETTINGS.showFullscreenProgress,
    });
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveTimerSettings(settings: TimerSettings): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSettings(settings)));
}
