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

  return (
    <div className="timer-controls">
      <button
        className="control-button control-button--primary"
        type="button"
        data-testid="toggle-run"
        onClick={onToggleRun}
      >
        <PrimaryIcon aria-hidden="true" size={22} />
        <span>{primaryLabel}</span>
      </button>
      <button className="control-button" type="button" data-testid="reset-timer" onClick={onReset}>
        <RotateCcw aria-hidden="true" size={20} />
        <span>重置</span>
      </button>
      <button className="control-button" type="button" data-testid="toggle-fullscreen" onClick={onToggleFullscreen}>
        {isFocusMode ? <Minimize2 aria-hidden="true" size={20} /> : <Maximize2 aria-hidden="true" size={20} />}
        <span>{isFocusMode ? "退出大屏" : "进入大屏"}</span>
      </button>
      <button
        className="icon-button"
        type="button"
        title={soundEnabled ? "关闭声音" : "开启声音"}
        data-testid="toggle-sound"
        onClick={onToggleSound}
      >
        {soundEnabled ? <Volume2 aria-hidden="true" size={20} /> : <VolumeX aria-hidden="true" size={20} />}
      </button>
      <button className="icon-button" type="button" title="试听提示音" data-testid="preview-sound" onClick={onPreviewSound}>
        <Waves aria-hidden="true" size={20} />
      </button>
    </div>
  );
}
