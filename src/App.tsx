import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clock3 } from "lucide-react";
import { FullscreenView } from "./components/FullscreenView";
import { ProjectionChecklist } from "./components/ProjectionChecklist";
import { TimerControls } from "./components/TimerControls";
import { TimerDisplay } from "./components/TimerDisplay";
import type { ReminderNode, TimerPhase, TimerSettings as TimerSettingsType, TimerStatus, WakeLockStatus } from "./types";
import { loadTimerSettings, saveTimerSettings } from "./utils/storage";
import { DEFAULT_SETTINGS, clampDuration, formatClock, normalizeSettings } from "./utils/time";
import { playTimerSound } from "./utils/sound";

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";
}

function getTimerPhase(settings: TimerSettingsType, remainingSeconds: number, status: TimerStatus): TimerPhase {
  if (status === "finished") {
    return "finished";
  }

  if (remainingSeconds <= 0) {
    return "overtime";
  }

  const enabledThresholds = settings.reminders
    .filter((reminder) => reminder.enabled && reminder.seconds < settings.totalSeconds)
    .map((reminder) => reminder.seconds)
    .sort((first, second) => first - second);

  if (enabledThresholds.length === 0) {
    return "normal";
  }

  const dangerThreshold = enabledThresholds.find((seconds) => seconds <= 60) ?? enabledThresholds[0];
  const warningThreshold = enabledThresholds[enabledThresholds.length - 1];

  if (remainingSeconds <= dangerThreshold) {
    return "danger";
  }

  if (remainingSeconds <= warningThreshold) {
    return "warning";
  }

  return "normal";
}

function getStatusText(status: TimerStatus, phase: TimerPhase): string {
  if (status === "idle") {
    return "准备就绪";
  }

  if (status === "paused") {
    return "已暂停";
  }

  if (status === "finished") {
    return "时间到";
  }

  if (phase === "overtime") {
    return "已超时";
  }

  if (phase === "danger") {
    return "最后阶段";
  }

  if (phase === "warning") {
    return "提醒阶段";
  }

  return "计时中";
}

function getSecondaryText(status: TimerStatus, remainingSeconds: number, totalSeconds: number): string {
  const forceHours = totalSeconds >= 3600 || Math.abs(remainingSeconds) >= 3600;

  if (remainingSeconds < 0) {
    return `已超时 +${formatClock(Math.abs(remainingSeconds), forceHours)}`;
  }

  if (status === "idle") {
    return `总时长 ${formatClock(totalSeconds, forceHours)}`;
  }

  if (status === "paused") {
    return `暂停在 ${formatClock(remainingSeconds, forceHours)}`;
  }

  if (status === "finished") {
    return `时间到，用时 ${formatClock(totalSeconds, forceHours)}`;
  }

  return `距离结束 ${formatClock(remainingSeconds, forceHours)}`;
}

type ScreenWakeLockSentinel = EventTarget & {
  readonly released: boolean;
  release: () => Promise<void>;
  addEventListener: (
    type: "release",
    listener: () => void,
    options?: boolean | AddEventListenerOptions
  ) => void;
};

type ScreenWakeLock = {
  request: (type: "screen") => Promise<ScreenWakeLockSentinel>;
};

type WakeLockNavigator = Navigator & {
  wakeLock?: ScreenWakeLock;
};

function getScreenWakeLock(): ScreenWakeLock | null {
  if (typeof navigator === "undefined" || typeof window === "undefined" || !window.isSecureContext) {
    return null;
  }

  return (navigator as WakeLockNavigator).wakeLock ?? null;
}

function getInitialWakeLockStatus(): WakeLockStatus {
  return getScreenWakeLock() ? "available" : "unsupported";
}

