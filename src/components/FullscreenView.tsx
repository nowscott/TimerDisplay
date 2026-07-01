import type { TimerPhase, TimerStatus } from "../types";
import { TimerControls } from "./TimerControls";
import { TimerDisplay } from "./TimerDisplay";

interface FullscreenViewProps {
  title: string;
  remainingSeconds: number;
  totalSeconds: number;
  phase: TimerPhase;
  status: TimerStatus;
  statusText: string;
  secondaryText: string;
  soundEnabled: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  onToggleSound: () => void;
  onPreviewSound: () => void;
}

export function FullscreenView({
  title,
  remainingSeconds,
  totalSeconds,
  phase,
  status,
  statusText,
  secondaryText,
  soundEnabled,
  onToggleRun,
  onReset,
  onToggleFullscreen,
  onToggleSound,
  onPreviewSound,
}: FullscreenViewProps) {
  return (
    <main className="fullscreen-view">
      <TimerDisplay
        title={title}
        remainingSeconds={remainingSeconds}
        totalSeconds={totalSeconds}
        phase={phase}
        statusText={statusText}
        secondaryText={secondaryText}
        isFocusMode
      />
      <TimerControls
        status={status}
        isFocusMode
        soundEnabled={soundEnabled}
        onToggleRun={onToggleRun}
        onReset={onReset}
        onToggleFullscreen={onToggleFullscreen}
        onToggleSound={onToggleSound}
        onPreviewSound={onPreviewSound}
      />
    </main>
  );
}
