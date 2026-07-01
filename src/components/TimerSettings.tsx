import { Clock3, Settings2, Type } from "lucide-react";
import type { ReminderNode, TimerSettings as TimerSettingsType, TimerStatus } from "../types";
import { durationFromParts, PRESET_SECONDS, splitDuration } from "../utils/time";
import { ReminderConfig } from "./ReminderConfig";

interface TimerSettingsProps {
  settings: TimerSettingsType;
  status: TimerStatus;
  onTitleChange: (title: string) => void;
  onDurationChange: (seconds: number) => void;
  onSoundEnabledChange: (enabled: boolean) => void;
  onAllowOvertimeChange: (enabled: boolean) => void;
  onReminderChange: (id: string, reminder: ReminderNode) => void;
  onReminderAdd: (reminder: ReminderNode) => void;
  onReminderRemove: (id: string) => void;
}

export function TimerSettings({
  settings,
  status,
  onTitleChange,
  onDurationChange,
  onSoundEnabledChange,
  onAllowOvertimeChange,
  onReminderChange,
  onReminderAdd,
  onReminderRemove,
}: TimerSettingsProps) {
  const durationParts = splitDuration(settings.totalSeconds);
  const isTimingLocked = status === "running";
  const activePreset = PRESET_SECONDS.find((preset) => preset.seconds === settings.totalSeconds);

  function updateDurationPart(part: "hours" | "minutes" | "seconds", value: number): void {
    onDurationChange(
      durationFromParts(
        part === "hours" ? value : durationParts.hours,
        part === "minutes" ? value : durationParts.minutes,
        part === "seconds" ? value : durationParts.seconds
      )
    );
  }

  return (
    <aside className={`settings-panel ${isTimingLocked ? "settings-panel--muted" : ""}`}>
      <section className="settings-group">
        <div className="settings-group-title">
          <Type aria-hidden="true" size={18} />
          <h2>显示标题</h2>
        </div>
        <input
          className="text-input"
          value={settings.title}
          maxLength={24}
          data-testid="title-input"
          onChange={(event) => onTitleChange(event.target.value)}
          aria-label="显示标题"
        />
      </section>

      <section className="settings-group">
        <div className="settings-group-title">
          <Clock3 aria-hidden="true" size={18} />
          <h2>总时长</h2>
        </div>
        <div className="duration-grid">
          <label className="number-field">
            <span>时</span>
            <input
              type="number"
              min={0}
              max={23}
              value={durationParts.hours}
              disabled={isTimingLocked}
              data-testid="duration-hours"
              onChange={(event) => updateDurationPart("hours", Number(event.target.value))}
            />
          </label>
          <label className="number-field">
            <span>分</span>
            <input
              type="number"
              min={0}
              max={59}
              value={durationParts.minutes}
              disabled={isTimingLocked}
              data-testid="duration-minutes"
              onChange={(event) => updateDurationPart("minutes", Number(event.target.value))}
            />
          </label>
          <label className="number-field">
            <span>秒</span>
            <input
              type="number"
              min={0}
              max={59}
              value={durationParts.seconds}
              disabled={isTimingLocked}
              data-testid="duration-seconds"
              onChange={(event) => updateDurationPart("seconds", Number(event.target.value))}
            />
          </label>
        </div>
        <div className="preset-grid" role="list" aria-label="常用预设">
          {PRESET_SECONDS.map((preset) => (
            <button
              className={activePreset?.seconds === preset.seconds ? "preset-button preset-button--active" : "preset-button"}
              type="button"
              key={preset.seconds}
              disabled={isTimingLocked}
              data-testid={`preset-${preset.seconds}`}
              onClick={() => onDurationChange(preset.seconds)}
            >
              {preset.label}
            </button>
          ))}
          <button className={!activePreset ? "preset-button preset-button--active" : "preset-button"} type="button" disabled>
            自定义
          </button>
        </div>
      </section>

      <section className="settings-group">
        <div className="settings-group-title">
          <Settings2 aria-hidden="true" size={18} />
          <h2>计时选项</h2>
        </div>
        <div className="toggle-stack">
          <label className="switch-label">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              data-testid="sound-enabled"
              onChange={(event) => onSoundEnabledChange(event.target.checked)}
            />
            <span>开启提示音</span>
          </label>
          <label className="switch-label">
            <input
              type="checkbox"
              checked={settings.allowOvertime}
              data-testid="allow-overtime"
              onChange={(event) => onAllowOvertimeChange(event.target.checked)}
            />
            <span>超时后继续计时</span>
          </label>
        </div>
      </section>

      <ReminderConfig
        reminders={settings.reminders}
        disabled={isTimingLocked}
        onChange={onReminderChange}
        onAdd={onReminderAdd}
        onRemove={onReminderRemove}
      />
    </aside>
  );
}
