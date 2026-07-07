import { describe, expect, it } from "vitest";
import { isKnownBrowserConsoleNoise } from "./browserConsoleNoise";

const extensionMessage =
  "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received";

describe("isKnownBrowserConsoleNoise", () => {
  it("matches the Chrome extension async response rejection", () => {
    expect(isKnownBrowserConsoleNoise(new Error(extensionMessage))).toBe(true);
    expect(isKnownBrowserConsoleNoise(extensionMessage)).toBe(true);
    expect(isKnownBrowserConsoleNoise({ message: extensionMessage })).toBe(true);
  });

  it("does not match unrelated errors", () => {
    expect(isKnownBrowserConsoleNoise(new Error("real app error"))).toBe(false);
    expect(isKnownBrowserConsoleNoise({ message: "real app error" })).toBe(false);
    expect(isKnownBrowserConsoleNoise(null)).toBe(false);
  });
});
