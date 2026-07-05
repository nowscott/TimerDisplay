import { useState, type ReactNode } from "react";
import { Bell, Clock3, LayoutTemplate, Maximize2, MonitorCheck, Settings2, Type, X } from "lucide-react";
import type { TimerSettingsProps } from "./TimerSettings";
import {
  TimerBasicSettings,
  TimerDisplayOptionsSettings,
  TimerModeSettings,
  TimerReminderSettings,
} from "./TimerSettings";
import { formatClock, formatReminderSummary, getMatchingTimerModePreset } from "../utils/time";

type ConfigSectionKey = "mode" | "basic" | "display" | "reminders";

interface ConfigDockButtonProps {
  id: ConfigSectionKey;
  title: string;
  summary: string;
  icon: ReactNode;
  isActive: boolean;
  disabled?: boolean;
  onToggle: (section: ConfigSectionKey) => void;
}

function ConfigDockButton({
  id,
  title,
  summary,
  icon,
  isActive,
  disabled = false,
  onToggle,
}: ConfigDockButtonProps) {
  return (
    <button
      className={isActive ? "config-dock-button config-dock-button--active" : "config-dock-button"}
      type="button"
      disabled={disabled}
      aria-expanded={isActive}
      aria-controls={`config-popover-${id}`}
      data-testid={`config-dock-${id}`}
      onClick={() => onToggle(id)}
    >
      <span className="config-dock-button__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="config-dock-button__text">
        <span>{title}</span>
        <small>{summary}</small>
      </span>
    </button>
  );
}

export function ProjectionChecklist({
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
  const [activeSection, setActiveSection] = useState<ConfigSectionKey | null>(null);
  const matchingPreset = getMatchingTimerModePreset(settings);
  const totalText = formatClock(settings.totalSeconds, settings.totalSeconds >= 3600);
  const reminderText = settings.mode === "countdown" ? formatReminderSummary(settings.reminders) : "仅倒计时";
  const displaySummary = [
    settings.showFullscreenProgress && settings.mode === "countdown" ? "进度大屏" : "数字大屏",
    settings.showCurrentTimeInFullscreen ? "角标时钟" : "隐藏时钟",
    settings.preventDisplaySleep ? "常亮" : "可息屏",
  ].join(" / ");
  const modeSummary =
    settings.mode === "countdown" ? matchingPreset?.label ?? "自定义" : settings.mode === "countup" ? "从零累计" : "实时时钟";
  const basicSummary =
    settings.mode === "clock" ? settings.title || "现场计时" : `${settings.title || "现场计时"} / ${totalText}`;
  const activeTitle =
    activeSection === "mode"
      ? "倒计时场景"
      : activeSection === "basic"
        ? "基础配置"
        : activeSection === "display"
          ? "显示与投屏"
          : activeSection === "reminders"
            ? "提醒节点"
            : "";

  function toggleSection(section: ConfigSectionKey): void {
    setActiveSection((currentSection) => (currentSection === section ? null : section));
  }

  return (
    <aside className="config-dock-shell" aria-label="底部配置栏">
      {activeSection ? (
        <section className="config-popover" id={`config-popover-${activeSection}`} aria-label={activeTitle}>
          <div className="config-popover__header">
            <div>
              <span className="config-popover__eyebrow">当前配置</span>
              <h2>{activeTitle}</h2>
            </div>
            <button
              className="icon-button config-popover__close"
              type="button"
              aria-label="关闭配置浮窗"
              data-testid="config-popover-close"
              onClick={() => setActiveSection(null)}
            >
              <X aria-hidden="true" size={18} />
            </button>
          </div>

          <div className="config-popover__body">
            {activeSection === "mode" ? (
              settings.mode === "countdown" ? (
                <TimerModeSettings settings={settings} status={status} onPresetApply={onPresetApply} />
              ) : (
                <p className="empty-text">场景预设只影响倒计时模式。顶部切回倒计时后可继续使用演讲、课堂和会议预设。</p>
              )
            ) : null}
            {activeSection === "basic" ? (
              <TimerBasicSettings
                settings={settings}
                status={status}
                onTitleChange={onTitleChange}
                onDurationChange={onDurationChange}
              />
            ) : null}
            {activeSection === "display" ? (
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
            ) : null}
            {activeSection === "reminders" ? (
              settings.mode === "countdown" ? (
                <TimerReminderSettings
                  settings={settings}
                  status={status}
                  onReminderChange={onReminderChange}
                  onReminderAdd={onReminderAdd}
                  onReminderRemove={onReminderRemove}
                />
              ) : (
                <p className="empty-text">提醒节点只用于倒计时模式，正计时和时钟模式不会播放节点提醒。</p>
              )
            ) : null}
          </div>
        </section>
      ) : null}

      <div className="config-dock" role="toolbar" aria-label="配置入口">
        <ConfigDockButton
          id="mode"
          title="场景"
          summary={modeSummary}
          icon={<LayoutTemplate size={18} />}
          isActive={activeSection === "mode"}
          onToggle={toggleSection}
        />
        <ConfigDockButton
          id="basic"
          title="基础"
          summary={basicSummary}
          icon={<Type size={18} />}
          isActive={activeSection === "basic"}
          onToggle={toggleSection}
        />
        <ConfigDockButton
          id="display"
          title="显示"
          summary={displaySummary}
          icon={<Maximize2 size={18} />}
          isActive={activeSection === "display"}
          onToggle={toggleSection}
        />
        <ConfigDockButton
          id="reminders"
          title="提醒"
          summary={reminderText}
          icon={<Bell size={18} />}
          isActive={activeSection === "reminders"}
          disabled={settings.mode !== "countdown"}
          onToggle={toggleSection}
        />
        <div className="config-dock-status" aria-live="polite">
          <MonitorCheck aria-hidden="true" size={16} />
          <span>{status === "running" ? "运行中" : settings.preventDisplaySleep ? "常亮优先" : "常亮关闭"}</span>
        </div>
        <div className="config-dock-status config-dock-status--clock">
          <Clock3 aria-hidden="true" size={16} />
          <span>{settings.showCurrentTimeInFullscreen ? "大屏角标" : "无角标"}</span>
        </div>
      </div>
    </aside>
  );
}
