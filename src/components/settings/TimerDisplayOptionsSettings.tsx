import { Monitor, MonitorCheck } from "lucide-react";
import type { TimerSettings as TimerSettingsType, WakeLockStatus } from "../../types";

interface TimerDisplayOptionsSettingsProps {
  settings: TimerSettingsType;
  wakeLockStatus: WakeLockStatus;
  onSoundEnabledChange: (enabled: boolean) => void;
  onAllowOvertimeChange: (enabled: boolean) => void;
  onShowMillisecondsChange: (enabled: boolean) => void;
  onShowCurrentTimeInFullscreenChange: (enabled: boolean) => void;
  onShowFullscreenProgressChange: (enabled: boolean) => void;
  onPreventDisplaySleepChange: (enabled: boolean) => void;
  onWakeLockRequest: () => void;
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

  if (status === "unsupported-insecure") {
    return "屏幕常亮需要 HTTPS 或 localhost";
  }

  if (status === "blocked-hidden") {
    return "标签页可见时才能启用常亮";
  }

  if (status === "blocked-permission") {
    return "屏幕常亮被浏览器或系统阻止";
  }

  if (status === "blocked") {
    return "屏幕常亮需要授权";
  }

  return "屏幕常亮待启用";
}

export function TimerDisplayOptionsSettings({
  settings,
  wakeLockStatus,
  onSoundEnabledChange,
  onAllowOvertimeChange,
  onShowMillisecondsChange,
  onShowCurrentTimeInFullscreenChange,
  onShowFullscreenProgressChange,
  onPreventDisplaySleepChange,
  onWakeLockRequest,
}: TimerDisplayOptionsSettingsProps) {
  const wakeLockStatusText = getWakeLockStatusText(wakeLockStatus, settings.preventDisplaySleep);
  const showWakeLockAction =
    settings.preventDisplaySleep &&
    wakeLockStatus !== "active" &&
    wakeLockStatus !== "unsupported" &&
    wakeLockStatus !== "unsupported-insecure";

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
          checked={settings.showMilliseconds}
          disabled={settings.mode === "clock"}
          data-testid="show-milliseconds"
          onChange={(event) => onShowMillisecondsChange(event.target.checked)}
        />
        <span>显示毫秒</span>
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
