import type { ReminderNode, TimerMode, TimerModePreset, TimerSettings } from "../types";

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

export const MODE_DEFAULT_TITLES: Record<TimerMode, string> = {
  countdown: "现场计时",
  countup: "正计时",
  clock: "现场时钟",
};

export const DEFAULT_SETTINGS: TimerSettings = {
  mode: "countdown",
  title: MODE_DEFAULT_TITLES.countdown,
  totalSeconds: 15 * 60,
  reminders: DEFAULT_REMINDERS,
  soundEnabled: true,
  allowOvertime: true,
  showMilliseconds: false,
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
    showMilliseconds: false,
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
    showMilliseconds: false,
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
    showMilliseconds: false,
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
    showMilliseconds: false,
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
    showMilliseconds: false,
    showCurrentTimeInFullscreen: true,
    showFullscreenProgress: true,
    preventDisplaySleep: true,
  },
];
