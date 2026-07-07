import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "./time";
import { getSecondaryText, getStatusText, getTimerPhase } from "./timerPresentation";

describe("timer presentation rules", () => {
  it("maps countdown thresholds to normal, warning, danger, and overtime phases", () => {
    expect(getTimerPhase(DEFAULT_SETTINGS, 10 * 60, "running")).toBe("normal");
    expect(getTimerPhase(DEFAULT_SETTINGS, 2 * 60, "running")).toBe("warning");
    expect(getTimerPhase(DEFAULT_SETTINGS, 30, "running")).toBe("danger");
    expect(getTimerPhase(DEFAULT_SETTINGS, 0, "running")).toBe("overtime");
    expect(getTimerPhase(DEFAULT_SETTINGS, 0, "finished")).toBe("finished");
  });

  it("does not apply countdown phases to countup or clock modes", () => {
    expect(getTimerPhase({ ...DEFAULT_SETTINGS, mode: "countup" }, 0, "running")).toBe("normal");
    expect(getTimerPhase({ ...DEFAULT_SETTINGS, mode: "clock" }, 0, "running")).toBe("normal");
  });

  it("returns mode-aware status and secondary text", () => {
    expect(getStatusText("countdown", "running", "warning")).toBe("提醒阶段");
    expect(getStatusText("countdown", "running", "overtime")).toBe("已超时");
    expect(getStatusText("countup", "paused", "normal")).toBe("已暂停");
    expect(getStatusText("clock", "idle", "normal")).toBe("实时时钟");

    expect(getSecondaryText("countdown", "running", -5, 0, 15 * 60)).toBe("已超时 +00:05");
    expect(getSecondaryText("countup", "paused", 0, 75, 15 * 60)).toBe("暂停在 01:15");
    expect(getSecondaryText("clock", "idle", 0, 0, 15 * 60)).toBe("适合课间、会议间歇和投屏待机");
  });
});
