import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Minimize2, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import type { TimerMode, TimerPhase, TimerStatus } from "../types";
import { formatClock, formatClockWithMilliseconds, formatCurrentDate, formatCurrentTime } from "../utils/time";
import { useFullscreenProgress } from "../hooks/useFullscreenProgress";
import { TimerControls } from "./TimerControls";

interface FullscreenViewProps {
  mode: TimerMode;
  title: string;
  remainingSeconds: number;
  elapsedSeconds: number;
  totalSeconds: number;
  phase: TimerPhase;
  status: TimerStatus;
  soundEnabled: boolean;
  showMilliseconds: boolean;
  showCurrentTime: boolean;
  showProgress: boolean;
  isResetArmed: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  onToggleSound: () => void;
  onPreviewSound: () => void;
}

export function FullscreenView({
  mode,
  title,
  remainingSeconds,
  elapsedSeconds,
  totalSeconds,
  phase,
  status,
  soundEnabled,
  showMilliseconds,
  showCurrentTime,
  showProgress,
  isResetArmed,
  onToggleRun,
  onReset,
  onToggleFullscreen,
  onToggleSound,
  onPreviewSound,
}: FullscreenViewProps) {
  const forceHours = totalSeconds >= 3600 || Math.abs(remainingSeconds) >= 3600;
  const visibleSeconds = Math.abs(remainingSeconds);
  const countdownTimeText =
    remainingSeconds < 0
      ? `+${
          showMilliseconds
            ? formatClockWithMilliseconds(visibleSeconds, forceHours)
            : formatClock(visibleSeconds, forceHours)
        }`
      : showMilliseconds
        ? formatClockWithMilliseconds(visibleSeconds, forceHours)
        : formatClock(visibleSeconds, forceHours);
  const countdownElapsedSeconds = Math.max(0, totalSeconds - remainingSeconds);
  const displayElapsedSeconds = mode === "countup" ? elapsedSeconds : countdownElapsedSeconds;
  const elapsedText = formatClock(displayElapsedSeconds, forceHours || displayElapsedSeconds >= 3600);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const timeText =
    mode === "clock"
      ? formatCurrentTime(currentDate)
      : mode === "countup"
        ? showMilliseconds
          ? formatClockWithMilliseconds(elapsedSeconds, elapsedSeconds >= 3600)
          : formatClock(elapsedSeconds, elapsedSeconds >= 3600)
        : countdownTimeText;
  const remainingLabel = remainingSeconds < 0 ? "已超时" : "剩余";
  const remainingText =
    remainingSeconds < 0
      ? `+${formatClock(Math.abs(remainingSeconds), forceHours)}`
      : formatClock(remainingSeconds, forceHours);
  const shouldShowProgress = mode === "countdown" && showProgress;
  const remainingProgress = Math.max(0, Math.min(100, (Math.max(0, remainingSeconds) / totalSeconds) * 100));
  const elapsedProgress = 100 - remainingProgress;
  const progressLabel =
    status === "idle"
      ? "准备就绪"
      : status === "paused"
        ? "已暂停"
        : remainingSeconds < 0
          ? "已超时"
          : status === "finished"
            ? "时间到"
            : "计时中";
  const { visualElapsedProgress, titleRef, timeRef } = useFullscreenProgress({
    enabled: shouldShowProgress,
    status,
    elapsedProgress,
    remainingSeconds,
    totalSeconds,
  });
  const [isChromeVisible, setIsChromeVisible] = useState(true);
  const chromeHideTimeoutRef = useRef<number | null>(null);
  const PrimaryIcon = status === "running" ? Pause : Play;
  const primaryLabel =
    status === "running" ? "暂停" : status === "paused" ? "继续" : status === "finished" ? "重新开始" : "开始计时";
  const resetLabel = isResetArmed ? "确认取消计时" : "取消计时";
  const soundLabel = soundEnabled ? "关闭声音" : "开启声音";
  const progressStyle = { "--fullscreen-progress": `${visualElapsedProgress}%` } as CSSProperties;
  const fullscreenPhase = mode === "countdown" ? phase : "normal";
  const fullscreenLabel =
    mode === "clock" ? "大屏时钟" : mode === "countup" ? "大屏正计时" : "大屏倒计时";
  const dateText = formatCurrentDate(currentDate);

  useEffect(() => {
    if (!showCurrentTime && mode !== "clock") {
      return;
    }

    const intervalId = window.setInterval(() => setCurrentDate(new Date()), 1000);
    return () => window.clearInterval(intervalId);
  }, [mode, showCurrentTime]);

  useEffect(() => {
    const showChrome = () => {
      setIsChromeVisible(true);

      if (chromeHideTimeoutRef.current !== null) {
        window.clearTimeout(chromeHideTimeoutRef.current);
      }

      chromeHideTimeoutRef.current = window.setTimeout(() => {
        setIsChromeVisible(false);
      }, 2800);
    };

    showChrome();
    window.addEventListener("mousemove", showChrome);
    window.addEventListener("pointerdown", showChrome);
    window.addEventListener("touchstart", showChrome, { passive: true });
    window.addEventListener("keydown", showChrome);

    return () => {
      if (chromeHideTimeoutRef.current !== null) {
        window.clearTimeout(chromeHideTimeoutRef.current);
      }

      window.removeEventListener("mousemove", showChrome);
      window.removeEventListener("pointerdown", showChrome);
      window.removeEventListener("touchstart", showChrome);
      window.removeEventListener("keydown", showChrome);
    };
  }, []);

  return (
    <main
      className={`fullscreen-view fullscreen-view--${fullscreenPhase} fullscreen-view--mode-${mode} ${
        shouldShowProgress ? "fullscreen-view--with-progress" : ""
      } ${showMilliseconds && mode !== "clock" ? "fullscreen-view--milliseconds" : ""} ${
        isChromeVisible ? "" : "fullscreen-view--chrome-hidden"
      }`}
      style={shouldShowProgress ? progressStyle : undefined}
    >
      {showCurrentTime && mode !== "clock" ? (
        <div className="fullscreen-clock" aria-label="当前时间" data-testid="fullscreen-current-time">
          {formatCurrentTime(currentDate)}
        </div>
      ) : null}
      <section className="fullscreen-timer" aria-label={fullscreenLabel}>
        {mode !== "clock" ? (
          <h1 className="fullscreen-title" data-testid="fullscreen-title" ref={titleRef}>
            {title}
          </h1>
        ) : null}
        <div className="fullscreen-time" aria-live="polite" data-testid="time-display" ref={timeRef}>
          {timeText}
        </div>
        <div className="fullscreen-meta" aria-label="计时概览">
          {mode === "clock" ? (
            <>
              <span className="fullscreen-meta-item" data-testid="timer-elapsed">
                <span className="fullscreen-meta-label">日期</span>
                <span className="fullscreen-meta-number">{dateText}</span>
              </span>
              <span className="fullscreen-meta-item" data-testid="timer-remaining">
                <span className="fullscreen-meta-label">模式</span>
                <span className="fullscreen-meta-number">待机时钟</span>
              </span>
            </>
          ) : mode === "countup" ? (
            <>
              <span className="fullscreen-meta-item" data-testid="timer-elapsed">
                <span className="fullscreen-meta-label">已计时</span>
                <span className="fullscreen-meta-number">{elapsedText}</span>
              </span>
              <span className="fullscreen-meta-item" data-testid="timer-remaining">
                <span className="fullscreen-meta-label">模式</span>
                <span className="fullscreen-meta-number">正计时</span>
              </span>
            </>
          ) : (
            <>
              <span className="fullscreen-meta-item" data-testid="timer-elapsed">
                <span className="fullscreen-meta-label">已进行</span>
                <span className="fullscreen-meta-number">{elapsedText}</span>
              </span>
              <span className="fullscreen-meta-item" data-testid="timer-remaining">
                <span className="fullscreen-meta-label">{remainingLabel}</span>
                <span className="fullscreen-meta-number">{remainingText}</span>
              </span>
            </>
          )}
        </div>
      </section>
      {shouldShowProgress ? (
        <div
          className="fullscreen-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(visualElapsedProgress)}
          aria-label={`计时进度，${progressLabel}，已进行 ${Math.round(visualElapsedProgress)}%`}
        >
          <span className="fullscreen-progress__fill" style={{ width: `${visualElapsedProgress}%` }} />
        </div>
      ) : null}
      {shouldShowProgress ? (
        <div className="fullscreen-standby-controls" aria-label="StandBy 风格计时控制">
          <button
            className="standby-control-button standby-control-button--primary"
            type="button"
            title={primaryLabel}
            aria-label={primaryLabel}
            data-testid="toggle-run"
            onClick={onToggleRun}
          >
            <PrimaryIcon aria-hidden="true" size={30} />
          </button>
          <button
            className={isResetArmed ? "standby-control-button standby-control-button--danger" : "standby-control-button"}
            type="button"
            title={resetLabel}
            aria-label={resetLabel}
            data-testid="reset-timer"
            onClick={onReset}
          >
            <X aria-hidden="true" size={30} />
          </button>
          <button
            className="standby-control-button"
            type="button"
            title="退出大屏"
            aria-label="退出大屏"
            data-testid="toggle-fullscreen"
            onClick={onToggleFullscreen}
          >
            <Minimize2 aria-hidden="true" size={30} />
          </button>
          <button
            className="standby-control-button"
            type="button"
            title={soundLabel}
            aria-label={soundLabel}
            data-testid="toggle-sound"
            onClick={onToggleSound}
          >
            {soundEnabled ? <Volume2 aria-hidden="true" size={30} /> : <VolumeX aria-hidden="true" size={30} />}
          </button>
        </div>
      ) : (
        <div className="fullscreen-controls" aria-label="大屏控制">
          <TimerControls
            mode={mode}
            status={status}
            isFocusMode
            soundEnabled={soundEnabled}
            isResetArmed={isResetArmed}
            compact
            onToggleRun={onToggleRun}
            onReset={onReset}
            onToggleFullscreen={onToggleFullscreen}
            onToggleSound={onToggleSound}
            onPreviewSound={onPreviewSound}
          />
        </div>
      )}
    </main>
  );
}
