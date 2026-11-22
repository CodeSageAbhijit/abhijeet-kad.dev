const SAMPLE_LENGTH = 0.14;
let recording;

export function preloadKeyClicks() {
  recording ??= fetch(`${import.meta.env.BASE_URL}the_pc/model-m-taps.wav`).then((response) => {
    if (!response.ok) throw new Error("Could not load the keyboard recording");
    return response.arrayBuffer();
  });
  recording.catch(() => { recording = undefined; });
  return recording;
}

export function createKeyClick() {
  const AudioContext = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContext) return null;

  const context = new AudioContext();
  const volume = context.createGain();
  volume.gain.value = 0.48;
  volume.connect(context.destination);
  const audio = preloadKeyClicks().then((buffer) => context.decodeAudioData(buffer.slice(0)));
  audio.catch(() => {});
  let last = -1;

  return {
    play(key) {
      const heavy = key === " " || key === "Enter" || key === "Backspace";
      last = heavy ? 4 : (last + 1) % 4;
      const offset = last * SAMPLE_LENGTH;
      const activation = context.state === "suspended" ? context.resume() : Promise.resolve();
      Promise.all([activation, audio]).then(([, buffer]) => {
        if (context.state !== "running") return;
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(volume);
        source.onended = () => source.disconnect();
        source.start(0, offset, SAMPLE_LENGTH);
      }).catch(() => {});
    },
    dispose() {
      volume.disconnect();
      if (context.state !== "closed") context.close().catch(() => {});
    },
  };
}
