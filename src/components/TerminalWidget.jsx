import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { designFocus } from "../constants";
import TerminalTitleBar from "./TerminalTitleBar";
import { fireConfetti } from "../fans/confetti";
import {
  markEasterEggFound,
  setPendingRetroEntryPoint,
  track,
  trackHiddenFeature,
} from "../utils/analytics";

const RESUME_PATH = "/Abhijeet_Kad_CV.pdf";

const SESSION = {
  boot: [
    { type: "system", text: "Initializing session..." },
    { type: "system", text: "Connected to abhijit-kad.dev" },
    { type: "blank" },
  ],
  commands: [
    {
      cmd: "whoami",
      output: [
        { type: "out-cyan", text: "abhijeet_kad" },
      ],
    },
    {
      cmd: "cat ./skills.json",
      output: [
        { type: "out-dim", text: "{" },
        { type: "out", text: "  \"frontend\"     : [\"React\", \"Next.js\", \"Three.js\", \"Tailwind\"]," },
        { type: "out", text: "  \"backend\"      : [\"Node.js\", \"Express\", \"MongoDB\", \"REST\"]," },
        { type: "out", text: `  "design_focus" : ${JSON.stringify(designFocus)},` },
        { type: "out", text: "  \"tools\"        : [\"Git\", \"Docker\", \"Figma\", \"Postman\"]" },
        { type: "out-dim", text: "}" },
      ],
    },
    {
      cmd: "cat ./rawtorrent-architecture.txt",
      output: [
        { type: "out-amber", text: "RawTorrent Architecture" },
        { type: "out", text: "  Desktop UI     │ Next.js + Electron" },
        { type: "out", text: "  Transfer Core  │ Separate Node.js daemon" },
        { type: "out", text: "  Live Updates   │ WebSockets" },
        { type: "out-cyan", text: "  Disk Writes    │ Sequential pipeline" },
      ],
    },
    {
      cmd: "cat ./status.txt",
      output: [
        { type: "out", text: "Available for hire · Immediate / Remote ready" },
        { type: "out", text: "Focus: system design and backend engineering" },
      ],
    },
  ],
};

const CHAR_SPEED = 30;
const OUTPUT_DELAY = 80;
const PAUSE_AFTER = 1800;
const RESTART_DELAY = 3000;

