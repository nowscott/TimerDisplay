import { Clock3, Hourglass, Timer, TimerReset } from "lucide-react";
import type { TimerMode } from "../types";

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

interface ModeDockProps {
  mode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
}

export function ModeDock({ mode, onModeChange }: ModeDockProps) {
  return (
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
          const isActive = mode === tab.mode;

          return (
            <button
              className={isActive ? "mode-tab mode-tab--active inline-flex items-center" : "mode-tab inline-flex items-center"}
              type="button"
              key={tab.mode}
              role="tab"
              aria-selected={isActive}
              data-testid={`mode-tab-${tab.mode}`}
              onClick={() => onModeChange(tab.mode)}
            >
              <Icon aria-hidden="true" size={18} />
              <span className="mode-tab__label">{tab.label}</span>
              <span className="mode-tab__detail">{tab.detail}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
