import { useState, type ReactNode } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Clock3,
  LayoutTemplate,
  Monitor,
  MonitorCheck,
  Settings2,
  Type,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { TimerSettingsProps } from "./TimerSettings";
import {
  TimerBasicSettings,
  TimerDisplayOptionsSettings,
  TimerModeSettings,
  TimerReminderSettings,
} from "./TimerSettings";
import { formatClock, formatReminderSummary, getMatchingTimerModePreset } from "../utils/time";

type SidebarSectionKey = "mode" | "basic" | "display" | "reminders";

interface SidebarSectionProps {
  id: SidebarSectionKey;
  title: string;
  summary: string;
  icon: ReactNode;
  isActive: boolean;
  onToggle: (section: SidebarSectionKey) => void;
  children: ReactNode;
}

function SidebarSection({ id, title, summary, icon, isActive, onToggle, children }: SidebarSectionProps) {
  const bodyId = `sidebar-section-${id}-body`;

  return (
    <section
      className={isActive ? "sidebar-section sidebar-section--active" : "sidebar-section"}
      data-testid={`sidebar-section-${id}`}
    >
      <button
        className="sidebar-section-toggle"
        type="button"
        aria-expanded={isActive}
        aria-controls={bodyId}
        data-testid={`sidebar-section-toggle-${id}`}
        onClick={() => onToggle(id)}
      >
        <span className="sidebar-section-label">
          <span className="sidebar-section-icon" aria-hidden="true">
            {icon}
          </span>
          <span>{title}</span>
        </span>
        <span className="sidebar-section-side">
          <span className="sidebar-section-summary">{summary}</span>
          {isActive ? <ChevronDown aria-hidden="true" size={16} /> : <ChevronRight aria-hidden="true" size={16} />}
        </span>
      </button>
      {isActive ? (
        <div className="sidebar-section-body" id={bodyId}>
          {children}
        </div>
      ) : null}
    </section>
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
  const [activeSection, setActiveSection] = useState<SidebarSectionKey | null>(null);
  const matchingPreset = getMatchingTimerModePreset(settings);
  const totalText = formatClock(settings.totalSeconds, settings.totalSeconds >= 3600);
  const reminderText = formatReminderSummary(settings.reminders);
  const displaySummary = [
    settings.soundEnabled ? "提示音开" : "提示音关",
    settings.allowOvertime ? "超时继续" : "到点停止",
    settings.showCurrentTimeInFullscreen ? "大屏时钟" : "隐藏时钟",
    settings.showFullscreenProgress ? "进度条开" : "进度条关",
    settings.preventDisplaySleep ? "防息屏开" : "防息屏关",
  ].join(" / ");
  const wakeLockSummary = !settings.preventDisplaySleep
    ? "屏幕常亮已关闭"
    : wakeLockStatus === "active"
      ? "屏幕常亮已启用"
      : wakeLockStatus === "unsupported"
        ? "浏览器不支持屏幕常亮"
        : "屏幕常亮待启用";

  function toggleSection(section: SidebarSectionKey): void {
    setActiveSection((currentSection) => (currentSection === section ? null : section));
  }

  return (
    <aside className="projection-checklist" aria-label="右侧栏设置">
      <div className="projection-checklist__header">
        <div>
          <span className="projection-checklist__eyebrow">投屏前检查</span>
          <h2>当前配置</h2>
        </div>
        <span className={status === "running" ? "projection-status projection-status--running" : "projection-status"}>
          {status === "running" ? "计时中" : "可调整"}
        </span>
      </div>

      <div className="sidebar-sections">
        <SidebarSection
          id="mode"
          title="场景"
          summary={matchingPreset?.label ?? "自定义"}
          icon={<LayoutTemplate size={17} />}
          isActive={activeSection === "mode"}
          onToggle={toggleSection}
        >
          <TimerModeSettings settings={settings} status={status} onPresetApply={onPresetApply} />
        </SidebarSection>

        <SidebarSection
          id="basic"
          title="基础"
          summary={`${settings.title || "现场计时"} / ${totalText}`}
          icon={<Type size={17} />}
          isActive={activeSection === "basic"}
          onToggle={toggleSection}
        >
          <TimerBasicSettings
            settings={settings}
            status={status}
            onTitleChange={onTitleChange}
            onDurationChange={onDurationChange}
          />
        </SidebarSection>

        <SidebarSection
          id="display"
          title="显示与计时"
          summary={displaySummary}
          icon={settings.soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          isActive={activeSection === "display"}
          onToggle={toggleSection}
        >
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
        </SidebarSection>

        <SidebarSection
          id="reminders"
          title="提醒"
          summary={reminderText}
          icon={<Bell size={17} />}
          isActive={activeSection === "reminders"}
          onToggle={toggleSection}
        >
          <TimerReminderSettings
            settings={settings}
            status={status}
            onReminderChange={onReminderChange}
            onReminderAdd={onReminderAdd}
            onReminderRemove={onReminderRemove}
          />
        </SidebarSection>
      </div>

      <div className="projection-checklist__quick">
        <div>
          <Monitor aria-hidden="true" size={16} />
          <span>{settings.showCurrentTimeInFullscreen ? "大屏显示真实时间" : "大屏隐藏真实时间"}</span>
        </div>
        <div>
          <Clock3 aria-hidden="true" size={16} />
          <span>{settings.showFullscreenProgress ? `进度条开启 / 总时长 ${totalText}` : `进度条关闭 / 总时长 ${totalText}`}</span>
        </div>
        <div>
          <MonitorCheck aria-hidden="true" size={16} />
          <span>{wakeLockSummary}</span>
        </div>
        <div>
          <Settings2 aria-hidden="true" size={16} />
          <span>{status === "running" ? "运行中，关键配置已锁定" : "可直接展开调整"}</span>
        </div>
      </div>
    </aside>
  );
}