export default function TerminalWidget({ className = "" }) {
  const [lines, setLines] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [active, setActive] = useState(true);
  const [interactive, setInteractive] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [toast, setToast] = useState("");
  const [matrixOn, setMatrixOn] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("matrix-mode")
  );
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (bodyRef.current)
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines, prompt, interactive, userInput]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (interactive) return;
    // Local flag per closure — not reset on re-run, so StrictMode's
    // first (cleaned-up) loop stays dead even after the second loop starts
    let cancelled = false;

    const wait = (ms) => new Promise((res) => setTimeout(res, ms));
    const pushLine = (line) => setLines((prev) => [...prev, line]);

    async function loop() {
      while (!cancelled) {
        setLines([]);
        setPrompt("");
        setActive(true);

        for (const line of SESSION.boot) {
          if (cancelled) return;
          await wait(200);
          if (cancelled) return;
          pushLine(line);
        }

        for (const { cmd, output } of SESSION.commands) {
          if (cancelled) return;

          for (let c = 1; c <= cmd.length; c++) {
            if (cancelled) return;
            await wait(CHAR_SPEED);
            if (cancelled) return;
            setPrompt(cmd.slice(0, c));
          }

          await wait(200);
          if (cancelled) return;
          pushLine({ type: "cmd", cmd });
          setPrompt("");

          for (const outLine of output) {
            if (cancelled) return;
            await wait(OUTPUT_DELAY);
            if (cancelled) return;
            pushLine(outLine);
          }

          await wait(PAUSE_AFTER);
          if (cancelled) return;
          pushLine({ type: "blank" });
        }

        pushLine({ type: "out-dim", text: "tip: click here and type 'man' for interactive shell" });
        setActive(false);
        await wait(RESTART_DELAY);
      }
    }

    loop();
    return () => { cancelled = true; };
  }, [interactive]);

  const enterShell = () => {
    if (!interactive) {
      setInteractive(true);
      setActive(false);
      setPrompt("");
      setLines((prev) => [
        ...prev,
        { type: "blank" },
        { type: "system", text: "Interactive shell active. Type 'man' or 'help' to see commands." },
      ]);
    }
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  };

  const appendOutput = (cmd, outLines) => {
    setLines((prev) => [
      ...prev,
      { type: "cmd", cmd },
      ...outLines,
      { type: "blank" },
    ]);
  };

  const runCommand = (raw) => {
    const trimmed = raw.trim();
    const cmd = trimmed.toLowerCase();
    if (!trimmed) {
      setLines((prev) => [...prev, { type: "cmd", cmd: "" }]);
      return;
    }

    trackHiddenFeature("hero_interactive_terminal");
    setHistory((prev) => [trimmed, ...prev.slice(0, 29)]);
    setHistIdx(-1);

    if (cmd === "clear" || cmd === "cls") {
      setLines([{ type: "system", text: "Cleared. Type 'man' for commands." }]);
      return;
    }

    if (cmd === "auto" || cmd === "demo" || cmd === "exit") {
      setInteractive(false);
      setUserInput("");
      return;
    }

    if (cmd === "man" || cmd === "help" || cmd === "man abhijeet" || cmd === "?") {
      markEasterEggFound("terminal_man_manual", "keyword");
      appendOutput(trimmed, [
        { type: "out-amber", text: "ABHIJEET(1) — Portfolio Manual" },
        { type: "out-cyan", text: "Portfolio:" },
        { type: "out", text: "  whoami                Identity & role" },
        { type: "out", text: "  ls                    List files" },
        { type: "out", text: "  cat skills.json       Core stack & focus" },
        { type: "out", text: "  cat rawtorrent        RawTorrent architecture" },
        { type: "out", text: "  cat status.txt        Availability" },
        { type: "out", text: "  resume | cv           Download Abhijeet_Kad_CV.pdf" },
        { type: "out", text: "  open retro            Boot Windows XP CRT" },
        { type: "out-cyan", text: "Easter Eggs:" },
        { type: "out-amber", text: "  sudo hire abhijeet    Instant recruiter pass" },
        { type: "out-amber", text: "  matrix                Phosphor green mode" },
        { type: "out-amber", text: "  chai                  Cutting-chai break" },
        { type: "out-amber", text: "  rm -rf /              Attempt forbidden wipe" },
        { type: "out-dim", text: "  clear | auto          Reset / resume demo" },
      ]);
      return;
    }

    if (cmd === "whoami") {
      appendOutput(trimmed, [{ type: "out-cyan", text: "abhijeet_kad — Full Stack & Systems Engineer" }]);
      return;
    }

    if (cmd === "ls") {
      appendOutput(trimmed, [
        { type: "out", text: "skills.json   status.txt   rawtorrent-architecture.txt" },
        { type: "out", text: "Abhijeet_Kad_CV.pdf       .easter_eggs" },
      ]);
      return;
    }

    if (cmd === "cat .easter_eggs" || cmd === "cat secrets" || cmd === ".easter_eggs") {
      markEasterEggFound("terminal_secrets_file", "keyword");
      appendOutput(trimmed, [
        { type: "out-amber", text: "Hidden around the site:" },
        { type: "out", text: "1. Click '∞ Bugs Squashed' 3x in Hero" },
        { type: "out", text: "2. Click '+91 9137292367' for 2000s ringtone" },
        { type: "out", text: "3. Retro CRT -> IE7 -> visit orkut.com" },
        { type: "out", text: "4. Wait on Retro CRT until signal drops..." },
      ]);
      return;
    }

    if (cmd === "cat ./skills.json" || cmd === "cat skills.json") {
      appendOutput(trimmed, SESSION.commands[1].output);
      return;
    }

    if (
      cmd === "cat ./rawtorrent-architecture.txt" ||
      cmd === "cat rawtorrent-architecture.txt" ||
      cmd === "cat rawtorrent" ||
      cmd === "rawtorrent"
    ) {
      appendOutput(trimmed, SESSION.commands[2].output);
      return;
    }

    if (cmd === "cat ./status.txt" || cmd === "cat status.txt") {
      appendOutput(trimmed, SESSION.commands[3].output);
      return;
    }

    if (cmd === "resume" || cmd === "cat resume" || cmd === "download resume" || cmd === "cv" || cmd === "cat cv" || cmd === "download cv") {
      trackHiddenFeature("terminal_resume_command");
      appendOutput(trimmed, [
        { type: "out-cyan", text: "CV ready:" },
        {
          type: "link",
          href: RESUME_PATH,
          download: "Abhijeet_Kad_CV.pdf",
          label: "↓ Download Abhijeet_Kad_CV.pdf",
        },
      ]);
      return;
    }

    if (cmd === "open retro" || cmd === "retro") {
      markEasterEggFound("terminal_open_retro", "keyword");
      appendOutput(trimmed, [{ type: "out-amber", text: "Booting Windows XP Retro CRT..." }]);
      setPendingRetroEntryPoint("easter_egg");
      setTimeout(() => navigate("/retro/", { state: { boot: true, sound: true } }), 450);
      return;
    }

    if (cmd === "sudo hire abhijeet" || cmd === "sudo hire" || cmd === "hire") {
      markEasterEggFound("terminal_sudo_hire", "keyword");
      appendOutput(trimmed, [
        { type: "out-amber", text: "[sudo] verifying recruiter privileges..." },
        { type: "out-cyan", text: "ACCESS GRANTED · VIP RECRUITER PASS ISSUED" },
        { type: "out", text: "  Role Fit   │ Full Stack / Backend / Systems" },
        { type: "out", text: "  Status     │ Available immediately · Remote/Hybrid" },
        {
          type: "link",
          href: "mailto:abhijitkad62@gmail.com?subject=Fast-Track%20Opportunity%20for%20Abhijeet",
          label: "✉ Direct Mail: abhijitkad62@gmail.com",
        },
        {
          type: "link",
          href: RESUME_PATH,
          download: "Abhijeet_Kad_CV.pdf",
          label: "↓ CV: Abhijeet_Kad_CV.pdf",
        },
      ]);
      setToast("★ VIP Recruiter Pass Issued!");
      try {
        const rect = bodyRef.current?.getBoundingClientRect();
        fireConfetti(rect ? rect.left + rect.width / 2 : window.innerWidth / 2, rect ? rect.top + 40 : 200);
      } catch {
        // Ignore confetti errors
      }
      return;
    }

    if (cmd === "rm -rf /" || cmd === "sudo rm -rf /" || cmd === "rm -rf *") {
      markEasterEggFound("terminal_rm_rf", "keyword");
      appendOutput(trimmed, [{ type: "out-red", text: "rm: wiping /sys/portfolio..." }]);
      document.documentElement.classList.add("portfolio-rm-glitch");
      setTimeout(() => {
        document.documentElement.classList.remove("portfolio-rm-glitch");
        setLines((prev) => [
          ...prev,
          { type: "out-amber", text: "Nice try. Portfolio is mounted read-only😏." },
          { type: "blank" },
        ]);
      }, 1500);
      return;
    }

    if (cmd === "matrix" || cmd === "matrix on" || cmd === "matrix off") {
      const next = cmd === "matrix off" ? false : cmd === "matrix on" ? true : !matrixOn;
      document.documentElement.classList.toggle("matrix-mode", next);
      setMatrixOn(next);
      markEasterEggFound("terminal_matrix", "keyword");
      track("Theme Toggled", { theme: next ? "matrix" : "default" });
      appendOutput(trimmed, [
        {
          type: "out-cyan",
          text: next
            ? "Wake up, Neo... Green phosphor Matrix mode ON."
            : "Matrix mode OFF. Restoring default palette.",
        },
      ]);
      return;
    }

    if (cmd === "chai") {
      markEasterEggFound("terminal_chai", "keyword");
      appendOutput(trimmed, [
        { type: "out-amber", text: "      ( (" },
        { type: "out-amber", text: "       ) )" },
        { type: "out", text: "    ........" },
        { type: "out", text: "    |      |]   Cutting chai served!" },
        { type: "out", text: "    \\      /    +100% focus restored." },
        { type: "out-amber", text: "     `----'" },
      ]);
      return;
    }

    appendOutput(trimmed, [
      { type: "out-red", text: `zsh: command not found: ${trimmed}` },
      { type: "out-dim", text: "Type 'man' for available & secret commands." },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = userInput;
      setUserInput("");
      runCommand(val);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next = Math.min(history.length - 1, histIdx + 1);
      setHistIdx(next);
      setUserInput(history[next] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx <= 0) {
        setHistIdx(-1);
        setUserInput("");
      } else {
        const next = histIdx - 1;
        setHistIdx(next);
        setUserInput(history[next] || "");
      }
    }
  };

  const renderLine = (line, idx) => {
    if (!line || typeof line.type !== "string") return null;
    if (line.type === "blank")
      return <span key={idx} className="term-blank" />;
    if (line.type === "system")
      return <span key={idx} className="term-system">{"»"} {line.text}</span>;
    if (line.type === "cmd")
      return (
        <div key={idx} className="flex gap-1">
          <span className="term-prompt">{"❯"}</span>
          <span className="term-cmd">{line.cmd}</span>
        </div>
      );
    if (line.type === "link")
      return (
        <a
          key={idx}
          href={line.href}
          download={line.download}
          data-placement="terminal"
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "inline-block",
            color: "var(--accent)",
            textDecoration: "underline",
            paddingLeft: 4,
            marginTop: 2,
          }}
        >
          {line.label}
        </a>
      );
    const cls = {
      "out": "term-out",
      "out-dim": "term-out-dim",
      "out-red": "term-out-red",
      "out-amber": "term-out-amber",
      "out-cyan": "term-out-cyan",
      "out-white": "term-out-white",
    }[line.type] ?? "term-out";
    return <span key={idx} className={cls}>{line.text}</span>;
  };

  return (
    <div
      className={`term-window relative ${className}`}
      data-tone="career"
      onClick={enterShell}
      style={{ cursor: "text" }}
    >
      <TerminalTitleBar title={interactive ? "abhijeet@portfolio — zsh (interactive · type 'man')" : "abhijeet@portfolio — zsh · click to type"} />
      <div className="term-body" ref={bodyRef}>
        {lines.map((l, i) => renderLine(l, i))}
        {!interactive && active && (
          <div className="flex gap-1">
            <span className="term-prompt">{"❯"}</span>
            <span className="term-cmd">{prompt}</span>
            <span className="cursor-blink" />
          </div>
        )}
        {interactive && (
          <div className="flex items-center gap-1">
            <span className="term-prompt">{"❯"}</span>
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Interactive portfolio terminal input"
              placeholder="type 'man'..."
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              style={{
                flex: 1,
                minWidth: 0,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#f4f4f4",
                fontFamily: "inherit",
                fontSize: "inherit",
                caretColor: "var(--accent)",
              }}
            />
          </div>
        )}
      </div>
      {toast && (
        <div
          role="status"
          style={{
            position: "absolute",
            right: 12,
            bottom: 12,
            padding: "6px 10px",
            background: "rgba(5, 16, 12, 0.94)",
            border: "1px solid var(--accent)",
            color: "var(--accent)",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 11,
            borderRadius: 4,
            boxShadow: "0 0 16px rgb(var(--accent-rgb) / 0.35)",
            zIndex: 20,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
