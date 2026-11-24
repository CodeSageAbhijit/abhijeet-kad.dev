import { useEffect, useRef, useState } from "react";
import { authenticatedClient } from "../spirits/api";
import "./fan.css";
import FanSculpture from "./FanSculpture";
import { fireConfetti } from "./confetti";

async function fanTotal(join) {
  const client = await authenticatedClient();
  const { data, error } = await client.rpc("portfolio_fan_total", { become_fan: join });
  if (error) throw error;
  return data;
}

function playCelebrationSound() {
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return;
  const ctx = new Audio();
  const t = ctx.currentTime;

  // 1. Initial click pop
  const pop = ctx.createOscillator();
  const popGain = ctx.createGain();
  pop.type = "sine";
  pop.frequency.setValueAtTime(880, t);
  pop.frequency.exponentialRampToValueAtTime(220, t + 0.12);
  popGain.gain.setValueAtTime(0.12, t);
  popGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
  pop.connect(popGain).connect(ctx.destination);
  pop.start(t);
  pop.stop(t + 0.15);

  // 2. Ascending celebration chime arpeggio (C5 -> E5 -> G5 -> C6 -> E6 shimmer)
  const notes = [
    { freq: 523.25, time: 0.04, dur: 0.28, vol: 0.08 }, // C5
    { freq: 659.25, time: 0.11, dur: 0.30, vol: 0.09 }, // E5
    { freq: 783.99, time: 0.18, dur: 0.35, vol: 0.10 }, // G5
    { freq: 1046.5, time: 0.25, dur: 0.45, vol: 0.12 }, // C6
    { freq: 1318.5, time: 0.32, dur: 0.55, vol: 0.08 }, // E6 shimmer
    { freq: 2093.0, time: 0.38, dur: 0.40, vol: 0.05 }, // C7 sparkle
  ];

  notes.forEach(({ freq, time, dur, vol }, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = index >= 4 ? "sine" : "triangle";
    osc.frequency.setValueAtTime(freq, t + time);

    gain.gain.setValueAtTime(0.0001, t + time);
    gain.gain.exponentialRampToValueAtTime(vol, t + time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + time + dur);

    osc.connect(gain).connect(ctx.destination);
    osc.start(t + time);
    osc.stop(t + time + dur);

    if (index === notes.length - 1) {
      osc.onended = () => ctx.close();
    }
  });
}

export default function FanButton() {
  const [total, setTotal] = useState(null);
  const [hasClicked, setHasClicked] = useState(false);
  const [pending, setPending] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [toast, setToast] = useState("");
  const version = useRef(0);

  useEffect(() => {
    const id = ++version.current;
    fanTotal(false)
      .then((n) => { if (id === version.current) setTotal(n); })
      .catch(() => { });
    return () => { version.current++; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  async function join(e) {
    if (pending) return;
    setHasClicked(true);
    setClickCount((n) => n + 1);
    const id = ++version.current;
    setPending(true);

    // Fire celebratory confetti from click position or button center
    const rect = e?.currentTarget?.getBoundingClientRect();
    const x = e?.clientX || (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
    const y = e?.clientY || (rect ? rect.top + rect.height / 2 : window.innerHeight / 2);
    fireConfetti(x, y);

    try {
      playCelebrationSound();
    } catch {
      /* Audio may be unavailable or blocked */
    }

    try {
      const n = await fanTotal(true);
      if (id === version.current) {
        setTotal(n);
        setToast("you're my fan now ♥");
      }
    } catch {
      if (id === version.current) setToast("couldn't update — try again");
    } finally {
      if (id === version.current) setPending(false);
    }
  }

  return (
    <div className="of-widget">
      {/* Title above the logo */}
      <h3 className="of-title">view my onlyfans 🔥</h3>

      {/* 3D interactive logo */}
      <button
        type="button"
        className="of-logo-btn"
        disabled={pending}
        onClick={join}
        aria-label="Click to become a fan"
      >
        <FanSculpture clicked={clickCount} />
      </button>

      {/* Info below the logo */}
      <div className="of-info">
        <span className="of-label">onlyfans</span>
        <span className="of-label">:</span>
        {hasClicked && total != null ? (
          <span className="of-count" role="status">
            <span className="of-count-num">{total.toLocaleString()}</span>
            <span className="of-count-word">{total === 1 ? "fan" : "fans"}</span>
          </span>
        ) : (
          <span className="of-cta">click to join</span>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <span key={clickCount} className="of-toast" role="status">
          {toast}
        </span>
      )}
    </div>
  );
}
