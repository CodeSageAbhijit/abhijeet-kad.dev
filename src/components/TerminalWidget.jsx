import { useState, useEffect, useRef } from "react";
import { designFocus } from "../constants";
import TerminalTitleBar from "./TerminalTitleBar";

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
        { type: "out-dim",   text: "{" },
        { type: "out",       text: "  \"frontend\" : [\"React\", \"Next.js\", \"Three.js\", \"Tailwind\"]," },
        { type: "out",       text: "  \"backend\"  : [\"Node.js\", \"Express\", \"MongoDB\", \"REST\"]," },
        { type: "out",       text: `  "design_focus" : ${JSON.stringify(designFocus)},` },
        { type: "out",       text: "  \"tools\"    : [\"Git\", \"Docker\", \"Figma\", \"Postman\"]" },
        { type: "out-dim",   text: "}" },
      ],
    },
    {
      cmd: "cat ./rawtorrent-architecture.txt",
      output: [
        { type: "out-amber", text: "RawTorrent architecture" },
        { type: "out",       text: "Desktop UI     Next.js + Electron" },
        { type: "out",       text: "Transfer logic Separate Node.js daemon" },
        { type: "out",       text: "Live updates   WebSockets" },
        { type: "out-cyan",  text: "Disk writes    Sequential pipeline" },
      ],
    },
    {
      cmd: "cat ./status.txt",
      output: [
        { type: "out", text: "Available for hire" },
        { type: "out", text: "Focus: system design and backend engineering" },
        { type: "out", text: "Open to remote roles" },
      ],
    },
  ],
};

const CHAR_SPEED    = 30;
const OUTPUT_DELAY  = 80;
const PAUSE_AFTER   = 1800;
const RESTART_DELAY = 3000;

export default function TerminalWidget({ className = "" }) {
  const [lines,  setLines]  = useState([]);
  const [prompt, setPrompt] = useState("");
  const [active, setActive] = useState(true);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current)
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines, prompt]);

  useEffect(() => {
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

        setActive(false);
        await wait(RESTART_DELAY);
      }
    }

    loop();
    return () => { cancelled = true; };
  }, []);

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
    const cls = {
      "out":       "term-out",
      "out-dim":   "term-out-dim",
      "out-red":   "term-out-red",
      "out-amber": "term-out-amber",
      "out-cyan":  "term-out-cyan",
      "out-white": "term-out-white",
    }[line.type] ?? "term-out";
    return <span key={idx} className={cls}>{line.text}</span>;
  };

  return (
    <div className={`term-window ${className}`} data-tone="career">
      <TerminalTitleBar title="abhijeet@portfolio — zsh" />
      <div className="term-body" ref={bodyRef}>
        {lines.map((l, i) => renderLine(l, i))}
        {active && (
          <div className="flex gap-1">
            <span className="term-prompt">{"❯"}</span>
            <span className="term-cmd">{prompt}</span>
            <span className="cursor-blink" />
          </div>
        )}
      </div>
    </div>
  );
}
