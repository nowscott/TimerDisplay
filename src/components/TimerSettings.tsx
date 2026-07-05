import { Bell, Clock3, LayoutTemplate, Monitor, MonitorCheck, Settings2, Type } from "lucide-react";
import type { ReminderNode, TimerSettings as TimerSettingsType, TimerStatus, WakeLockStatus } from "../types";
import {
  createSettingsFromPreset,
  durationFromParts,
  formatClock,
  formatReminderSummary,
  isSettingsFromPreset,
  PRESET_SECONDS,
  splitDuration,
  TIMER_MODE_PRESETS,
} from "../utils/time";
import { ReminderConfig } from "./ReminderConfig";

export interface TimerSettingsProps {
  settings: TimerSettingsType;
  status: TimerStatus;
  onTitleChange: (title: string) => void;
  onDurationChange: (seconds: number) => void;
  onPresetApply: (settings: TimerSettingsType) => void;
  onSoundEnabledChange: (enabled: boolean) => void;
  onAllowOvertimeChange: (enabled: boolean) => void;
  onShowCurrentTimeInFullscreenChange: (enabled: boolean) => void;
  onShowFullscreenProgressChange: (enabled: boolean) => void;
  wakeLockStatus: WakeLockStatus;
  onPreventDisplaySleepChange: (enabled: boolean) => void;
  onWakeLockRequest: () => void;
  onReminderChange: (id: string, reminder: ReminderNode) => void;
  onReminderAdd: (reminder: ReminderNode) => void;
  onReminderRemove: (id: string) => void;
}

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

interface TimerBasicSettingsProps {
  settings: TimerSettingsType;
  status: TimerStatus;
  onTitleChange: (title: string) => void;
  onDurationChange: (seconds: number) => void;
}

export function TimerBasicSettings({
  settings,
  status,
  onTitleChange,
  onDurationChange,
}: TimerBasicSettingsProps) {
  const durationParts = splitDuration(settings.totalSeconds);
  const isTimingLocked = status === "running";
  const activePreset = PRESET_SECONDS.find((preset) => preset.seconds === settings.totalSeconds);
  const durationTitle = settings.mode === "countup" ? "参考时长" : "快捷时长";

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
    <>
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
      {settings.mode === "clock" ? (
        <p className="empty-text">时钟模式不使用时长；标题会显示在普通和全屏时钟上。</p>
      ) : (
        <>
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
            <span>{durationTitle}</span>
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
        </>
      )}
    </>
  );
}

interface TimerDisplayOptionsSettingsProps {
  settings: TimerSettingsType;
  wakeLockStatus: WakeLockStatus;
  onSoundEnabledChange: (enabled: boolean) => void;
  onAllowOvertimeChange: (enabled: boolean) => void;
  onShowCurrentTimeInFullscreenChange: (enabled: boolean) => void;
  onShowFullscreenProgressChange: (enabled: boolean) => void;
  onPreventDisplaySleepChange: (enabled: boolean) => void;
  onWakeLockRequest: () => void;
}

export function TimerDisplayOptionsSettings({
  settings,
  wakeLockStatus,
  onSoundEnabledChange,
  onAllowOvertimeChange,
  onShowCurrentTimeInFullscreenChange,
  onShowFullscreenProgressChange,
  onPreventDisplaySleepChange,
  onWakeLockRequest,
}: TimerDisplayOptionsSettingsProps) {
  const wakeLockStatusText = getWakeLockStatusText(wakeLockStatus, settings.preventDisplaySleep);
  const showWakeLockAction =
    settings.preventDisplaySleep && wakeLockStatus !== "active" && wakeLockStatus !== "unsupported";

  return (
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
          disabled={settings.mode !== "countdown"}
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
      <label className="switch-label">
        <input
          type="checkbox"
          checked={settings.showFullscreenProgress}
          disabled={settings.mode !== "countdown"}
          data-testid="show-fullscreen-progress"
          onChange={(event) => onShowFullscreenProgressChange(event.target.checked)}
        />
        <span>全屏显示进度条</span>
      </label>
      <label className="switch-label">
        <input
          type="checkbox"
          checked={settings.preventDisplaySleep}
          data-testid="prevent-display-sleep"
          onChange={(event) => onPreventDisplaySleepChange(event.target.checked)}
        />
        <MonitorCheck aria-hidden="true" size={17} />
        <span>保持屏幕常亮</span>
      </label>
      <div className={`wake-lock-status wake-lock-status--${wakeLockStatus}`} data-testid="wake-lock-status">
        <span aria-live="polite">{wakeLockStatusText}</span>
        {showWakeLockAction ? (
          <button
            className="wake-lock-action"
            type="button"
            disabled={wakeLockStatus === "requesting"}
            data-testid="request-wake-lock"
            onClick={onWakeLockRequest}
          >
            {wakeLockStatus === "requesting" ? "启用中" : "启用常亮"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function getWakeLockStatusText(status: WakeLockStatus, enabled: boolean): string {
  if (!enabled) {
    return "屏幕常亮已关闭";
  }

  if (status === "active") {
    return "屏幕常亮已启用";
  }

  if (status === "requesting") {
    return "正在启用屏幕常亮";
  }

  if (status === "unsupported") {
    return "当前浏览器不支持屏幕常亮";
  }

  if (status === "blocked") {
    return "屏幕常亮需要授权";
  }

  return "屏幕常亮待启用";
}

interface TimerReminderSettingsProps {
  settings: TimerSettingsType;
  status: TimerStatus;
  onReminderChange: (id: string, reminder: ReminderNode) => void;
  onReminderAdd: (reminder: ReminderNode) => void;
  onReminderRemove: (id: string) => void;
}

export function TimerReminderSettings({
  settings,
  status,
  onReminderChange,
  onReminderAdd,
  onReminderRemove,
}: TimerReminderSettingsProps) {
  return (
    <ReminderConfig
      reminders={settings.reminders}
      totalSeconds={settings.totalSeconds}
      disabled={status === "running"}
      asCard={false}
      showTitle={false}
      onChange={onReminderChange}
      onAdd={onReminderAdd}
      onRemove={onReminderRemove}
    />
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
