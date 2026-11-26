/**
 * Lightweight Web Audio synthesizer for Tech Stack interactions.
 * Lazy-initializes AudioContext only on user gesture and cleans up cleanly.
 */
export function createTechSoundEngine() {
  if (typeof window === "undefined") {
    return {
      playOrganize: () => {},
      playFloat: () => {},
      playInspect: () => {},
      playSurprise: () => {},
      playMagnetHold: () => {},
      playShockwave: () => {},
      dispose: () => {},
    };
  }

  let ctx = null;

  const prime = () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  };

  const playTone = (freq, duration, { type = "sine", gain = 0.08, endFreq = freq, delay = 0 } = {}) => {
    const c = prime();
    if (!c) return;
    const now = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(gain, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(g);
    g.connect(c.destination);
    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
    osc.start(now);
    osc.stop(now + duration + 0.02);
  };

  return {
    playOrganize() {
      // Crisp rising magnetic snap chord
      [392, 523.25, 659.25].forEach((freq, i) => {
        playTone(freq, 0.16, { type: "triangle", gain: 0.065, delay: i * 0.04 });
      });
    },
    playFloat() {
      // Soft descending zero-G release sweep
      playTone(460, 0.22, { type: "sine", gain: 0.075, endFreq: 196 });
    },
    playInspect(index = 0) {
      // Subtle glass pitch mapped along a chromatic step per tech
      const freq = 330 * Math.pow(2, (index % 15) / 12);
      playTone(freq, 0.15, { type: "sine", gain: 0.075, endFreq: freq * 1.04 });
    },
    playSurprise() {
      // Playful arcade fortune-orb sparkle chime
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        playTone(freq, 0.24, { type: "sine", gain: 0.08, endFreq: freq * 1.03, delay: i * 0.05 });
      });
    },
    playMagnetHold() {
      // Low rising magnetic swirl hum
      playTone(130, 0.28, { type: "sine", gain: 0.07, endFreq: 260 });
    },
    playShockwave() {
      // Punchy sub-drop + airy burst
      playTone(210, 0.24, { type: "triangle", gain: 0.11, endFreq: 52 });
      playTone(720, 0.14, { type: "sine", gain: 0.04, endFreq: 320, delay: 0.02 });
    },
    dispose() {
      if (ctx && ctx.state !== "closed") {
        ctx.close().catch(() => {});
      }
      ctx = null;
    },
  };
}
