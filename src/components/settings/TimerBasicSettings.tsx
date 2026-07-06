import { Clock3 } from "lucide-react";
import type { TimerSettings as TimerSettingsType, TimerStatus } from "../../types";
import { durationFromParts, PRESET_SECONDS, splitDuration } from "../../utils/time";

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
    <div className={`basic-settings ${settings.mode === "clock" ? "basic-settings--clock" : ""}`}>
      <label className="field-label basic-settings__title">
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
        <div className="basic-settings__duration">
          <div className="settings-subtitle basic-settings__duration-title">
            <span>
              <Clock3 aria-hidden="true" size={16} />
              时长
            </span>
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
          <div className="basic-settings__presets">
            <div className="settings-subtitle basic-settings__preset-title">{durationTitle}</div>
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
          </div>
        </div>
      )}
    </div>
  );
}