export default function App() {
  const [settings, setSettings] = useState<TimerSettingsType>(() => loadTimerSettings());
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(settings.totalSeconds);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [notice, setNotice] = useState("");
  const [isResetArmed, setIsResetArmed] = useState(false);
  const [triggeredKeys, setTriggeredKeys] = useState<Set<string>>(() => new Set());
  const [wakeLockStatus, setWakeLockStatus] = useState<WakeLockStatus>(() => getInitialWakeLockStatus());

  const rootRef = useRef<HTMLDivElement>(null);
  const wakeLockRef = useRef<ScreenWakeLockSentinel | null>(null);
  const settingsRef = useRef(settings);
  const statusRef = useRef<TimerStatus>(status);
  const remainingRef = useRef(remainingSeconds);
  const runStartedAtRef = useRef<number | null>(null);
  const baseRemainingRef = useRef(settings.totalSeconds);
  const resetArmedRef = useRef(false);
  const resetArmTimeoutRef = useRef<number | null>(null);
  const triggeredRef = useRef<Set<string>>(new Set());

  const phase = useMemo(() => getTimerPhase(settings, remainingSeconds, status), [settings, remainingSeconds, status]);
  const statusText = useMemo(() => getStatusText(status, phase), [status, phase]);
  const secondaryText = useMemo(
    () => getSecondaryText(status, remainingSeconds, settings.totalSeconds),
    [status, remainingSeconds, settings.totalSeconds]
  );
  const displayTitle = settings.title.trim() || DEFAULT_SETTINGS.title;

  useEffect(() => {
    settingsRef.current = settings;
    saveTimerSettings(settings);
  }, [settings]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    remainingRef.current = remainingSeconds;
  }, [remainingSeconds]);

  const requestScreenWakeLock = useCallback(async (showFeedback = true, force = false): Promise<boolean> => {
    const wakeLock = getScreenWakeLock();

    if (!wakeLock) {
      setWakeLockStatus("unsupported");

      if (showFeedback) {
        setNotice("当前浏览器不支持屏幕常亮，请检查系统电源设置。");
      }

      return false;
    }

    if (!force && !settingsRef.current.preventDisplaySleep) {
      setWakeLockStatus("available");
      return false;
    }

    if (document.visibilityState !== "visible") {
      setWakeLockStatus("blocked");
      return false;
    }

    if (wakeLockRef.current && !wakeLockRef.current.released) {
      setWakeLockStatus("active");

      if (showFeedback) {
        setNotice("屏幕常亮已启用。");
      }

      return true;
    }

    setWakeLockStatus("requesting");

    try {
      const sentinel = await wakeLock.request("screen");
      wakeLockRef.current = sentinel;
      setWakeLockStatus("active");

      sentinel.addEventListener("release", () => {
        if (wakeLockRef.current !== sentinel) {
          return;
        }

        wakeLockRef.current = null;
        setWakeLockStatus(getScreenWakeLock() ? "released" : "unsupported");
      });

      if (showFeedback) {
        setNotice("已启用屏幕常亮，投屏时会尽量避免自动息屏。");
      }

      return true;
    } catch {
      wakeLockRef.current = null;
      setWakeLockStatus(getScreenWakeLock() ? "blocked" : "unsupported");

      if (showFeedback) {
        setNotice("无法启用屏幕常亮，请允许浏览器权限或检查系统电源设置。");
      }

      return false;
    }
  }, []);

  const releaseScreenWakeLock = useCallback(async (): Promise<void> => {
    const sentinel = wakeLockRef.current;
    wakeLockRef.current = null;

    if (sentinel && !sentinel.released) {
      try {
        await sentinel.release();
      } catch {
        // The browser may release wake locks during visibility changes.
      }
    }

    setWakeLockStatus(getScreenWakeLock() ? "available" : "unsupported");
  }, []);

  useEffect(() => {
    if (!settings.preventDisplaySleep) {
      void releaseScreenWakeLock();
      return;
    }

    void requestScreenWakeLock(false);
  }, [releaseScreenWakeLock, requestScreenWakeLock, settings.preventDisplaySleep]);

  useEffect(() => {
    if (
      !settings.preventDisplaySleep ||
      wakeLockStatus === "active" ||
      wakeLockStatus === "requesting" ||
      wakeLockStatus === "unsupported"
    ) {
      return;
    }

    const handleFirstInteraction = () => {
      void requestScreenWakeLock(false);
    };

    window.addEventListener("pointerdown", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [requestScreenWakeLock, settings.preventDisplaySleep, wakeLockStatus]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && settingsRef.current.preventDisplaySleep) {
        void requestScreenWakeLock(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [requestScreenWakeLock]);

  useEffect(
    () => () => {
      const sentinel = wakeLockRef.current;
      wakeLockRef.current = null;

      if (sentinel && !sentinel.released) {
        void sentinel.release();
      }
    },
    []
  );

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => setNotice(""), 3600);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const clearTriggers = useCallback(() => {
    triggeredRef.current = new Set();
    setTriggeredKeys(new Set());
  }, []);

  const clearResetArmed = useCallback(() => {
    resetArmedRef.current = false;
    setIsResetArmed(false);

    if (resetArmTimeoutRef.current !== null) {
      window.clearTimeout(resetArmTimeoutRef.current);
      resetArmTimeoutRef.current = null;
    }
  }, []);

  const markTriggered = useCallback((key: string, soundKind: "reminder" | "timeout", message: string) => {
    if (triggeredRef.current.has(key)) {
      return;
    }

    triggeredRef.current = new Set(triggeredRef.current).add(key);
    setTriggeredKeys(new Set(triggeredRef.current));
    setNotice(message);

    if (settingsRef.current.soundEnabled) {
      void playTimerSound(soundKind);
    }
  }, []);

  const calculateCurrentRemaining = useCallback(() => {
    if (statusRef.current !== "running" || runStartedAtRef.current === null) {
      return remainingRef.current;
    }

    const elapsedSeconds = Math.floor((Date.now() - runStartedAtRef.current) / 1000);
    return baseRemainingRef.current - elapsedSeconds;
  }, []);

  const evaluateReminderTriggers = useCallback(
    (nextRemainingSeconds: number) => {
      const activeSettings = settingsRef.current;

      activeSettings.reminders.forEach((reminder) => {
        const shouldTrigger =
          reminder.enabled &&
          reminder.seconds > 0 &&
          reminder.seconds < activeSettings.totalSeconds &&
          nextRemainingSeconds <= reminder.seconds &&
          nextRemainingSeconds > 0;

        if (shouldTrigger) {
          markTriggered(reminder.id, "reminder", `${reminder.label}，已播放提示音`);
        }
      });

      if (nextRemainingSeconds <= 0) {
        markTriggered(
          "timeout",
          "timeout",
          activeSettings.allowOvertime ? "已超时，已播放提示音" : "时间到，已播放提示音"
        );
      }
    },
    [markTriggered]
  );

  useEffect(() => {
    if (status !== "running") {
      return;
    }

    const intervalId = window.setInterval(() => {
      const nextRemainingSeconds = calculateCurrentRemaining();
      const activeSettings = settingsRef.current;

      if (nextRemainingSeconds <= 0 && !activeSettings.allowOvertime) {
        remainingRef.current = 0;
        setRemainingSeconds(0);
        evaluateReminderTriggers(0);
        runStartedAtRef.current = null;
        baseRemainingRef.current = 0;
        setStatus("finished");
        return;
      }

      remainingRef.current = nextRemainingSeconds;
      setRemainingSeconds(nextRemainingSeconds);
      evaluateReminderTriggers(nextRemainingSeconds);
    }, 200);

    return () => window.clearInterval(intervalId);
  }, [calculateCurrentRemaining, evaluateReminderTriggers, status]);

  const setSettingsSafely = useCallback((updater: (previousSettings: TimerSettingsType) => TimerSettingsType) => {
    setSettings((previousSettings) => normalizeSettings(updater(previousSettings)));
  }, []);

  const updatePreventDisplaySleep = useCallback(
    (enabled: boolean) => {
      setSettingsSafely((previousSettings) => ({ ...previousSettings, preventDisplaySleep: enabled }));

      if (enabled) {
        void requestScreenWakeLock(true, true);
        return;
      }

      void releaseScreenWakeLock();
      setNotice("屏幕常亮已关闭。");
    },
    [releaseScreenWakeLock, requestScreenWakeLock, setSettingsSafely]
  );

  useEffect(
    () => () => {
      if (resetArmTimeoutRef.current !== null) {
        window.clearTimeout(resetArmTimeoutRef.current);
      }
    },
    []
  );

  const resetTimerNow = useCallback(() => {
    const totalSeconds = settingsRef.current.totalSeconds;
    runStartedAtRef.current = null;
    baseRemainingRef.current = totalSeconds;
    remainingRef.current = totalSeconds;
    setRemainingSeconds(totalSeconds);
    setStatus("idle");
    clearTriggers();
    clearResetArmed();
    setNotice("已重置");
  }, [clearResetArmed, clearTriggers]);

  const requestResetTimer = useCallback(() => {
    const isAwaitingResetConfirm = resetArmedRef.current || isResetArmed;

    if (statusRef.current === "running" && !isAwaitingResetConfirm) {
      resetArmedRef.current = true;
      setIsResetArmed(true);
      setNotice("计时正在进行，再按一次确认重置。");

      resetArmTimeoutRef.current = window.setTimeout(() => {
        clearResetArmed();
      }, 2800);
      return;
    }

    resetTimerNow();
  }, [clearResetArmed, isResetArmed, resetTimerNow]);

  const startOrResumeTimer = useCallback(() => {
    if (statusRef.current === "running") {
      return;
    }

    clearResetArmed();

    if (statusRef.current === "idle" || statusRef.current === "finished") {
      clearTriggers();
      const totalSeconds = settingsRef.current.totalSeconds;
      remainingRef.current = totalSeconds;
      setRemainingSeconds(totalSeconds);
      baseRemainingRef.current = totalSeconds;
    } else {
      baseRemainingRef.current = remainingRef.current;
    }

    runStartedAtRef.current = Date.now();
    setStatus("running");
  }, [clearResetArmed, clearTriggers]);

  const pauseTimer = useCallback(() => {
    clearResetArmed();
    const currentRemainingSeconds = calculateCurrentRemaining();
    runStartedAtRef.current = null;
    baseRemainingRef.current = currentRemainingSeconds;
    remainingRef.current = currentRemainingSeconds;
    setRemainingSeconds(currentRemainingSeconds);
    setStatus("paused");
  }, [calculateCurrentRemaining, clearResetArmed]);

  const toggleRunState = useCallback(() => {
    if (statusRef.current === "running") {
      pauseTimer();
      return;
    }

    startOrResumeTimer();
  }, [pauseTimer, startOrResumeTimer]);

  const updateDuration = useCallback(
    (totalSeconds: number) => {
      const normalizedTotalSeconds = clampDuration(totalSeconds);
      setSettingsSafely((previousSettings) => ({ ...previousSettings, totalSeconds: normalizedTotalSeconds }));

      if (statusRef.current !== "running") {
        runStartedAtRef.current = null;
        baseRemainingRef.current = normalizedTotalSeconds;
        remainingRef.current = normalizedTotalSeconds;
        setRemainingSeconds(normalizedTotalSeconds);
        setStatus("idle");
        clearTriggers();
      }
    },
    [clearTriggers, setSettingsSafely]
  );

  const updateReminder = useCallback(
    (id: string, nextReminder: ReminderNode) => {
      setSettingsSafely((previousSettings) => ({
        ...previousSettings,
        reminders: previousSettings.reminders.map((reminder) => (reminder.id === id ? nextReminder : reminder)),
      }));

      clearTriggers();
    },
    [clearTriggers, setSettingsSafely]
  );

  const addReminder = useCallback(
    (reminder: ReminderNode) => {
      setSettingsSafely((previousSettings) => ({
        ...previousSettings,
        reminders: [...previousSettings.reminders, reminder],
      }));
      clearTriggers();
    },
    [clearTriggers, setSettingsSafely]
  );

  const removeReminder = useCallback(
    (id: string) => {
      setSettingsSafely((previousSettings) => ({
        ...previousSettings,
        reminders: previousSettings.reminders.filter((reminder) => reminder.id !== id),
      }));
      clearTriggers();
    },
    [clearTriggers, setSettingsSafely]
  );

  const applyPresetSettings = useCallback(
    (nextSettings: TimerSettingsType) => {
      if (statusRef.current === "running") {
        setNotice("计时进行中，暂停或重置后再切换场景。");
        return;
      }

      const normalizedSettings = normalizeSettings(nextSettings);
      setSettings(normalizedSettings);
      runStartedAtRef.current = null;
      baseRemainingRef.current = normalizedSettings.totalSeconds;
      remainingRef.current = normalizedSettings.totalSeconds;
      setRemainingSeconds(normalizedSettings.totalSeconds);
      setStatus("idle");
      clearTriggers();
      clearResetArmed();
      setNotice(`已切换为${normalizedSettings.title}`);
    },
    [clearResetArmed, clearTriggers]
  );

  const enterFullscreen = useCallback(async () => {
    setIsFocusMode(true);

    try {
      if (!rootRef.current?.requestFullscreen) {
        setNotice("已进入大屏展示模式；如需隐藏浏览器工具栏，请手动全屏。");
        return;
      }

      if (!document.fullscreenElement) {
        await rootRef.current.requestFullscreen();
      }
    } catch {
      setNotice("已进入大屏展示模式；浏览器未允许原生全屏，可手动按 F11。");
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    setIsFocusMode(false);

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      setNotice("无法退出全屏，请使用 Esc 或浏览器全屏按钮。");
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFocusMode || document.fullscreenElement) {
      void exitFullscreen();
      return;
    }

    void enterFullscreen();
  }, [enterFullscreen, exitFullscreen, isFocusMode]);

  const previewSound = useCallback(() => {
    void playTimerSound("reminder").then((played) => {
      setNotice(played ? "已试听提示音" : "当前浏览器不支持提示音");
    });
  }, []);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFocusMode) {
        event.preventDefault();
        void exitFullscreen();
        return;
      }

      if (isEditableElement(event.target)) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        toggleRunState();
        return;
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        requestResetTimer();
        return;
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        toggleFullscreen();
        return;
      }

    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [exitFullscreen, isFocusMode, requestResetTimer, toggleFullscreen, toggleRunState]);

  const content = isFocusMode ? (
    <FullscreenView
      title={displayTitle}
      remainingSeconds={remainingSeconds}
      totalSeconds={settings.totalSeconds}
      phase={phase}
      status={status}
      soundEnabled={settings.soundEnabled}
      showCurrentTime={settings.showCurrentTimeInFullscreen}
      showProgress={settings.showFullscreenProgress}
      onToggleRun={toggleRunState}
      onReset={requestResetTimer}
      onToggleFullscreen={toggleFullscreen}
      onToggleSound={() =>
        setSettingsSafely((previousSettings) => ({ ...previousSettings, soundEnabled: !previousSettings.soundEnabled }))
      }
      onPreviewSound={previewSound}
      isResetArmed={isResetArmed}
    />
  ) : (
    <>
      <main className="notion-page">
        <header className="notion-page-header">
          <div className="notion-page-icon" aria-hidden="true">
            <Clock3 size={26} />
          </div>
          <div>
            <span className="notion-page-kicker">TimerDisplay</span>
            <h1>现场计时</h1>
          </div>
        </header>

        <section className="app-layout">
          <section className="timer-column">
            <TimerDisplay
              title={displayTitle}
              remainingSeconds={remainingSeconds}
              totalSeconds={settings.totalSeconds}
              phase={phase}
              statusText={statusText}
              secondaryText={secondaryText}
              controls={
                <TimerControls
                  status={status}
                  isFocusMode={isFocusMode}
                  soundEnabled={settings.soundEnabled}
                  onToggleRun={toggleRunState}
                  onReset={requestResetTimer}
                  onToggleFullscreen={toggleFullscreen}
                  onToggleSound={() =>
                    setSettingsSafely((previousSettings) => ({
                      ...previousSettings,
                      soundEnabled: !previousSettings.soundEnabled,
                    }))
                  }
                  onPreviewSound={previewSound}
                  isResetArmed={isResetArmed}
                />
              }
            />
          </section>
          <ProjectionChecklist
            settings={settings}
            status={status}
            onTitleChange={(title) =>
              setSettings((previousSettings) => ({
                ...previousSettings,
                title: title.slice(0, 24),
              }))
            }
            onDurationChange={updateDuration}
            onPresetApply={applyPresetSettings}
            onSoundEnabledChange={(enabled) =>
              setSettingsSafely((previousSettings) => ({ ...previousSettings, soundEnabled: enabled }))
            }
            onAllowOvertimeChange={(enabled) =>
              setSettingsSafely((previousSettings) => ({ ...previousSettings, allowOvertime: enabled }))
            }
            onShowCurrentTimeInFullscreenChange={(enabled) =>
              setSettingsSafely((previousSettings) => ({
                ...previousSettings,
                showCurrentTimeInFullscreen: enabled,
              }))
            }
            onShowFullscreenProgressChange={(enabled) =>
              setSettingsSafely((previousSettings) => ({
                ...previousSettings,
                showFullscreenProgress: enabled,
              }))
            }
            wakeLockStatus={wakeLockStatus}
            onPreventDisplaySleepChange={updatePreventDisplaySleep}
            onWakeLockRequest={() => {
              void requestScreenWakeLock(true);
            }}
            onReminderChange={updateReminder}
            onReminderAdd={addReminder}
            onReminderRemove={removeReminder}
          />
        </section>
      </main>
    </>
  );

  return (
    <div className={`app-shell app-shell--${phase} ${isFocusMode ? "app-shell--focus" : ""}`} ref={rootRef}>
      {content}
      {notice && !isFocusMode ? (
        <div className="toast" role="status">
          {notice}
        </div>
      ) : null}
      <span className="sr-only">已触发提醒数量：{triggeredKeys.size}</span>
    </div>
  );
}
