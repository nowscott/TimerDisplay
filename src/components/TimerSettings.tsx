import { Bell, LayoutTemplate, Settings2, Type } from "lucide-react";
import type { ReminderNode, TimerSettings as TimerSettingsType, TimerStatus, WakeLockStatus } from "../types";
import { TIMER_MODE_PRESETS } from "../utils/time";
import { TimerBasicSettings } from "./settings/TimerBasicSettings";
import { TimerDisplayOptionsSettings } from "./settings/TimerDisplayOptionsSettings";
import { TimerModeSettings } from "./settings/TimerModeSettings";
import { TimerReminderSettings } from "./settings/TimerReminderSettings";

export { TimerBasicSettings } from "./settings/TimerBasicSettings";
export { TimerDisplayOptionsSettings } from "./settings/TimerDisplayOptionsSettings";
export { TimerModeSettings } from "./settings/TimerModeSettings";
export { TimerReminderSettings } from "./settings/TimerReminderSettings";

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

export function TimerSettings({
  settings,
  status,
  onTitleChange,
  onDurationChange,
  onPresetApply,
  onSoundEnabledChange,
  onAllowOvertimeChange,
  onShowMillisecondsChange,
  onShowCurrentTimeInFullscreenChange,
  onShowFullscreenProgressChange,
  wakeLockStatus,
  onPreventDisplaySleepChange,
  onWakeLockRequest,
  onReminderChange,
  onReminderAdd,
  onReminderRemove,
}: TimerSettingsProps) {
  const isTimingLocked = status === "running";

  return (
    <div className={`settings-panel ${isTimingLocked ? "settings-panel--muted" : ""}`}>
      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-group-title">
            <LayoutTemplate aria-hidden="true" size={18} />
            <h2>场景模式</h2>
          </div>
          <span className="settings-card-meta">{TIMER_MODE_PRESETS.length} 个预设</span>
        </div>
        <TimerModeSettings settings={settings} status={status} onPresetApply={onPresetApply} />
      </section>

      <section className="settings-card">
        <div className="settings-group-title">
          <Type aria-hidden="true" size={18} />
          <h2>基础</h2>
        </div>
        <TimerBasicSettings
          settings={settings}
          status={status}
          onTitleChange={onTitleChange}
          onDurationChange={onDurationChange}
        />
      </section>

      <section className="settings-card">
        <div className="settings-group-title">
          <Settings2 aria-hidden="true" size={18} />
          <h2>显示与计时</h2>
        </div>
        <TimerDisplayOptionsSettings
          settings={settings}
          wakeLockStatus={wakeLockStatus}
          onSoundEnabledChange={onSoundEnabledChange}
          onAllowOvertimeChange={onAllowOvertimeChange}
          onShowMillisecondsChange={onShowMillisecondsChange}
          onShowCurrentTimeInFullscreenChange={onShowCurrentTimeInFullscreenChange}
          onShowFullscreenProgressChange={onShowFullscreenProgressChange}
          onPreventDisplaySleepChange={onPreventDisplaySleepChange}
          onWakeLockRequest={onWakeLockRequest}
        />
      </section>

      <section className="settings-card">
        <div className="settings-group-title">
          <Bell aria-hidden="true" size={18} />
          <h2>提醒</h2>
        </div>
        <TimerReminderSettings
          settings={settings}
          status={status}
          onReminderChange={onReminderChange}
          onReminderAdd={onReminderAdd}
          onReminderRemove={onReminderRemove}
        />
      </section>
    </div>
  );
}
