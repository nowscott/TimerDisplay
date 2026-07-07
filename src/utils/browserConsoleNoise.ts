const ASYNC_EXTENSION_RESPONSE_CLOSED =
  "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received";

export function isKnownBrowserConsoleNoise(reason: unknown): boolean {
  if (reason instanceof Error) {
    return reason.message === ASYNC_EXTENSION_RESPONSE_CLOSED;
  }

  if (typeof reason === "string") {
    return reason === ASYNC_EXTENSION_RESPONSE_CLOSED;
  }

  if (reason && typeof reason === "object" && "message" in reason) {
    return (reason as { message?: unknown }).message === ASYNC_EXTENSION_RESPONSE_CLOSED;
  }

  return false;
}

export function installBrowserConsoleNoiseFilter(): void {
  window.addEventListener("unhandledrejection", (event) => {
    if (isKnownBrowserConsoleNoise(event.reason)) {
      event.preventDefault();
    }
  });
}
