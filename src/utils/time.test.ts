import { describe, expect, it } from "vitest";
import type { TimerSettings } from "../types";
import {
  DEFAULT_SETTINGS,
  durationFromParts,
  formatClock,
  formatClockWithMilliseconds,
  getModeSwitchTitle,
  normalizeSettings,
} from "./time";

describe("time utilities", () => {
  it("formats durations with and without hours", () => {
    expect(formatClock(65)).toBe("01:05");
    expect(formatClock(65, true)).toBe("00:01:05");
    expect(formatClockWithMilliseconds(65.432)).toBe("01:05.432");
  });

  it("clamps duration parts into the supported timer range", () => {
    expect(durationFromParts(30, 90, 90)).toBe(23 * 60 * 60 + 59 * 60 + 59);
    expect(durationFromParts(0, 0, 0)).toBe(1);
  });

  it("normalizes persisted settings into a complete safe shape", () => {
    const rawSettings: TimerSettings = {
      ...DEFAULT_SETTINGS,
      title: "  ",
      totalSeconds: Number.NaN,
      reminders: [{ id: "", label: "", seconds: -10, enabled: true }],
      soundEnabled: false,
      allowOvertime: false,
      showMilliseconds: true,
      showCurrentTimeInFullscreen: false,
      showFullscreenProgress: false,
      preventDisplaySleep: false,
    };

    const normalizedSettings = normalizeSettings(rawSettings);

    expect(normalizedSettings.title).toBe(DEFAULT_SETTINGS.title);
    expect(normalizedSettings.totalSeconds).toBe(DEFAULT_SETTINGS.totalSeconds);
    expect(normalizedSettings.reminders[0]).toMatchObject({
      id: "reminder-3-minutes",
      label: "剩余3分钟",
      seconds: 0,
      enabled: false,
    });
    expect(normalizedSettings.showMilliseconds).toBe(true);
    expect(normalizedSettings.preventDisplaySleep).toBe(false);
  });

  it("keeps custom titles but adapts preset countdown titles when switching modes", () => {
    expect(getModeSwitchTitle("会议发言计时", "countup")).toBe("会议发言");
    expect(getModeSwitchTitle("自定义环节", "clock")).toBe("自定义环节");
    expect(getModeSwitchTitle("现场计时", "clock")).toBe("现场时钟");
  });
});
