import { useCallback } from "react";
import { FullscreenView } from "./components/FullscreenView";
import { ModeDock } from "./components/ModeDock";
import { ProjectionChecklist } from "./components/ProjectionChecklist";
import { TimerControls } from "./components/TimerControls";
import { TimerDisplay } from "./components/TimerDisplay";
import { useFullscreenMode } from "./hooks/useFullscreenMode";
import { useTimerEngine } from "./hooks/useTimerEngine";
import { useTimerKeyboardShortcuts } from "./hooks/useTimerKeyboardShortcuts";
import { useWakeLock } from "./hooks/useWakeLock";

export default function App() {
  const timer = useTimerEngine();
  const { rootRef, isFocusMode, exitFullscreen, toggleFullscreen } = useFullscreenMode({
    setNotice: timer.setNotice,
  });
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
      <ModeDock mode={timer.settings.mode} onModeChange={timer.switchTimerMode} />

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
