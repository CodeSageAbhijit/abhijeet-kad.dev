const cues = {
  flip: { impact: [1650, 0.034, 0.19], tones: [[152, 77, 0, 0.035, 0.12, "triangle"]] },
  strike: { impact: [1270, 0.047, 0.25], tones: [[270, 135, 0, 0.04, 0.14, "triangle"]] },
  launch: { impact: [840, 0.10, 0.19], tones: [[128, 426, 0, 0.11, 0.14, "triangle"]] },
  bumper: { impact: [1900, 0.04, 0.11], tones: [[648, 440, 0, 0.095, 0.20, "triangle"], [1200, 930, 0, 0.055, 0.08, "sine"]] },
  sling: { impact: [1050, 0.035, 0.13], tones: [[380, 195, 0, 0.065, 0.15, "triangle"]] },
  target: { tones: [[523.25, 523.25, 0, 0.15, 0.16, "triangle"], [783.99, 783.99, 0.046, 0.11, 0.13, "sine"]] },
  bank: { tones: [[392, 392, 0.02, 0.22, 0.15, "triangle"], [587.33, 587.33, 0.085, 0.2, 0.14, "triangle"], [880, 880, 0.16, 0.29, 0.13, "sine"]] },
  save: { tones: [[392, 392, 0, 0.09, 0.12, "triangle"], [523.25, 523.25, 0.055, 0.18, 0.11, "triangle"]] },
  drain: { tones: [[228, 142, 0, 0.12, 0.15, "triangle"], [134, 85, 0.10, 0.19, 0.12, "sine"]] },
};

export function createPinballAudio() {
  let context;
  let output;
  let noise;
  let enabled = true;

  function envelope(start, duration, level) {
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + Math.min(0.006, duration * 0.3));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    gain.connect(output);
    return gain;
  }

  return {
    unlock() {
      if (!enabled) return;
      try {
        const AudioContext = window.AudioContext ?? window.webkitAudioContext;
        if (!AudioContext) return;
        if (!context) {
          context = new AudioContext();
          output = context.createGain();
          output.gain.value = 0.34;
          output.connect(context.destination);
          noise = context.createBuffer(1, Math.ceil(context.sampleRate * 0.12), context.sampleRate);
          const samples = noise.getChannelData(0);
          let seed = 193;
          for (let index = 0; index < samples.length; index++) {
            seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
            samples[index] = seed / 2147483648 - 1;
          }
        }
        if (context.state === "suspended") context.resume().catch(() => {});
      } catch {
        // The playfield is usable without Web Audio.
      }
    },
    setEnabled(on) {
      enabled = on;
      if (output) output.gain.value = on ? 0.34 : 0;
    },
    play(name) {
      const cue = cues[name];
      if (!enabled || context?.state !== "running" || !cue) return;
      const now = context.currentTime + 0.004;
      if (cue.impact) {
        const [hz, duration, level] = cue.impact;
        const tap = context.createBufferSource();
        const filter = context.createBiquadFilter();
        const gain = envelope(now, duration, level);
        tap.buffer = noise;
        filter.type = "bandpass";
        filter.frequency.value = hz;
        filter.Q.value = 0.72;
        tap.connect(filter).connect(gain);
        tap.start(now, 0, duration);
        tap.onended = () => { tap.disconnect(); filter.disconnect(); gain.disconnect(); };
      }
      for (const [first, last, delay, duration, level, type] of cue.tones) {
        const start = now + delay;
        const voice = context.createOscillator();
        const gain = envelope(start, duration, level);
        voice.type = type;
        voice.frequency.setValueAtTime(first, start);
        voice.frequency.exponentialRampToValueAtTime(last, start + duration);
        voice.connect(gain);
        voice.start(start);
        voice.stop(start + duration);
        voice.onended = () => { voice.disconnect(); gain.disconnect(); };
      }
    },
    dispose() {
      output?.disconnect();
      context?.close().catch(() => {});
    },
  };
}
