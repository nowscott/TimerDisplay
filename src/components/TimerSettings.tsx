import { Clock3, LayoutTemplate, Monitor, Settings2, Type } from "lucide-react";
import type { ReminderNode, TimerSettings as TimerSettingsType, TimerStatus } from "../types";
import {
  createSettingsFromPreset,
  durationFromParts,
  formatClock,
  PRESET_SECONDS,
  splitDuration,
  TIMER_MODE_PRESETS,
} from "../utils/time";
import { ReminderConfig } from "./ReminderConfig";

interface TimerSettingsProps {
  settings: TimerSettingsType;
  status: TimerStatus;
  onTitleChange: (title: string) => void;
  onDurationChange: (seconds: number) => void;
  onPresetApply: (settings: TimerSettingsType) => void;
  onSoundEnabledChange: (enabled: boolean) => void;
  onAllowOvertimeChange: (enabled: boolean) => void;
  onShowCurrentTimeInFullscreenChange: (enabled: boolean) => void;
  onReminderChange: (id: string, reminder: ReminderNode) => void;
  onReminderAdd: (reminder: ReminderNode) => void;
  onReminderRemove: (id: string) => void;
}

function formatReminderSummary(reminders: ReminderNode[]): string {
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

function isPresetActive(settings: TimerSettingsType, presetSettings: TimerSettingsType): boolean {
  return (
    settings.title === presetSettings.title &&
    settings.totalSeconds === presetSettings.totalSeconds &&
    settings.soundEnabled === presetSettings.soundEnabled &&
    settings.allowOvertime === presetSettings.allowOvertime &&
    settings.showCurrentTimeInFullscreen === presetSettings.showCurrentTimeInFullscreen &&
    isSameReminderSet(settings.reminders, presetSettings.reminders)
  );
}

export function TimerSettings({
  settings,
  status,
  onTitleChange,
  onDurationChange,
  onPresetApply,
  onSoundEnabledChange,
  onAllowOvertimeChange,
  onShowCurrentTimeInFullscreenChange,
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
      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-group-title">
            <LayoutTemplate aria-hidden="true" size={18} />
            <h2>场景模式</h2>
          </div>
          <span className="settings-card-meta">{TIMER_MODE_PRESETS.length} 个预设</span>
        </div>
        <div className="mode-list" role="list" aria-label="场景模式">
          {TIMER_MODE_PRESETS.map((preset) => {
            const presetSettings = createSettingsFromPreset(preset);
            const durationText = formatClock(preset.totalSeconds, preset.totalSeconds >= 3600);
            const isActive = isPresetActive(settings, presetSettings);

            return (
              <button
                className={isActive ? "mode-card mode-card--active" : "mode-card"}
                type="button"
                key={preset.id}
                disabled={isTimingLocked}
                data-testid={`mode-preset-${preset.id}`}
                onClick={() => onPresetApply(presetSettings)}
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
      </section>

      <section className="settings-card">
        <div className="settings-group-title">
          <Type aria-hidden="true" size={18} />
          <h2>基础</h2>
        </div>
        <label className="field-label">
          <span>标题</span>
          <input
            className="text-input"
            value={settings.title}
            maxLength={24}
            data-testid="title-input"
            onChange={(event) => onTitleChange(event.target.value)}
            aria-label="显示标题"
          />
        </label>
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
        <div className="settings-subtitle">
          <Clock3 aria-hidden="true" size={16} />
          <span>快捷时长</span>
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

      <section className="settings-card">
        <div className="settings-group-title">
          <Settings2 aria-hidden="true" size={18} />
          <h2>显示与计时</h2>
        </div>
        <div className="toggle-grid">
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
          <label className="switch-label">
            <input
              type="checkbox"
              checked={settings.showCurrentTimeInFullscreen}
              data-testid="show-current-time-fullscreen"
              onChange={(event) => onShowCurrentTimeInFullscreenChange(event.target.checked)}
            />
            <Monitor aria-hidden="true" size={17} />
            <span>全屏显示真实时间</span>
          </label>
        </div>
      </section>

      <ReminderConfig
        reminders={settings.reminders}
        totalSeconds={settings.totalSeconds}
        disabled={isTimingLocked}
        onChange={onReminderChange}
        onAdd={onReminderAdd}
        onRemove={onReminderRemove}
      />
    </aside>
  );
}
