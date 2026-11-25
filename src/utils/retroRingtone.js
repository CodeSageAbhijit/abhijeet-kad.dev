// Pure WebAudio synthesizer for Nokia 3310, classic Landline twin-bell ringtone, CRT slaps, and bug-squash SFX

let activeNodes = [];
let activeCtx = null;
let ringtoneIndex = 0;

function getAudioContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!activeCtx || activeCtx.state === "closed") {
    activeCtx = new AudioCtx();
  }
  if (activeCtx.state === "suspended") {
    activeCtx.resume().catch(() => {});
  }
  return activeCtx;
}

export function stopRingtone() {
  for (const node of activeNodes) {
    try {
      node.stop?.();
      node.disconnect?.();
    } catch {
      // Ignore already stopped nodes
    }
  }
  activeNodes = [];
}

// Classic Nokia 3310 (Gran Vals) monophonic piezo ringtone
const NOKIA_TUNE = [
  [659.25, 0.14], // E5
  [587.33, 0.14], // D5
  [369.99, 0.28], // F#4
  [415.30, 0.28], // G#4
  [554.37, 0.14], // C#5
  [493.88, 0.14], // B4
  [293.66, 0.28], // D4
  [329.63, 0.28], // E4
  [493.88, 0.14], // B4
  [440.00, 0.14], // A4
  [277.18, 0.28], // C#4
  [329.63, 0.28], // E4
  [440.00, 0.45], // A4
];

function playMonoSequence(notes, { wave = "square", volume = 0.013 } = {}) {
  stopRingtone();
  const ctx = getAudioContext();
  if (!ctx) return 0;

  let cursor = ctx.currentTime + 0.03;
  for (const [freq, dur] of notes) {
    if (freq > 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, cursor);

      gain.gain.setValueAtTime(0.0001, cursor);
      gain.gain.linearRampToValueAtTime(volume, cursor + 0.012);
      gain.gain.setValueAtTime(volume * 0.85, cursor + dur * 0.75);
      gain.gain.exponentialRampToValueAtTime(0.0001, cursor + dur * 0.95);

      osc.connect(gain).connect(ctx.destination);
      osc.start(cursor);
      osc.stop(cursor + dur);
      activeNodes.push(osc, gain);
    }
    cursor += dur;
  }

  return Math.round((cursor - ctx.currentTime) * 1000);
}

// Classic MTNL / BSNL twin-bell landline telephone ring ("Trrring-Trrring ... Trrring-Trrring")
function playLandlineRing() {
  stopRingtone();
  const ctx = getAudioContext();
  if (!ctx) return 0;

  const t0 = ctx.currentTime + 0.04;
  // Indian / Commonwealth double-ring cadence: [ring 0.42s, gap 0.20s, ring 0.42s], repeat after pause
  const bursts = [
    [0.00, 0.42],
    [0.62, 0.42],
    [2.05, 0.42],
    [2.67, 0.42],
  ];

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1400;
  filter.Q.value = 0.9;
  filter.connect(ctx.destination);
  activeNodes.push(filter);

  for (const [offset, dur] of bursts) {
    const start = t0 + offset;
    const end = start + dur;

    // Hammer strike chatter modulator (~24 Hz telephone clapper rattle)
    const rattle = ctx.createOscillator();
    const rattleDepth = ctx.createGain();
    const ringEnv = ctx.createGain();

    rattle.type = "square";
    rattle.frequency.setValueAtTime(24, start);
    rattleDepth.gain.setValueAtTime(0.011, start);

    ringEnv.gain.setValueAtTime(0.014, start);
    ringEnv.gain.setValueAtTime(0.014, end - 0.03);
    ringEnv.gain.exponentialRampToValueAtTime(0.0001, end);

    rattle.connect(rattleDepth).connect(ringEnv.gain);
    ringEnv.connect(filter);

    // Metallic twin-bell resonant partials
    for (const [freq, weight] of [[960, 0.9], [1285, 0.65], [1920, 0.35]]) {
      const bell = ctx.createOscillator();
      const bellMix = ctx.createGain();
      bell.type = "triangle";
      bell.frequency.setValueAtTime(freq, start);
      bellMix.gain.setValueAtTime(weight, start);
      bell.connect(bellMix).connect(ringEnv);
      bell.start(start);
      bell.stop(end + 0.01);
      activeNodes.push(bell, bellMix);
    }

    rattle.start(start);
    rattle.stop(end + 0.01);
    activeNodes.push(rattle, rattleDepth, ringEnv);
  }

  return 3200;
}

export function playNextRingtone() {
  const choice = ringtoneIndex % 2;
  ringtoneIndex += 1;
  if (choice === 0) {
    const durationMs = playMonoSequence(NOKIA_TUNE, { wave: "square", volume: 0.013 });
    return { id: "nokia", label: "Nokia 3310 Classic Tune", durationMs };
  }
  const durationMs = playLandlineRing();
  return { id: "landline", label: "Classic Landline Telephone Ring", durationMs };
}

export function playBugSquashSfx() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(520, t);
  osc.frequency.exponentialRampToValueAtTime(140, t + 0.09);
  gain.gain.setValueAtTime(0.055, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.095);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.1);
}

export function playVictoryFanfare() {
  playMonoSequence(
    [
      [523.25, 0.11],
      [659.25, 0.11],
      [783.99, 0.11],
      [1046.50, 0.3],
    ],
    { wave: "triangle", volume: 0.022 }
  );
}

export function playCrtStaticBurst(durationSec = 0.25, volume = 0.03) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const sampleCount = Math.floor(ctx.sampleRate * durationSec);
  const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.8;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800;
  filter.Q.value = 0.7;

  const gain = ctx.createGain();
  const t = ctx.currentTime;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + durationSec);

  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(t);
}

export function playMonitorSmackSfx(hitNumber = 1) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  const thump = ctx.createOscillator();
  const thumpGain = ctx.createGain();
  thump.type = "sine";
  thump.frequency.setValueAtTime(155 + hitNumber * 12, t);
  thump.frequency.exponentialRampToValueAtTime(42, t + 0.16);
  thumpGain.gain.setValueAtTime(0.22, t);
  thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.17);
  thump.connect(thumpGain).connect(ctx.destination);
  thump.start(t);
  thump.stop(t + 0.18);

  playCrtStaticBurst(0.11, 0.045);
}

export function playCrtRestoreSfx() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  const hum = ctx.createOscillator();
  const humGain = ctx.createGain();
  hum.type = "sawtooth";
  hum.frequency.setValueAtTime(110, t);
  hum.frequency.exponentialRampToValueAtTime(60, t + 0.35);
  humGain.gain.setValueAtTime(0.045, t);
  humGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
  hum.connect(humGain).connect(ctx.destination);
  hum.start(t);
  hum.stop(t + 0.4);

  const chime = ctx.createOscillator();
  const chimeGain = ctx.createGain();
  chime.type = "triangle";
  chime.frequency.setValueAtTime(880, t + 0.08);
  chime.frequency.setValueAtTime(1174.66, t + 0.2);
  chimeGain.gain.setValueAtTime(0.001, t + 0.08);
  chimeGain.gain.linearRampToValueAtTime(0.035, t + 0.11);
  chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
  chime.connect(chimeGain).connect(ctx.destination);
  chime.start(t + 0.08);
  chime.stop(t + 0.46);
}
