type TimerSoundKind = "reminder" | "timeout";

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const audioWindow = window as AudioWindow;
  const AudioContextConstructor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
  if (!AudioContextConstructor) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextConstructor();
  }

  return audioContext;
}

function scheduleTone(context: AudioContext, frequency: number, startAt: number, duration: number, volume: number): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.03);
}

export async function playTimerSound(kind: TimerSoundKind = "reminder"): Promise<boolean> {
  const context = getAudioContext();
  if (!context) {
    return false;
  }

  if (context.state === "suspended") {
    await context.resume();
  }

  const now = context.currentTime;
  if (kind === "timeout") {
    scheduleTone(context, 784, now, 0.16, 0.18);
    scheduleTone(context, 523, now + 0.2, 0.18, 0.2);
    scheduleTone(context, 784, now + 0.44, 0.22, 0.18);
    return true;
  }

  scheduleTone(context, 880, now, 0.13, 0.16);
  scheduleTone(context, 1175, now + 0.17, 0.13, 0.14);
  return true;
}
