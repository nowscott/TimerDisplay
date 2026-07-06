import { useCallback, useEffect, useRef, useState } from "react";
import { Clock3, Hourglass, Timer, TimerReset } from "lucide-react";
import { FullscreenView } from "./components/FullscreenView";
import { ProjectionChecklist } from "./components/ProjectionChecklist";
import { TimerControls } from "./components/TimerControls";
import { TimerDisplay } from "./components/TimerDisplay";
import { useTimerEngine } from "./hooks/useTimerEngine";
import { useTimerKeyboardShortcuts } from "./hooks/useTimerKeyboardShortcuts";
import { useWakeLock } from "./hooks/useWakeLock";
import type { TimerMode } from "./types";

const TIMER_MODE_TABS: Array<{
  mode: TimerMode;
  label: string;
  detail: string;
  icon: typeof Clock3;
}> = [
  { mode: "countdown", label: "倒计时", detail: "限时投屏", icon: Hourglass },
  { mode: "countup", label: "正计时", detail: "从零累计", icon: Timer },
  { mode: "clock", label: "时钟", detail: "待机展示", icon: Clock3 },
];
const APP_VERSION = import.meta.env.VITE_APP_VERSION;
const GITHUB_URL = "https://github.com/nowscott/TimerDisplay";

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const timer = useTimerEngine();
  const { wakeLockStatus, requestScreenWakeLock, releaseScreenWakeLock } = useWakeLock(
    timer.settings.preventDisplaySleep,
    timer.setNotice
  );

  const updatePreventDisplaySleep = useCallback(
    (enabled: boolean) => {
      timer.setSettingsSafely((previousSettings) => ({ ...previousSettings, preventDisplaySleep: enabled }));

      if (enabled) {
        void requestScreenWakeLock(true, true);
        return;
      }

      void releaseScreenWakeLock();
      timer.setNotice("屏幕常亮已关闭。");
    },
    [releaseScreenWakeLock, requestScreenWakeLock, timer]
  );

  const enterFullscreen = useCallback(async () => {
    setIsFocusMode(true);

    try {
      if (!rootRef.current?.requestFullscreen) {
        timer.setNotice("已进入大屏展示模式；如需隐藏浏览器工具栏，请手动全屏。");
        return;
      }

      if (!document.fullscreenElement) {
        await rootRef.current.requestFullscreen();
      }
    } catch {
      timer.setNotice("已进入大屏展示模式；浏览器未允许原生全屏，可手动按 F11。");
    }
  }, [timer]);

  const exitFullscreen = useCallback(async () => {
    setIsFocusMode(false);

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      timer.setNotice("无法退出全屏，请使用 Esc 或浏览器全屏按钮。");
    }
  }, [timer]);

  const toggleFullscreen = useCallback(() => {
    if (isFocusMode || document.fullscreenElement) {
      void exitFullscreen();
      return;
    }

    void enterFullscreen();
  }, [enterFullscreen, exitFullscreen, isFocusMode]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = Boolean(document.fullscreenElement);
      if (!isFullscreen) {
        setIsFocusMode(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useTimerKeyboardShortcuts({
    isFocusMode,
    onExitFullscreen: () => {
      void exitFullscreen();
    },
    onToggleRun: timer.toggleRunState,
    onReset: timer.requestResetTimer,
    onToggleFullscreen: toggleFullscreen,
  });

  const content = isFocusMode ? (
    <FullscreenView
      mode={timer.settings.mode}
      title={timer.displayTitle}
      remainingSeconds={timer.remainingSeconds}
      elapsedSeconds={timer.elapsedSeconds}
      totalSeconds={timer.settings.totalSeconds}
      phase={timer.phase}
      status={timer.status}
      soundEnabled={timer.settings.soundEnabled}
      showMilliseconds={timer.settings.showMilliseconds}
      showCurrentTime={timer.settings.showCurrentTimeInFullscreen}
      showProgress={timer.settings.showFullscreenProgress}
      onToggleRun={timer.toggleRunState}
      onReset={timer.requestResetTimer}
      onToggleFullscreen={toggleFullscreen}
      onToggleSound={timer.toggleSound}
      onPreviewSound={timer.previewSound}
      isResetArmed={timer.isResetArmed}
    />
  ) : (
    <main className="timer-workspace">
      <header className="mode-dock" aria-label="计时模式">
        <div className="mode-dock-brand inline-flex items-center">
          <span className="mode-dock-brand__icon" aria-hidden="true">
            <TimerReset size={21} />
          </span>
          <span className="mode-dock-brand__copy">
            <span className="mode-dock-brand__text">TimerDisplay</span>
            <a
              className="mode-dock-version"
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={`TimerDisplay ${APP_VERSION}，在 GitHub 打开`}
            >
              v{APP_VERSION}
            </a>
          </span>
        </div>
        <div className="mode-tabs inline-flex items-center" role="tablist" aria-label="当前模式">
          {TIMER_MODE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = timer.settings.mode === tab.mode;

            return (
              <button
                className={isActive ? "mode-tab mode-tab--active inline-flex items-center" : "mode-tab inline-flex items-center"}
                type="button"
                key={tab.mode}
                role="tab"
                aria-selected={isActive}
                data-testid={`mode-tab-${tab.mode}`}
                onClick={() => timer.switchTimerMode(tab.mode)}
              >
                <Icon aria-hidden="true" size={18} />
                <span className="mode-tab__label">{tab.label}</span>
                <span className="mode-tab__detail">{tab.detail}</span>
              </button>
            );
          })}
        </div>
      </header>

      <section className="workspace-main" aria-label="计时主内容">
        <TimerDisplay
          mode={timer.settings.mode}
          title={timer.displayTitle}
          remainingSeconds={timer.remainingSeconds}
          elapsedSeconds={timer.elapsedSeconds}
          totalSeconds={timer.settings.totalSeconds}
          phase={timer.phase}
          statusText={timer.statusText}
          secondaryText={timer.secondaryText}
          showMilliseconds={timer.settings.showMilliseconds}
          controls={
            <TimerControls
              mode={timer.settings.mode}
              status={timer.status}
              isFocusMode={isFocusMode}
              soundEnabled={timer.settings.soundEnabled}
              onToggleRun={timer.toggleRunState}
              onReset={timer.requestResetTimer}
              onToggleFullscreen={toggleFullscreen}
              onToggleSound={timer.toggleSound}
              onPreviewSound={timer.previewSound}
              isResetArmed={timer.isResetArmed}
            />
          }
        />
      </section>

      <ProjectionChecklist
        settings={timer.settings}
        status={timer.status}
        onTitleChange={timer.updateTitle}
        onDurationChange={timer.updateDuration}
        onPresetApply={timer.applyPresetSettings}
        onSoundEnabledChange={(enabled) =>
          timer.setSettingsSafely((previousSettings) => ({ ...previousSettings, soundEnabled: enabled }))
        }
        onAllowOvertimeChange={(enabled) =>
          timer.setSettingsSafely((previousSettings) => ({ ...previousSettings, allowOvertime: enabled }))
        }
        onShowMillisecondsChange={(enabled) =>
          timer.setSettingsSafely((previousSettings) => ({ ...previousSettings, showMilliseconds: enabled }))
        }
        onShowCurrentTimeInFullscreenChange={(enabled) =>
          timer.setSettingsSafely((previousSettings) => ({
            ...previousSettings,
            showCurrentTimeInFullscreen: enabled,
          }))
        }
        onShowFullscreenProgressChange={(enabled) =>
          timer.setSettingsSafely((previousSettings) => ({
            ...previousSettings,
            showFullscreenProgress: enabled,
          }))
        }
        wakeLockStatus={wakeLockStatus}
        onPreventDisplaySleepChange={updatePreventDisplaySleep}
        onWakeLockRequest={() => {
          void requestScreenWakeLock(true);
        }}
        onReminderChange={timer.updateReminder}
        onReminderAdd={timer.addReminder}
        onReminderRemove={timer.removeReminder}
      />
    </main>
  );

  return (
    <div
      className={`app-shell app-shell--${timer.phase} app-shell--mode-${timer.settings.mode} ${
        isFocusMode ? "app-shell--focus" : ""
      }`}
      ref={rootRef}
    >
      {content}
      {timer.notice && !isFocusMode ? (
        <div className="toast" role="status">
          {timer.notice}
        </div>
      ) : null}
      <span className="sr-only">已触发提醒数量：{timer.triggeredKeys.size}</span>
    </div>
  );
}
