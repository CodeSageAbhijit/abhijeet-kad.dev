import { useEffect, useRef, useState } from "react";
import { finishGame, startGame } from "../utils/analytics";

/**
 * Authentic Windows XP Minesweeper
 * Recreates the classic 9x9 XP game with yellow smiley face button,
 * 7-segment LED counters, flags, and sound effects.
 */

const ROWS = 9;
const COLS = 9;
const MINES = 10;

function createBoard() {
  const board = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      count: 0,
      exploded: false,
    }))
  );

  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }

  // Calculate neighboring mines
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) {
            count++;
          }
        }
      }
      board[r][c].count = count;
    }
  }

  return board;
}

export default function RetroMinesweeper() {
  const [board, setBoard] = useState(createBoard);
  const [gameState, setGameState] = useState("idle"); // "idle", "playing", "won", "lost"
  const [faceState, setFaceState] = useState("smile"); // "smile", "scared", "dead", "cool"
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const latestTimer = useRef(0);
  latestTimer.current = timer;

  useEffect(() => {
    if (gameState === "playing") {
      startGame("minesweeper");
    } else if (gameState === "won" || gameState === "lost") {
      finishGame("minesweeper", gameState, latestTimer.current);
    }
  }, [gameState]);

  useEffect(() => {
    return () => {
      finishGame("minesweeper", "quit", latestTimer.current);
    };
  }, []);

  // Sound generator
  const playSfx = (type) => {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      const ctx = new Audio();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
      } else if (type === "boom") {
        // White noise explosion burst
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(400, t);
        filter.frequency.exponentialRampToValueAtTime(50, t + 0.4);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        noise.connect(filter).connect(gain).connect(ctx.destination);
        noise.start(t);
      } else if (type === "win") {
        // High win fanfare
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "triangle";
          o.frequency.setValueAtTime(freq, t + idx * 0.1);
          g.gain.setValueAtTime(0.001, t + idx * 0.1);
          g.gain.exponentialRampToValueAtTime(0.08, t + idx * 0.1 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.3);
          o.connect(g).connect(ctx.destination);
          o.start(t + idx * 0.1);
          o.stop(t + idx * 0.1 + 0.35);
        });
      }
    } catch {
      // Audio not supported
    }
  };

  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTimer((prev) => Math.min(prev + 1, 999));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const flagsUsed = board.flat().filter((cell) => cell.flagged).length;
  const remainingMines = Math.max(0, MINES - flagsUsed);

  const resetGame = () => {
    finishGame("minesweeper", "quit", latestTimer.current);
    setBoard(createBoard());
    setGameState("idle");
    setFaceState("smile");
    setTimer(0);
    playSfx("click");
  };

  const revealCell = (r, c) => {
    if (gameState === "won" || gameState === "lost") return;
    const current = board[r][c];
    if (current.revealed || current.flagged) return;

    if (gameState === "idle") {
      setGameState("playing");
    }

    if (current.mine) {
      // Bomb clicked! Lose game
      playSfx("boom");
      setGameState("lost");
      setFaceState("dead");
      setBoard((prev) =>
        prev.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            if (rowIdx === r && colIdx === c) {
              return { ...cell, revealed: true, exploded: true };
            }
            if (cell.mine) {
              return { ...cell, revealed: true };
            }
            return cell;
          })
        )
      );
      return;
    }

    playSfx("click");

    // Flood fill uncover blanks
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
    const queue = [[r, c]];
    newBoard[r][c].revealed = true;

    while (queue.length > 0) {
      const [currR, currC] = queue.shift();
      if (newBoard[currR][currC].count === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = currR + dr;
            const nc = currC + dc;
            if (
              nr >= 0 &&
              nr < ROWS &&
              nc >= 0 &&
              nc < COLS &&
              !newBoard[nr][nc].revealed &&
              !newBoard[nr][nc].flagged &&
              !newBoard[nr][nc].mine
            ) {
              newBoard[nr][nc].revealed = true;
              if (newBoard[nr][nc].count === 0) {
                queue.push([nr, nc]);
              }
            }
          }
        }
      }
    }

    // Check win condition
    const nonMineTotal = ROWS * COLS - MINES;
    const revealedCount = newBoard.flat().filter((cell) => cell.revealed && !cell.mine).length;

    if (revealedCount === nonMineTotal) {
      setGameState("won");
      setFaceState("cool");
      playSfx("win");
    }

    setBoard(newBoard);
  };

  const toggleFlag = (e, r, c) => {
    e.preventDefault();
    if (gameState === "won" || gameState === "lost") return;
    const current = board[r][c];
    if (current.revealed) return;

    if (gameState === "idle") setGameState("playing");

    setBoard((prev) =>
      prev.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          if (rowIdx === r && colIdx === c) {
            return { ...cell, flagged: !cell.flagged };
          }
          return cell;
        })
      )
    );
  };

  const numberColors = [
    "",
    "#0000FF", // 1
    "#008000", // 2
    "#FF0000", // 3
    "#000080", // 4
    "#800000", // 5
    "#008080", // 6
    "#000000", // 7
    "#808080", // 8
  ];

  return (
    <div className="retro-minesweeper">
      {/* Top XP Menu Bar */}
      <div className="retro-ms-menubar">
        <span className="retro-ms-menu-item"><u>G</u>ame</span>
        <span className="retro-ms-menu-item"><u>H</u>elp</span>
      </div>

      {/* Main Beveled Case */}
      <div className="retro-ms-case">
        {/* Header with 7-segment digital meters and smiley */}
        <div className="retro-ms-header">
          {/* Mine count */}
          <div className="retro-ms-digit-screen" title="Mines remaining">
            {String(remainingMines).padStart(3, "0")}
          </div>

          {/* Smiley button */}
          <button
            type="button"
            className="retro-ms-face-btn"
            onClick={resetGame}
            title="Restart game"
          >
            {faceState === "dead"
              ? "😵"
              : faceState === "cool"
              ? "😎"
              : faceState === "scared"
              ? "😮"
              : "🙂"}
          </button>

          {/* Time elapsed */}
          <div className="retro-ms-digit-screen" title="Time elapsed">
            {String(timer).padStart(3, "0")}
          </div>
        </div>

        {/* 9x9 Mine Grid */}
        <div
          className="retro-ms-grid"
          onMouseDown={() => {
            if (gameState === "playing") setFaceState("scared");
          }}
          onMouseUp={() => {
            if (gameState === "playing") setFaceState("smile");
          }}
        >
          {board.map((row, r) => (
            <div key={r} className="retro-ms-row">
              {row.map((cell, c) => (
                <button
                  type="button"
                  key={c}
                  className={`retro-ms-cell ${
                    cell.revealed ? "is-revealed" : "is-hidden"
                  } ${cell.exploded ? "is-exploded" : ""}`}
                  onClick={() => revealCell(r, c)}
                  onContextMenu={(e) => toggleFlag(e, r, c)}
                  aria-label={`Cell row ${r + 1}, col ${c + 1}`}
                >
                  {cell.revealed ? (
                    cell.mine ? (
                      "💣"
                    ) : cell.count > 0 ? (
                      <span style={{ color: numberColors[cell.count], fontWeight: "bold" }}>
                        {cell.count}
                      </span>
                    ) : (
                      ""
                    )
                  ) : cell.flagged ? (
                    "🚩"
                  ) : (
                    ""
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
