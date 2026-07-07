import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReminderNode, TimerMode, TimerSettings as TimerSettingsType, TimerStatus } from "../types";
import { loadTimerSettings, saveTimerSettings } from "../utils/storage";
import { playTimerSound } from "../utils/sound";
import { DEFAULT_SETTINGS, clampDuration, getModeSwitchTitle, normalizeSettings } from "../utils/time";
import { getSecondaryText, getStatusText, getTimerPhase } from "../utils/timerPresentation";

export function useTimerEngine() {
  const [settings, setSettings] = useState<TimerSettingsType>(() => loadTimerSettings());
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(settings.totalSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [notice, setNotice] = useState("");
  const [isResetArmed, setIsResetArmed] = useState(false);
  const [triggeredKeys, setTriggeredKeys] = useState<Set<string>>(() => new Set());

  const settingsRef = useRef(settings);
  const statusRef = useRef<TimerStatus>(status);
  const remainingRef = useRef(remainingSeconds);
  const elapsedRef = useRef(elapsedSeconds);
  const runStartedAtRef = useRef<number | null>(null);
  const baseRemainingRef = useRef(settings.totalSeconds);
  const baseElapsedRef = useRef(0);
  const resetArmedRef = useRef(false);
  const resetArmTimeoutRef = useRef<number | null>(null);
  const triggeredRef = useRef<Set<string>>(new Set());

  const phase = useMemo(() => getTimerPhase(settings, remainingSeconds, status), [settings, remainingSeconds, status]);
  const statusText = useMemo(() => getStatusText(settings.mode, status, phase), [settings.mode, status, phase]);
  const secondaryText = useMemo(
    () => getSecondaryText(settings.mode, status, remainingSeconds, elapsedSeconds, settings.totalSeconds),
    [elapsedSeconds, remainingSeconds, settings.mode, settings.totalSeconds, status]
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

  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

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

    const elapsedSeconds = (Date.now() - runStartedAtRef.current) / 1000;
    return baseRemainingRef.current - elapsedSeconds;
  }, []);

  const calculateCurrentElapsed = useCallback(() => {
    if (statusRef.current !== "running" || runStartedAtRef.current === null) {
      return elapsedRef.current;
    }

    const elapsedSinceStart = (Date.now() - runStartedAtRef.current) / 1000;
    return baseElapsedRef.current + elapsedSinceStart;
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
      if (settingsRef.current.mode === "countup") {
        const nextElapsedSeconds = calculateCurrentElapsed();
        elapsedRef.current = nextElapsedSeconds;
        setElapsedSeconds(nextElapsedSeconds);
        return;
      }

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
    }, settings.showMilliseconds && settings.mode !== "clock" ? 33 : 200);

    return () => window.clearInterval(intervalId);
  }, [
    calculateCurrentElapsed,
    calculateCurrentRemaining,
    evaluateReminderTriggers,
    settings.mode,
    settings.showMilliseconds,
    status,
  ]);

  const setSettingsSafely = useCallback((updater: (previousSettings: TimerSettingsType) => TimerSettingsType) => {
    setSettings((previousSettings) => normalizeSettings(updater(previousSettings)));
  }, []);

  useEffect(
    () => () => {
      if (resetArmTimeoutRef.current !== null) {
        window.clearTimeout(resetArmTimeoutRef.current);
      }
    },
    []
  );

  const resetTimerNow = useCallback(() => {
    const activeSettings = settingsRef.current;
    const totalSeconds = activeSettings.totalSeconds;
    runStartedAtRef.current = null;
    baseRemainingRef.current = totalSeconds;
    remainingRef.current = totalSeconds;
    setRemainingSeconds(totalSeconds);
    baseElapsedRef.current = 0;
    elapsedRef.current = 0;
    setElapsedSeconds(0);
    setStatus("idle");
    clearTriggers();
    clearResetArmed();
    setNotice(activeSettings.mode === "clock" ? "时钟模式已准备好" : "已重置");
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

    const activeMode = settingsRef.current.mode;

    if (activeMode === "clock") {
      setNotice("时钟模式会自动显示当前时间，可直接进入大屏。");
      return;
    }

    clearResetArmed();

    if (activeMode === "countup") {
      if (statusRef.current === "idle" || statusRef.current === "finished") {
        clearTriggers();
        elapsedRef.current = 0;
        setElapsedSeconds(0);
        baseElapsedRef.current = 0;
      } else {
        baseElapsedRef.current = elapsedRef.current;
      }

      runStartedAtRef.current = Date.now();
      setStatus("running");
      return;
    }

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

    if (settingsRef.current.mode === "countup") {
      const currentElapsedSeconds = calculateCurrentElapsed();
      runStartedAtRef.current = null;
      baseElapsedRef.current = currentElapsedSeconds;
      elapsedRef.current = currentElapsedSeconds;
      setElapsedSeconds(currentElapsedSeconds);
      setStatus("paused");
      return;
    }

    const currentRemainingSeconds = calculateCurrentRemaining();
    runStartedAtRef.current = null;
    baseRemainingRef.current = currentRemainingSeconds;
    remainingRef.current = currentRemainingSeconds;
    setRemainingSeconds(currentRemainingSeconds);
    setStatus("paused");
  }, [calculateCurrentElapsed, calculateCurrentRemaining, clearResetArmed]);

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
        baseElapsedRef.current = 0;
        elapsedRef.current = 0;
        setElapsedSeconds(0);
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
      baseElapsedRef.current = 0;
      elapsedRef.current = 0;
      setElapsedSeconds(0);
      setStatus("idle");
      clearTriggers();
      clearResetArmed();
      setNotice(`已切换为${normalizedSettings.title}`);
    },
    [clearResetArmed, clearTriggers]
  );

  const switchTimerMode = useCallback(
    (mode: TimerMode) => {
      if (settingsRef.current.mode === mode) {
        return;
      }

      if (statusRef.current === "running") {
        setNotice("计时进行中，暂停或重置后再切换模式。");
        return;
      }

      const nextSettings = normalizeSettings({
        ...settingsRef.current,
        mode,
        title: getModeSwitchTitle(settingsRef.current.title, mode),
      });
      setSettings(nextSettings);
      runStartedAtRef.current = null;
      baseRemainingRef.current = nextSettings.totalSeconds;
      remainingRef.current = nextSettings.totalSeconds;
      setRemainingSeconds(nextSettings.totalSeconds);
      baseElapsedRef.current = 0;
      elapsedRef.current = 0;
      setElapsedSeconds(0);
      setStatus("idle");
      clearTriggers();
      clearResetArmed();
      setNotice(`已切换为${mode === "countdown" ? "倒计时" : mode === "countup" ? "正计时" : "时钟"}模式`);
    },
    [clearResetArmed, clearTriggers]
  );

  const updateTitle = useCallback((title: string) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      title: title.slice(0, 24),
    }));
  }, []);

  const toggleSound = useCallback(() => {
    setSettingsSafely((previousSettings) => ({ ...previousSettings, soundEnabled: !previousSettings.soundEnabled }));
  }, [setSettingsSafely]);

  const previewSound = useCallback(() => {
    void playTimerSound("reminder").then((played) => {
      setNotice(played ? "已试听提示音" : "当前浏览器不支持提示音");
    });
  }, []);

  return {
    settings,
    status,
    remainingSeconds,
    elapsedSeconds,
    phase,
    statusText,
    secondaryText,
    displayTitle,
    notice,
    setNotice,
    isResetArmed,
    triggeredKeys,
    setSettingsSafely,
    updateTitle,
    toggleRunState,
    requestResetTimer,
    updateDuration,
    updateReminder,
    addReminder,
    removeReminder,
    applyPresetSettings,
    switchTimerMode,
    toggleSound,
    previewSound,
  };
}
