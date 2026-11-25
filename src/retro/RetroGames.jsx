import { useEffect, useState } from "react";

const cards = [
  ["✿", "Flower"], ["✦", "Star"], ["☁", "Cloud"], ["◆", "Gem"],
  ["☀", "Sun"], ["☾", "Moon"], ["♧", "Clover"], ["♫", "Notes"],
];

function newDeck() {
  const deck = [...cards, ...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return { deck, turned: [], matched: [], moves: 0 };
}

export function TileMatch() {
  const [round, setRound] = useState(newDeck);

  useEffect(() => {
    if (round.turned.length !== 2) return;
    const timer = setTimeout(() => setRound((current) => ({ ...current, turned: [] })), 680);
    return () => clearTimeout(timer);
  }, [round.turned]);

  function flip(index) {
    setRound((current) => {
      const { deck, turned, matched, moves } = current;
      if (turned.length === 2 || turned.includes(index) || matched.includes(index)) return current;
      if (!turned.length) return { ...current, turned: [index] };
      if (deck[turned[0]] === deck[index]) return {
        ...current, moves: moves + 1, turned: [], matched: [...matched, turned[0], index],
      };
      return { ...current, moves: moves + 1, turned: [turned[0], index] };
    });
  }

  const cleared = round.matched.length === round.deck.length;
  return (
    <div className="retro-game">
      <p>Turn over two tiles to find a pair.</p>
      <div className="retro-game-stats" role="status">
        {cleared ? `All eight pairs found in ${round.moves} moves!` : `${round.matched.length / 2} / 8 pairs · ${round.moves} moves`}
      </div>
      <div className="retro-game-grid retro-memory" aria-label="Tile Match board">
        {round.deck.map(([symbol, name], index) => {
          const matched = round.matched.includes(index);
          const faceUp = matched || round.turned.includes(index);
          return (
            <button
              type="button"
              key={index}
              className={`retro-card ${faceUp ? "is-face-up" : ""} ${matched ? "is-matched" : ""}`}
              aria-label={faceUp ? `Tile ${index + 1}, ${name}${matched ? ", matched" : ""}` : `Tile ${index + 1}, face down`}
              aria-disabled={matched || round.turned.length === 2}
              onClick={() => flip(index)}
            >{faceUp ? symbol : "·"}</button>
          );
        })}
      </div>
      <button type="button" className="retro-game-button" onClick={() => setRound(newDeck)}>Shuffle tiles</button>
    </div>
  );
}

const side = 4;
const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const circuits = [
  [0, 1, 5, 6, 10, 14, 15],
  [0, 4, 8, 9, 5, 6, 7, 11, 15],
  [0, 1, 2, 6, 5, 9, 13, 14, 10, 11, 15],
];
const decoys = [5, 10, 3, 6, 12, 9];

function neighbor(index, direction) {
  const [dr, dc] = directions[direction];
  const r = Math.floor(index / side) + dr;
  const c = index % side + dc;
  return r >= 0 && r < side && c >= 0 && c < side ? r * side + c : -1;
}

function rotate(mask) {
  return ((mask << 1) & 15) | (mask >> 3);
}

function circuitBoard(level) {
  const path = circuits[level];
  return Array.from({ length: side * side }, (_, index) => {
    const pathIndex = path.indexOf(index);
    if (pathIndex < 0) return decoys[(index + level) % decoys.length];
    const adjacent = [path[pathIndex - 1], path[pathIndex + 1]];
    let mask = directions.reduce((value, _, d) => adjacent.includes(neighbor(index, d)) ? value | (1 << d) : value, 0);
    if (pathIndex === 0 || pathIndex === path.length - 1) return mask;
    for (let i = 0; i < 1 + ((index + pathIndex + level) % 3); i++) mask = rotate(mask);
    return mask;
  });
}

function poweredTiles(board) {
  const found = new Set([0]);
  for (const index of found) {
    directions.forEach((_, direction) => {
      if (!(board[index] & (1 << direction))) return;
      const next = neighbor(index, direction);
      if (next >= 0 && (board[next] & (1 << ((direction + 2) % 4)))) found.add(next);
    });
  }
  return found;
}

export function CircuitGrid() {
  const [level, setLevel] = useState(0);
  const [board, setBoard] = useState(() => circuitBoard(0));
  const [moves, setMoves] = useState(0);
  const powered = poweredTiles(board);
  const end = board.length - 1;
  const won = powered.has(end);

  function reset(nextLevel) {
    setLevel(nextLevel);
    setBoard(circuitBoard(nextLevel));
    setMoves(0);
  }

  function turn(index) {
    if (won || index === 0 || index === end) return;
    setBoard((current) => current.map((mask, cell) => cell === index ? rotate(mask) : mask));
    setMoves((current) => current + 1);
  }

  return (
    <div className="retro-game">
      <p>Rotate the wires to connect the power source to the receiver.</p>
      <div className="retro-game-stats" role="status">{won ? `Circuit complete in ${moves} moves!` : `Circuit ${level + 1} of ${circuits.length} · ${moves} moves`}</div>
      <div className="retro-game-grid retro-circuit" aria-label="Circuit Grid board">
        {board.map((mask, index) => {
          const terminal = index === 0 || index === end;
          const label = index === 0 ? "Power source" : index === end ? "Receiver" : `Wire ${index + 1}`;
          const connections = ["up", "right", "down", "left"].filter((_, d) => mask & (1 << d));
          return (
            <button
              type="button"
              key={index}
              className={`retro-wire ${terminal ? "is-socket" : ""} ${powered.has(index) ? "is-powered" : ""}`}
              aria-label={`${label}, ${connections.join(" and ")}${powered.has(index) ? ", powered" : ""}`}
              aria-disabled={terminal || won}
              onClick={() => turn(index)}
            >
              {connections.map((direction) => <span key={direction} aria-hidden="true" className={`wire-arm wire-${direction}`} />)}
              <span aria-hidden="true" className="wire-center">{index === 0 ? "ϟ" : index === end ? "◆" : ""}</span>
            </button>
          );
        })}
      </div>
      <div className="retro-game-actions">
        <button type="button" className="retro-game-button" onClick={() => reset(level)}>Reset circuit</button>
        {won && <button type="button" className="retro-game-button" onClick={() => reset((level + 1) % circuits.length)}>Next circuit</button>}
      </div>
    </div>
  );
}

const packetMaps = [
  ["S..#.*", ".#...#", ".*.#..", "#..#.*", "......", ".##..E"],
  ["S.#.*.", "..#.#.", "#...#.", ".*#...", "...#*.", "#....E"],
  ["S..#*.", ".#...#", "..*#..", "#..#..", ".*.#..", "...#.E"],
];
const packetArrows = { ArrowUp: -6, ArrowRight: 1, ArrowDown: 6, ArrowLeft: -1 };

function packetRound(level) {
  const board = packetMaps[level].join("");
  return { position: 0, collected: [], moves: 0, board };
}

export function PacketRun() {
  const [level, setLevel] = useState(0);
  const [round, setRound] = useState(() => packetRound(0));
  const won = round.board[round.position] === "E" && round.collected.length === 3;

  function reset(nextLevel) {
    setLevel(nextLevel);
    setRound(packetRound(nextLevel));
  }

  function step(next) {
    setRound((current) => {
      const { position, board, collected, moves } = current;
      if (board[position] === "E" && collected.length === 3) return current;
      const distance = Math.abs(position % 6 - next % 6) + Math.abs(Math.floor(position / 6) - Math.floor(next / 6));
      if (distance !== 1 || next < 0 || next >= board.length || board[next] === "#") return current;
      return {
        ...current,
        position: next,
        moves: moves + 1,
        collected: board[next] === "*" && !collected.includes(next) ? [...collected, next] : collected,
      };
    });
  }

  return (
    <div className="retro-game" tabIndex={0} onKeyDown={(event) => {
      const move = packetArrows[event.key];
      if (!move) return;
      event.preventDefault();
      step(round.position + move);
    }}>
      <p>Collect the three packets and reach the exit. Use the arrow keys or tap an adjacent square.</p>
      <div className="retro-game-stats" role="status">
        {won ? `Route complete in ${round.moves} moves!` : `Route ${level + 1} · ${round.collected.length} / 3 packets · ${round.moves} moves`}
      </div>
      <div className="retro-game-grid retro-packet" aria-label="Packet Run board">
        {Array.from(round.board).map((cell, index) => {
          const player = index === round.position;
          const packet = cell === "*" && !round.collected.includes(index);
          const tile = player ? "Your position" : packet ? "Packet" : cell === "E" ? "Exit" : cell === "#" ? "Wall" : "Open";
          return (
            <button type="button" key={index} className={`retro-packet-cell ${cell === "#" ? "is-wall" : ""} ${player ? "is-player" : ""}`}
              aria-label={`${tile}, row ${Math.floor(index / 6) + 1}, column ${index % 6 + 1}`}
              aria-disabled={cell === "#" || won} onClick={() => step(index)}>
              {player ? "●" : packet ? "◆" : cell === "E" ? "↗" : ""}
            </button>
          );
        })}
      </div>
      <div className="retro-game-actions">
        <button type="button" className="retro-game-button" onClick={() => reset(level)}>Reset route</button>
        {won && <button type="button" className="retro-game-button" onClick={() => reset((level + 1) % packetMaps.length)}>Next route</button>}
      </div>
    </div>
  );
}
