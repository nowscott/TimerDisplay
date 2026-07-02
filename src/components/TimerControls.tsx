import {
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Waves,
} from "lucide-react";
import type { TimerStatus } from "../types";

interface TimerControlsProps {
  status: TimerStatus;
  isFocusMode: boolean;
  soundEnabled: boolean;
  isResetArmed: boolean;
  compact?: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  onToggleSound: () => void;
  onPreviewSound: () => void;
}

export function TimerControls({
  status,
  isFocusMode,
  soundEnabled,
  isResetArmed,
  compact = false,
  onToggleRun,
  onReset,
  onToggleFullscreen,
  onToggleSound,
  onPreviewSound,
}: TimerControlsProps) {
  const isRunning = status === "running";
  const primaryLabel =
    status === "running" ? "暂停" : status === "paused" ? "继续" : status === "finished" ? "重新开始" : "开始计时";
  const PrimaryIcon = isRunning ? Pause : Play;
  const resetLabel = isResetArmed ? "确认重置" : "重置";
  const fullscreenLabel = isFocusMode ? "退出大屏" : "进入大屏";
  const soundLabel = soundEnabled ? "关闭声音" : "开启声音";

  return (
    <div className={compact ? "timer-controls timer-controls--compact" : "timer-controls"}>
      <button
        className="control-button control-button--primary"
        type="button"
        title={primaryLabel}
        aria-label={primaryLabel}
        data-testid="toggle-run"
        onClick={onToggleRun}
      >
        <PrimaryIcon aria-hidden="true" size={22} />
        <span className="control-label">{primaryLabel}</span>
      </button>
      <button
        className={isResetArmed ? "control-button control-button--danger" : "control-button"}
        type="button"
        title={resetLabel}
        aria-label={resetLabel}
        data-testid="reset-timer"
        onClick={onReset}
      >
        <RotateCcw aria-hidden="true" size={20} />
        <span className="control-label">{resetLabel}</span>
      </button>
      <button
        className="control-button"
        type="button"
        title={fullscreenLabel}
        aria-label={fullscreenLabel}
        data-testid="toggle-fullscreen"
        onClick={onToggleFullscreen}
      >
        {isFocusMode ? <Minimize2 aria-hidden="true" size={20} /> : <Maximize2 aria-hidden="true" size={20} />}
        <span className="control-label">{fullscreenLabel}</span>
      </button>
      <button
        className="icon-button"
        type="button"
        title={soundLabel}
        aria-label={soundLabel}
        data-testid="toggle-sound"
        onClick={onToggleSound}
      >
        {soundEnabled ? <Volume2 aria-hidden="true" size={20} /> : <VolumeX aria-hidden="true" size={20} />}
      </button>
      {!compact ? (
        <button
          className="icon-button"
          type="button"
          title="试听提示音"
          aria-label="试听提示音"
          data-testid="preview-sound"
          onClick={onPreviewSound}
        >
          <Waves aria-hidden="true" size={20} />
        </button>
      ) : null}
    </div>
  );
}
