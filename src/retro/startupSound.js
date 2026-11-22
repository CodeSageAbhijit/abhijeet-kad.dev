/**
 * Windows XP Authentic Synthesized Sound Engine
 *
 * Recreates the exact, iconic Microsoft Windows XP soundscapes using the Web Audio API:
 * - Startup: The world-famous Bill Brown / Brian Eno ambient chord in F minor / Ab major
 * - Shutdown: The 4-tone descending sequence (G#4 -> D#4 -> G#3 -> A#3)
 * - UI Sounds: Click, Navigation, Error, Balloon Notify, Minimize, Restore, Close
 */

let context;
let activeSoundNodes = [];

export function unlockStartupSound() {
  try {
    const AudioContext = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContext) return;
    context ??= new AudioContext();
    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }
  } catch {
    // Audio optional fallback
  }
}

export function stopStartupSound() {
  activeSoundNodes.forEach((node) => {
    try {
      node.stop?.();
      node.disconnect?.();
    } catch {
      // Ignored
    }
  });
  activeSoundNodes = [];
}

export function releaseStartupSound() {
  stopStartupSound();
  if (context && context.state !== "closed") {
    context.close().catch(() => {});
  }
  context = undefined;
}

/* Cartoon voice playback is paused.
export async function playDesktopVoice(url, signal) {
  const audio = context;
  if (audio?.state !== "running" || signal.aborted) return;

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) return;
    const buffer = await audio.decodeAudioData(await response.arrayBuffer());
    if (signal.aborted || audio.state !== "running") return;

    const source = audio.createBufferSource();
    const volume = audio.createGain();
    source.buffer = buffer;
    volume.gain.value = 0.66;
    const stop = () => source.stop();
    signal.addEventListener("abort", stop, { once: true });
    source.onended = () => {
      signal.removeEventListener("abort", stop);
      source.disconnect();
      volume.disconnect();
    };
    source.connect(volume).connect(audio.destination);
    source.start();
  } catch {
    // Captions are available if voice playback is interrupted or unavailable.
  }
}
*/

/**
 * Windows XP Startup Sound:
 * F minor / Ab major tonal progression with lush synthetic pad harmonics.
 */
export function playStartupSound() {
  unlockStartupSound();
  if (!context || context.state !== "running") return;
  stopStartupSound();

  const now = context.currentTime + 0.05;
  const masterGain = context.createGain();
  masterGain.gain.setValueAtTime(0.35, now);
  masterGain.connect(context.destination);

  // Soft lowpass filter to produce the warm orchestral pad feel
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2400, now);
  filter.connect(masterGain);

  function scheduleNote(freq, startOffset, duration, gainLevel, type = "triangle", detune = 0) {
    const osc = context.createOscillator();
    const noteGain = context.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now + startOffset);
    if (detune) osc.detune.setValueAtTime(detune, now + startOffset);

    // Warm envelope
    noteGain.gain.setValueAtTime(0.0001, now + startOffset);
    noteGain.gain.linearRampToValueAtTime(gainLevel, now + startOffset + 0.12);
    noteGain.gain.setValueAtTime(gainLevel * 0.9, now + startOffset + duration - 0.4);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);

    osc.connect(noteGain);
    noteGain.connect(filter);

    osc.start(now + startOffset);
    osc.stop(now + startOffset + duration);

    activeSoundNodes.push(osc);
    osc.onended = () => {
      osc.disconnect();
      noteGain.disconnect();
    };
  }

  // Phase 1: Low ambient buildup / arpeggiated foundation
  scheduleNote(174.61, 0.00, 3.4, 0.32, "triangle"); // F3
  scheduleNote(174.61, 0.00, 3.4, 0.15, "sawtooth", 4);
  scheduleNote(261.63, 0.22, 3.2, 0.25, "sine");     // C4
  scheduleNote(349.23, 0.44, 3.0, 0.22, "sine");     // F4

  // Phase 2: Mid-range harmonic movement
  scheduleNote(207.65, 0.72, 2.8, 0.30, "triangle"); // Ab3
  scheduleNote(311.13, 0.95, 2.6, 0.28, "sine");     // Eb4
  scheduleNote(415.30, 1.15, 2.4, 0.22, "sine");     // Ab4

  // Phase 3: The triumphant resolution ("The XP Chord")
  const t3 = 1.48;
  const dur3 = 3.2;

  // Root & Fifth foundation
  scheduleNote(174.61, t3, dur3, 0.38, "triangle");     // F3
  scheduleNote(174.61, t3, dur3, 0.16, "sine", -3);
  scheduleNote(261.63, t3, dur3, 0.32, "sine");         // C4
  scheduleNote(261.63, t3, dur3, 0.12, "triangle", 3);

  // Warm Ab & F
  scheduleNote(207.65, t3, dur3, 0.30, "sine");         // Ab3
  scheduleNote(349.23, t3, dur3, 0.36, "sine");         // F4
  scheduleNote(349.23, t3, dur3, 0.15, "triangle", -2);

  // Shimmering High Harmonics
  scheduleNote(415.30, t3 + 0.02, dur3 - 0.02, 0.28, "sine"); // Ab4
  scheduleNote(523.25, t3 + 0.04, dur3 - 0.04, 0.24, "sine"); // C5
  scheduleNote(698.46, t3 + 0.06, dur3 - 0.06, 0.14, "sine"); // F5 sparkle

  setTimeout(() => {
    masterGain.disconnect();
    filter.disconnect();
  }, (t3 + dur3 + 0.5) * 1000);
}

