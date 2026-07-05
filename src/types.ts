export type TimerStatus = "idle" | "running" | "paused" | "finished";

export type TimerPhase = "normal" | "warning" | "danger" | "overtime" | "finished";

export type WakeLockStatus = "unsupported" | "available" | "requesting" | "active" | "released" | "blocked";

export interface ReminderNode {
  id: string;
  label: string;
  seconds: number;
  enabled: boolean;
}

export interface TimerSettings {
  title: string;
  totalSeconds: number;
  reminders: ReminderNode[];
  soundEnabled: boolean;
  allowOvertime: boolean;
  showCurrentTimeInFullscreen: boolean;
  showFullscreenProgress: boolean;
  preventDisplaySleep: boolean;
}

export interface TimerModePreset {
  id: string;
  label: string;
  title: string;
  totalSeconds: number;
  reminders: ReminderNode[];
  soundEnabled: boolean;
  allowOvertime: boolean;
  showCurrentTimeInFullscreen: boolean;
  showFullscreenProgress: boolean;
  preventDisplaySleep: boolean;
}
