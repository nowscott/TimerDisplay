import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Minimize2, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import type { TimerPhase, TimerStatus } from "../types";
import { formatClock } from "../utils/time";
import { TimerControls } from "./TimerControls";

interface FullscreenViewProps {
  title: string;
  remainingSeconds: number;
  totalSeconds: number;
  phase: TimerPhase;
  status: TimerStatus;
  soundEnabled: boolean;
  showCurrentTime: boolean;
  showProgress: boolean;
  isResetArmed: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  onToggleSound: () => void;
  onPreviewSound: () => void;
}

function formatCurrentTime(): string {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function FullscreenView({
  title,
  remainingSeconds,
  totalSeconds,
  phase,
  status,
  soundEnabled,
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
  const timeText =
    remainingSeconds < 0 ? `+${formatClock(visibleSeconds, forceHours)}` : formatClock(visibleSeconds, forceHours);
  const elapsedSeconds = Math.max(0, totalSeconds - remainingSeconds);
  const elapsedText = formatClock(elapsedSeconds, forceHours || elapsedSeconds >= 3600);
  const remainingLabel = remainingSeconds < 0 ? "已超时" : "剩余";
  const remainingText =
    remainingSeconds < 0
      ? `+${formatClock(Math.abs(remainingSeconds), forceHours)}`
      : formatClock(remainingSeconds, forceHours);
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
  const [currentTime, setCurrentTime] = useState(() => formatCurrentTime());
  const [visualElapsedProgress, setVisualElapsedProgress] = useState(elapsedProgress);
  const [isChromeVisible, setIsChromeVisible] = useState(true);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const chromeHideTimeoutRef = useRef<number | null>(null);
  const PrimaryIcon = status === "running" ? Pause : Play;
  const primaryLabel =
    status === "running" ? "暂停" : status === "paused" ? "继续" : status === "finished" ? "重新开始" : "开始计时";
  const resetLabel = isResetArmed ? "确认取消计时" : "取消计时";
  const soundLabel = soundEnabled ? "关闭声音" : "开启声音";
  const progressStyle = { "--fullscreen-progress": `${visualElapsedProgress}%` } as CSSProperties;

  function syncTextContrastProgress(progress: number): void {
    if (!showProgress || typeof window === "undefined") {
      return;
    }

    const fillEdge = window.innerWidth * (progress / 100);

    [titleRef.current, timeRef.current].forEach((element) => {
      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const overlapPercent = rect.width > 0 ? ((fillEdge - rect.left) / rect.width) * 100 : 0;
      const clampedPercent = Math.max(0, Math.min(100, overlapPercent));
      element.style.setProperty("--text-progress", `${clampedPercent}%`);
    });
  }

  useEffect(() => {
    if (!showCurrentTime) {
      return;
    }

    const intervalId = window.setInterval(() => setCurrentTime(formatCurrentTime()), 1000);
    return () => window.clearInterval(intervalId);
  }, [showCurrentTime]);

  useEffect(() => {
    if (!showProgress || status !== "running") {
      setVisualElapsedProgress(elapsedProgress);
      return;
    }

    const syncedAt = performance.now();
    const syncedRemainingSeconds = remainingSeconds;
    let animationFrameId = 0;

    const updateProgress = (timestamp: number) => {
      const elapsedSinceSync = (timestamp - syncedAt) / 1000;
      const preciseRemainingSeconds = syncedRemainingSeconds - elapsedSinceSync;
      const nextProgress = Math.max(
        0,
        Math.min(100, ((totalSeconds - Math.max(0, preciseRemainingSeconds)) / totalSeconds) * 100)
      );

      setVisualElapsedProgress(nextProgress);
      animationFrameId = window.requestAnimationFrame(updateProgress);
    };

    animationFrameId = window.requestAnimationFrame(updateProgress);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [elapsedProgress, remainingSeconds, showProgress, status, totalSeconds]);

  useEffect(() => {
    syncTextContrastProgress(visualElapsedProgress);
  });

  useEffect(() => {
    if (!showProgress) {
      return;
    }

    const handleResize = () => syncTextContrastProgress(visualElapsedProgress);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showProgress, visualElapsedProgress]);

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
      className={`fullscreen-view fullscreen-view--${phase} ${showProgress ? "fullscreen-view--with-progress" : ""} ${
        isChromeVisible ? "" : "fullscreen-view--chrome-hidden"
      }`}
      style={showProgress ? progressStyle : undefined}
    >
      {showCurrentTime ? (
        <div className="fullscreen-clock" aria-label="当前时间" data-testid="fullscreen-current-time">
          {currentTime}
        </div>
      ) : null}
      <section className="fullscreen-timer" aria-label="大屏倒计时">
        <h1 className="fullscreen-title" data-testid="fullscreen-title" ref={titleRef}>
          {title}
        </h1>
        <div className="fullscreen-time" aria-live="polite" data-testid="time-display" ref={timeRef}>
          {timeText}
        </div>
        <div className="fullscreen-meta" aria-label="计时概览">
          <span className="fullscreen-meta-item" data-testid="timer-elapsed">
            <span className="fullscreen-meta-label">已进行</span>
            <span className="fullscreen-meta-number">{elapsedText}</span>
          </span>
          <span className="fullscreen-meta-item" data-testid="timer-remaining">
            <span className="fullscreen-meta-label">{remainingLabel}</span>
            <span className="fullscreen-meta-number">{remainingText}</span>
          </span>
        </div>
      </section>
      {showProgress ? (
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
      {showProgress ? (
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
