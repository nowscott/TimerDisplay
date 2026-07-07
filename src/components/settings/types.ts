import type { ReminderNode, TimerSettings as TimerSettingsType, TimerStatus, WakeLockStatus } from "../../types";

export interface TimerSettingsProps {
  settings: TimerSettingsType;
  status: TimerStatus;
  onTitleChange: (title: string) => void;
  onDurationChange: (seconds: number) => void;
  onPresetApply: (settings: TimerSettingsType) => void;
  onSoundEnabledChange: (enabled: boolean) => void;
  onAllowOvertimeChange: (enabled: boolean) => void;
  onShowMillisecondsChange: (enabled: boolean) => void;
  onShowCurrentTimeInFullscreenChange: (enabled: boolean) => void;
  onShowFullscreenProgressChange: (enabled: boolean) => void;
  wakeLockStatus: WakeLockStatus;
  onPreventDisplaySleepChange: (enabled: boolean) => void;
  onWakeLockRequest: () => void;
  onReminderChange: (id: string, reminder: ReminderNode) => void;
  onReminderAdd: (reminder: ReminderNode) => void;
  onReminderRemove: (id: string) => void;
}
