import { useEffect, useRef, useState } from "react";
import { playDesktopVoice, unlockStartupSound } from "./startupSound";

export const cartoonCameos = {
  welcome: {
    character: "Shinchan",
    asset: "shinchan",
    line: "अरे वाह! इतना पुराना कंप्यूटर, फिर भी मेरे बहानों से तेज़!",
  },
  projects: {
    character: "Doraemon",
    asset: "doraemon",
    line: "मेरी जेब में सौ गैजेट हैं। एक भी ऐसा नहीं जो मेरे लिए कोड लिख दे!",
  },
  experience: {
    character: "Kiteretsu",
    asset: "kiteretsu",
    line: "पचास से ज़्यादा पुल रिक्वेस्ट? मेरी नोटबुक में तो इतने पन्ने भी नहीं हैं!",
  },
  contact: {
    character: "Shishimaru",
    asset: "shishimaru",
    line: "मैसेज में लिख देना कि मीटिंग में समोसे भी होने चाहिए!",
  },
  github: {
    character: "Amara",
    asset: "amara",
    line: "मैं कोड छुपाने आया था। GitHub पर तो खुद ही सबको दिखा दिया!",
  },
};

const mediaBase = `${import.meta.env.BASE_URL}retro/cameos/`;

export default function RetroCameo({ scene, sound, onDismiss }) {
  const { character, asset, line } = cartoonCameos[scene];
  const [replays, setReplays] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const video = useRef(null);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const controller = new AbortController();
    // The welcome line leaves room for the XP startup chime.
    const delay = replays ? 0 : scene === "welcome" ? 2700 : 550;
    const timer = setTimeout(async () => {
      if (sound) await playDesktopVoice(`${mediaBase}${asset}.mp3`, controller.signal);
      if (controller.signal.aborted || !video.current) return;
      video.current.currentTime = 0;
      video.current.play().catch(() => {});
    }, delay);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [asset, replays, scene, sound]);

  useEffect(() => {
    const timer = setTimeout(onDismiss, scene === "welcome" && !replays ? 11000 : 9000);
    return () => clearTimeout(timer);
  }, [onDismiss, replays, scene]);

  function checkTransparency(event) {
    // Some WebM decoders render the transparent areas as opaque black.
    const clip = event.currentTarget;
    function checkFrame() {
      const canvas = document.createElement("canvas");
      canvas.width = 2;
      canvas.height = 1;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(clip, 0, 0, 1, 1, 0, 0, 1, 1);
      context.drawImage(clip, clip.videoWidth / 2, clip.videoHeight / 2, 1, 1, 1, 0, 1, 1);
      const pixels = context.getImageData(0, 0, 2, 1).data;
      setVideoReady(pixels[3] === 0 && pixels[7] > 128);
    }
    if (clip.requestVideoFrameCallback) clip.requestVideoFrameCallback(checkFrame);
    else checkFrame();
  }

  function replay() {
    unlockStartupSound();
    setReplays((count) => count + 1);
  }

  return (
    <aside className="retro-cameo" aria-label={`${character} cartoon cameo`}>
      <div className="retro-cameo-bubble">
        <div className="retro-cameo-heading">
          <strong>{character}</strong>
          {sound && (
            <button type="button" onClick={replay} aria-label={`Play ${character}'s dialogue`} title="Play Hindi dialogue">▶</button>
          )}
          <button type="button" onClick={onDismiss} aria-label="Dismiss cartoon cameo" title="Dismiss cartoon cameo">×</button>
        </div>
        <p lang="hi" role="status">{line}</p>
      </div>
      <div className="retro-cameo-art" aria-hidden="true">
        {(!videoReady || reducedMotion) && <img src={`${mediaBase}${asset}.webp`} alt="" />}
        {!reducedMotion && (
          <video
            ref={video}
            className={videoReady ? "is-ready" : ""}
            src={`${mediaBase}${asset}.webm`}
            muted
            playsInline
            preload="auto"
            onPlaying={checkTransparency}
            onError={() => setVideoReady(false)}
          />
        )}
      </div>
    </aside>
  );
}