/**
 * Windows XP Shutdown Sound:
 * Iconic 4-note descending warm melody: G#4 -> D#4 -> G#3 -> A#3
 */
export function playShutdownSound() {
  unlockStartupSound();
  if (!context || context.state !== "running") return;
  stopStartupSound();

  const now = context.currentTime + 0.05;
  const masterGain = context.createGain();
  masterGain.gain.setValueAtTime(0.32, now);
  masterGain.connect(context.destination);

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(900, now);
  filter.connect(masterGain);

  const notes = [
    { freq: 415.30, t: 0.00, dur: 0.70, gain: 0.28 }, // G#4
    { freq: 277.18, t: 0.48, dur: 0.72, gain: 0.30 }, // D#4
    { freq: 207.65, t: 0.98, dur: 0.85, gain: 0.32 }, // G#3
    { freq: 233.08, t: 1.50, dur: 1.40, gain: 0.35 }, // A#3 (resolving chord)
  ];

  notes.forEach(({ freq, t, dur, gain }) => {
    [0, 3].forEach((detune) => {
      const osc = context.createOscillator();
      const oscGain = context.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + t);
      osc.detune.setValueAtTime(detune, now + t);

      oscGain.gain.setValueAtTime(0.0001, now + t);
      oscGain.gain.linearRampToValueAtTime(gain, now + t + 0.08);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);

      osc.connect(oscGain);
      oscGain.connect(filter);

      osc.start(now + t);
      osc.stop(now + t + dur);

      activeSoundNodes.push(osc);
    });
  });

  // Deep subtle root note on resolution
  const subOsc = context.createOscillator();
  const subGain = context.createGain();
  subOsc.type = "sine";
  subOsc.frequency.setValueAtTime(116.54, now + 1.50); // A#2
  subGain.gain.setValueAtTime(0.0001, now + 1.50);
  subGain.gain.linearRampToValueAtTime(0.20, now + 1.58);
  subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.80);
  subOsc.connect(subGain);
  subGain.connect(filter);
  subOsc.start(now + 1.50);
  subOsc.stop(now + 2.80);
  activeSoundNodes.push(subOsc);

  setTimeout(() => {
    masterGain.disconnect();
    filter.disconnect();
  }, 3200);
}

/**
 * Windows XP UI navigation and window sounds
 */
export function playWindowSound(action) {
  if (!context || context.state !== "running") return;

  const now = context.currentTime;
  const out = context.createGain();
  out.connect(context.destination);

  if (action === "click") {
    // Windows XP Start menu / navigation click (short wooden tick)
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
    osc.connect(gain).connect(out);
    osc.start(now);
    osc.stop(now + 0.036);
  } else if (action === "notify") {
    // Windows XP Balloon Notification (two crisp ascending bell notes: F5 -> A5)
    [698.46, 880.00].forEach((freq, idx) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      const t = now + idx * 0.11;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      osc.connect(gain).connect(out);
      osc.start(t);
      osc.stop(t + 0.23);
    });
  } else if (action === "error") {
    // Windows XP Critical Stop / Error chord (Ding)
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    gain.gain.setValueAtTime(0.20, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc.connect(gain).connect(out);
    osc.start(now);
    osc.stop(now + 0.46);
  } else if (action === "open" || action === "restore") {
    // Subtle whoosh ascending
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc.connect(gain).connect(out);
    osc.start(now);
    osc.stop(now + 0.095);
  } else if (action === "minimize") {
    // Subtle falling tone
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.08);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc.connect(gain).connect(out);
    osc.start(now);
    osc.stop(now + 0.095);
  } else if (action === "close") {
    // Short dismiss tone
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.07);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc.connect(gain).connect(out);
    osc.start(now);
    osc.stop(now + 0.085);
  }
}
