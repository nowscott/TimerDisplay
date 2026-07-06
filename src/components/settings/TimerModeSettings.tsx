import type { TimerSettings as TimerSettingsType, TimerStatus } from "../../types";
import {
  createSettingsFromPreset,
  formatClock,
  formatReminderSummary,
  isSettingsFromPreset,
  TIMER_MODE_PRESETS,
} from "../../utils/time";

interface TimerModeSettingsProps {
  settings: TimerSettingsType;
  status: TimerStatus;
  onPresetApply: (settings: TimerSettingsType) => void;
}

export function TimerModeSettings({ settings, status, onPresetApply }: TimerModeSettingsProps) {
  const isTimingLocked = status === "running";

  return (
    <div className="mode-list" role="list" aria-label="场景模式">
      {TIMER_MODE_PRESETS.map((preset) => {
        const durationText = formatClock(preset.totalSeconds, preset.totalSeconds >= 3600);
        const isActive = isSettingsFromPreset(settings, preset);

        return (
          <button
            className={isActive ? "mode-card mode-card--active" : "mode-card"}
            type="button"
            key={preset.id}
            disabled={isTimingLocked}
            data-testid={`mode-preset-${preset.id}`}
            onClick={() => onPresetApply(createSettingsFromPreset(preset))}
          >
            <span className="mode-card-title">{preset.label}</span>
            <span className="mode-card-duration">{durationText}</span>
            <span className="mode-card-meta">
              {formatReminderSummary(preset.reminders)}
              <span aria-hidden="true"> · </span>
              {preset.allowOvertime ? "超时继续" : "到点停止"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
