import React, { useEffect, useRef, useState } from "react";
import emailjs from "@emailjs/browser";

import { styles } from "../styles";
import { playRelayPingSound } from "./canvas/Earth";
import { markEasterEggFound, track } from "../utils/analytics";
import {
  launchGlobalEarthSignal,
  setEarthLockTelemetry,
  setEarthVisitorStatus,
} from "../utils/earthRelay";

const CHANNELS = [
  {
    id: "hire",
    label: "HIRE / ROLE",
    freq: "142.8 MHz",
    placeholder: "Role, engineering team, timeline, or interview slots...",
  },
  {
    id: "collab",
    label: "BUILD / COLLAB",
    freq: "218.4 MHz",
    placeholder: "What are we building, shipping, or hacking on together?",
  },
  {
    id: "hello",
    label: "DIRECT SIGNAL",
    freq: "096.2 MHz",
    placeholder: "Drop a thought, question, or quick hello across continents...",
  },
];

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

export default function ContactUplinkForm({ compact = false }) {
  const formRef = useRef();
  const [channelId, setChannelId] = useState("hire");
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [txStage, setTxStage] = useState("");
  const [statusLog, setStatusLog] = useState(null);

  const activeChannel = CHANNELS.find((c) => c.id === channelId) || CHANNELS[0];

  const nameLocked = form.name.trim().length >= 2;
  const emailLocked = isValidEmail(form.email);
  const msgLocked = form.message.trim().length >= 6;
  const lockedCount = Number(nameLocked) + Number(emailLocked) + Number(msgLocked);
  const lockProgress = lockedCount / 3;

  const prevLockRef = useRef(0);
  useEffect(() => {
    setEarthLockTelemetry(lockProgress, activeChannel.label);
    if (lockedCount > prevLockRef.current && lockedCount > 0) {
      playRelayPingSound("lock");
    }
    prevLockRef.current = lockedCount;
  }, [lockProgress, lockedCount, activeChannel.label]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setEarthVisitorStatus("composing");
  };

  const handleChannelSelect = (id) => {
    setChannelId(id);
    playRelayPingSound("lock");
    track("Contact Frequency Selected", { channel: id });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameLocked || !emailLocked || !msgLocked) {
      setStatusLog({
        ok: false,
        text: "Target lock incomplete — verify Callsign (2+ chars), valid Email, and Payload (6+ chars).",
      });
      return;
    }

    setLoading(true);
    setStatusLog(null);
    setTxStage("TRIANGULATING NODE...");

    let stageTimer = null;
    let timeoutTimer = null;

    try {
      playRelayPingSound("contact");
      const beam = await launchGlobalEarthSignal("contact");
      markEasterEggFound("global_earth_signal_beam", "contact_submit");
      track("Earth Signal Launched", {
        kind: "contact_form",
        channel: channelId,
        from_city: beam.from.city,
        from_country: beam.from.country,
        from_continent: beam.from.continent,
        distance_km: beam.distanceKm,
        local_bounce: Boolean(beam.isLocalBounce),
      });

      const nextStage = beam.isLocalBounce
        ? "BOUNCING VIA SAT-04 → MUMBAI..."
        : "ROUTING VIA ORBIT → MUMBAI...";
      stageTimer = setTimeout(() => setTxStage(nextStage), 350);

      const serviceId = import.meta.env.VITE_APP_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY;
      const hasEmailJsConfig = Boolean(serviceId && templateId && publicKey);
      const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

      const hopSummary = beam.isLocalBounce
        ? "SAT-04 orbit bounce"
        : `${beam.distanceKm.toLocaleString()} km`;

      if (!hasEmailJsConfig) {
        if (isLocalhost) {
          // Let the 3D beam animation play across orbit in local dev instead of hanging on missing keys
          await new Promise((resolve) => setTimeout(resolve, 1550));
          track("Contact Initiated", { method: "contact_form_local_preview", channel: channelId });
          setStatusLog({
            ok: true,
            text: `Localhost relay simulation reached Mumbai, MH (${beam.from.city} · ${hopSummary}). Add VITE_APP_EMAILJS_* keys in .env.local to dispatch live emails.`,
          });
          setForm({
            name: "",
            email: "",
            message: "",
          });
        } else {
          setStatusLog({
            ok: false,
            text: "Mail relay credentials unavailable — reach out directly via abhijitkad62@gmail.com.",
          });
        }
        return;
      }

      const timeoutPromise = new Promise((_, reject) => {
        timeoutTimer = setTimeout(() => reject(new Error("EmailJS request timed out")), 12000);
      });

      await Promise.race([
        emailjs.send(
          serviceId,
          templateId,
          {
            name: form.name,
            email: form.email,
            message: `[Channel: ${activeChannel.label} (${activeChannel.freq})]\n\n${form.message}`,
            title: `[${activeChannel.label}] Portfolio Contact from ${form.name}`,
          },
          publicKey
        ),
        timeoutPromise,
      ]);

      track("Contact Initiated", { method: "contact_form", channel: channelId });
      setStatusLog({
        ok: true,
        text: `Uplink verified: ${beam.from.city} (${beam.from.country}) → Mumbai, MH (${hopSummary}). Expect a reply soon.`,
      });
      setForm({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      setStatusLog({
        ok: false,
        text: "Uplink handshake timed out — retry or reach out via abhijitkad62@gmail.com.",
      });
    } finally {
      if (stageTimer) clearTimeout(stageTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      setLoading(false);
      setTxStage("");
      setEarthVisitorStatus("browsing");
    }
  };

  return (
    <div
      className={`relative border border-[rgb(var(--accent-rgb)/0.28)] bg-[rgb(var(--page-rgb)/0.75)] flex flex-col justify-between ${
        compact ? "p-5" : "p-6 sm:p-8"
      }`}
    >
      {/* Tactical HUD Corner Brackets */}
      <span className="pointer-events-none absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--accent)]" />
      <span className="pointer-events-none absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--accent)]" />
      <span className="pointer-events-none absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--accent)]" />
      <span className="pointer-events-none absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--accent)]" />

      <div>
        {/* HUD Header + Real-Time Lock Meter */}
        <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <p className={styles.sectionSubText}>God&apos;s Eye // Direct Uplink</p>
            <h3 className={styles.sectionHeadText}>Contact.</h3>
          </div>

          <div className="font-mono text-right">
            <div className="text-[10px] uppercase tracking-[2px] text-white/60">
              SIGNAL LOCK
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              {[0, 1, 2].map((seg) => (
                <span
                  key={seg}
                  className="w-5 h-1.5 transition-all duration-300"
                  style={{
                    background:
                      seg < lockedCount
                        ? lockedCount === 3
                          ? "#4ade80"
                          : "#00f5ff"
                        : "rgba(255,255,255,0.14)",
                    boxShadow:
                      seg < lockedCount
                        ? `0 0 8px ${lockedCount === 3 ? "#4ade80" : "#00f5ff"}`
                        : "none",
                  }}
                />
              ))}
              <span
                className={`ml-1 text-[11px] font-bold ${
                  lockedCount === 3 ? "text-[#4ade80]" : "text-[#00f5ff]"
                }`}
              >
                {Math.round(lockProgress * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* 01 // Frequency Intent Selector */}
        <div className="mt-5">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[2px] text-white/50 mb-2">
            <span>01 // Select Frequency</span>
            <span className="text-accent">{activeChannel.freq}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {CHANNELS.map((ch) => {
              const selected = ch.id === channelId;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => handleChannelSelect(ch.id)}
                  className={`py-2 px-2 border font-mono text-[10px] sm:text-[11px] uppercase tracking-[1.4px] transition-all cursor-pointer ${
                    selected
                      ? "border-[#00f5ff] bg-[#00f5ff]/12 text-white shadow-[0_0_14px_rgba(0,245,255,0.18)]"
                      : "border-white/12 bg-black/30 text-white/55 hover:text-white hover:border-white/30"
                  }`}
                >
                  {ch.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 02 // Tactical Scanner Input Slots */}
        <form ref={formRef} onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {/* Sender Callsign */}
          <div
            className="border transition-colors"
            style={{
              borderColor: nameLocked ? "rgba(74, 222, 128, 0.45)" : "rgba(255,255,255,0.12)",
              background: "rgba(4, 8, 18, 0.72)",
            }}
          >
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 font-mono text-[10px] uppercase tracking-[1.8px]">
              <span className="text-white/55">02 // Sender Callsign</span>
              <span className={nameLocked ? "text-[#4ade80]" : "text-white/30"}>
                {nameLocked ? "LOCKED ✓" : "PENDING"}
              </span>
            </div>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name or organization"
              className="w-full bg-transparent px-3.5 py-2.5 text-white text-sm placeholder:text-white/30 outline-none"
            />
          </div>

          {/* Return Address */}
          <div
            className="border transition-colors"
            style={{
              borderColor: emailLocked ? "rgba(74, 222, 128, 0.45)" : "rgba(255,255,255,0.12)",
              background: "rgba(4, 8, 18, 0.72)",
            }}
          >
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 font-mono text-[10px] uppercase tracking-[1.8px]">
              <span className="text-white/55">03 // Return Coordinates</span>
              <span className={emailLocked ? "text-[#4ade80]" : "text-white/30"}>
                {emailLocked ? "LOCKED ✓" : "PENDING"}
              </span>
            </div>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              className="w-full bg-transparent px-3.5 py-2.5 text-white text-sm placeholder:text-white/30 outline-none"
            />
          </div>

          {/* Transmission Payload */}
          <div
            className="border transition-colors"
            style={{
              borderColor: msgLocked ? "rgba(74, 222, 128, 0.45)" : "rgba(255,255,255,0.12)",
              background: "rgba(4, 8, 18, 0.72)",
            }}
          >
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 font-mono text-[10px] uppercase tracking-[1.8px]">
              <span className="text-white/55">04 // Encrypted Payload</span>
              <div className="flex items-center gap-2">
                {/* Dynamic mini waveform tied to payload length */}
                <div className="flex items-end gap-0.5 h-3" aria-hidden="true">
                  {[0.4, 0.85, 0.6, 1, 0.5].map((h, i) => {
                    const activeBar = form.message.length > i * 4;
                    return (
                      <span
                        key={i}
                        className="w-0.5 transition-all duration-150"
                        style={{
                          height: activeBar ? `${Math.round(h * 12)}px` : "3px",
                          background: msgLocked ? "#4ade80" : activeBar ? "#00f5ff" : "rgba(255,255,255,0.2)",
                        }}
                      />
                    );
                  })}
                </div>
                <span className={msgLocked ? "text-[#4ade80]" : "text-white/30"}>
                  {msgLocked ? "LOCKED ✓" : `${form.message.length}B`}
                </span>
              </div>
            </div>
            <textarea
              rows={compact ? 3 : 4}
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder={activeChannel.placeholder}
              className="w-full bg-transparent px-3.5 py-2.5 text-white text-sm placeholder:text-white/30 outline-none resize-none"
            />
          </div>

          {/* Satellite Dispatch Trigger */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 border font-mono text-xs uppercase tracking-[2.4px] flex items-center justify-between transition-all cursor-pointer disabled:opacity-65 ${
              lockedCount === 3
                ? "border-[#00f5ff] bg-[#00f5ff]/15 text-white shadow-[0_0_20px_rgba(0,245,255,0.22)] hover:bg-[#00f5ff]/25"
                : "border-[rgb(var(--accent-rgb)/0.45)] bg-black/50 text-accent hover:border-accent hover:text-white"
            }`}
          >
            <span>
              {loading
                ? txStage || "TRANSMITTING..."
                : lockedCount === 3
                  ? "⌖ TARGET LOCKED · TRANSMIT SIGNAL"
                  : `⌖ ACQUIRE LOCK (${lockedCount}/3) & TRANSMIT`}
            </span>
            <span className="text-[11px] opacity-80">&rarr; MUMBAI_MH</span>
          </button>
        </form>

        {statusLog && (
          <div
            role="status"
            className={`mt-4 px-4 py-3 border text-xs font-mono ${
              statusLog.ok
                ? "border-[#4ade80]/50 bg-[#06180f]/85 text-[#86efac]"
                : "border-[#ff5f57]/50 bg-[#1a090b]/85 text-[#fca5a5]"
            }`}
          >
            {statusLog.text}
          </div>
        )}
      </div>
    </div>
  );
}
