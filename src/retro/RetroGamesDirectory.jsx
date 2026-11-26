import { useState } from "react";
import { GAME_CONTROLS } from "./emulator/gameControls";
import {
  MarioIcon,
  SonicIcon,
  PokemonIcon,
  GtaIcon,
  ZeldaIcon,
  PacmanIcon,
  MinesweeperIcon,
  PinballIcon,
  TileIcon,
  GamesFolderIcon,
} from "./RetroIcons";

export const GAMES_CATALOG = [
  {
    id: "pinball",
    name: "Midnight Transit Pinball",
    category: "Windows Classic",
    system: "Windows XP Pinball Engine",
    year: "2001",
    publisher: "Abhijit Retro Suite",
    description: "Retro Windows XP arcade pinball table with neon rail bumpers, slingshots, multiplier ramps, and synth chimes.",
    icon: <PinballIcon size={32} />,
    rating: "★★★★★",
  },
  {
    id: "mario",
    name: "Super Mario Bros.",
    category: "NES Classic",
    system: "Nintendo Entertainment System",
    year: "1985",
    publisher: "Nintendo",
    description: "The definitive platformer. Jump through the Mushroom Kingdom, collect power mushrooms, and rescue Princess Peach.",
    icon: <MarioIcon size={32} />,
    rating: "★★★★★",
  },
  {
    id: "sonic",
    name: "Sonic the Hedgehog",
    category: "Genesis 16-Bit",
    system: "Sega Genesis / Mega Drive",
    year: "1991",
    publisher: "SEGA",
    description: "Blistering supersonic speed, loop-de-loops, Chaos Emeralds, and stopping Dr. Robotnik across Green Hill Zone.",
    icon: <SonicIcon size={32} />,
    rating: "★★★★★",
  },
  {
    id: "pokemon",
    name: "Pokémon Emerald",
    category: "Game Boy Advance",
    system: "Game Boy Advance",
    year: "2004",
    publisher: "Game Freak / Nintendo",
    description: "Travel through Hoenn, tame Rayquaza, stop Team Magma & Aqua, and conquer the Battle Frontier.",
    icon: <PokemonIcon size={32} />,
    rating: "★★★★★",
  },
  {
    id: "gta",
    name: "Grand Theft Auto: Chinatown Wars",
    category: "Nintendo DS Dual-Screen",
    system: "Nintendo DS",
    year: "2009",
    publisher: "Rockstar Games / Rockstar Leeds",
    description: "Navigate Liberty City's criminal underworld with top-down action, PDA drug dealing, car hotwiring, and dual-screen touch stylus gameplay.",
    icon: <GtaIcon size={32} />,
    rating: "★★★★★",
  },
  {
    id: "zelda",
    name: "The Legend of Zelda: A Link to the Past",
    category: "SNES 16-Bit",
    system: "Super Nintendo",
    year: "1991",
    publisher: "Nintendo",
    description: "Travel between the Light and Dark Worlds with the Master Sword to defeat Ganon and restore the Triforce.",
    icon: <ZeldaIcon size={32} />,
    rating: "★★★★★",
  },
  {
    id: "pacman",
    name: "Pac-Man",
    category: "Arcade / NES",
    system: "NES / Arcade",
    year: "1980 / 1984",
    publisher: "Namco",
    description: "Navigate the maze, chomp dots and fruits, outsmart Blinky, Pinky, Inky, and Clyde, and grab Power Pellets.",
    icon: <PacmanIcon size={32} />,
    rating: "★★★★★",
  },
  {
    id: "minesweeper",
    name: "Minesweeper",
    category: "Windows Classic",
    system: "Windows XP",
    year: "2001",
    publisher: "Microsoft Corporation",
    description: "Classic logic puzzle game. Clear the 9x9 minefield without detonating any hidden bombs.",
    icon: <MinesweeperIcon size={32} />,
    rating: "★★★★★",
  },
  {
    id: "memory",
    name: "Tile Match",
    category: "Puzzle",
    system: "Retro Suite",
    year: "2001",
    publisher: "Abhijit Retro Suite",
    description: "Flip over tiles to find matching pairs across the circuit memory board.",
    icon: <TileIcon size={32} />,
    rating: "★★★★☆",
  },
  {
    id: "circuit",
    name: "Circuit Grid",
    category: "Puzzle",
    system: "Retro Suite",
    year: "2001",
    publisher: "Abhijit Retro Suite",
    description: "Rotate copper wires to guide power from the terminal source to receiver.",
    icon: <TileIcon size={32} />,
    rating: "★★★★☆",
  },
  {
    id: "packet",
    name: "Packet Run",
    category: "Arcade",
    system: "Retro Suite",
    year: "2001",
    publisher: "Abhijit Retro Suite",
    description: "Dodge firewalls, collect data packets, and safely reach the escape terminal.",
    icon: <TileIcon size={32} />,
    rating: "★★★★☆",
  },
];

export default function RetroGamesDirectory({ onLaunch }) {
  const [selectedId, setSelectedId] = useState("pinball");
  const [filter, setFilter] = useState("all");

  const selectedGame = GAMES_CATALOG.find((g) => g.id === selectedId) || GAMES_CATALOG[0];

  const filteredGames =
    filter === "all"
      ? GAMES_CATALOG
      : filter === "console"
      ? GAMES_CATALOG.filter((g) => !g.category.includes("Windows") && !g.category.includes("Puzzle") && !g.category.includes("Arcade") || g.id === "pacman")
      : GAMES_CATALOG.filter((g) => g.category.includes("Windows") || g.category.includes("Puzzle") || g.category.includes("Arcade") && g.id !== "pacman");

  return (
    <div className="retro-games-directory">
      {/* ── Explorer Toolbar ── */}
      <div className="retro-exp-toolbar">
        <div className="retro-exp-toolbtn-group">
          <button type="button" className="retro-exp-toolbtn" disabled>
            <span className="exp-arrow">◀</span> Back
          </button>
          <button type="button" className="retro-exp-toolbtn" disabled>
            <span className="exp-arrow">▶</span> Forward
          </button>
          <div className="retro-exp-sep" />
          <button type="button" className="retro-exp-toolbtn" onClick={() => setFilter("all")}>
            📁 Folders
          </button>
        </div>
      </div>

      {/* ── Address Bar ── */}
      <div className="retro-exp-address-row">
        <span className="retro-exp-address-label">Address</span>
        <div className="retro-exp-address-box">
          <GamesFolderIcon size={16} />
          <span className="retro-exp-address-path">C:\Program Files\Games</span>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="retro-games-tabs">
        <button
          type="button"
          className={`retro-gtab ${filter === "all" ? "is-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Games ({GAMES_CATALOG.length})
        </button>
        <button
          type="button"
          className={`retro-gtab ${filter === "console" ? "is-active" : ""}`}
          onClick={() => setFilter("console")}
        >
          🎮 Console Emulators (NES, SNES, Genesis, GBA, DS)
        </button>
        <button
          type="button"
          className={`retro-gtab ${filter === "windows" ? "is-active" : ""}`}
          onClick={() => setFilter("windows")}
        >
          🧩 Windows & Retro Puzzles
        </button>
      </div>

      {/* ── Main Two-Pane View ── */}
      <div className="retro-games-main">
        {/* Left Explorer Blue Sidebar */}
        <aside className="retro-games-sidebar">
          {/* Game Tasks Box */}
          <div className="retro-gpanel">
            <header className="retro-gpanel-head">Game Tasks</header>
            <div className="retro-gpanel-body">
              <button
                type="button"
                className="retro-glink-btn"
                onClick={() => onLaunch?.(selectedGame.id)}
              >
                ▶ <strong>Play {selectedGame.name}</strong>
              </button>
              <span className="retro-gsidebar-tip">Double-click any icon to run</span>
            </div>
          </div>

          {/* Details Box */}
          <div className="retro-gpanel">
            <header className="retro-gpanel-head">Game Details</header>
            <div className="retro-gpanel-body retro-gdetails-body">
              <div className="retro-gdetail-icon">{selectedGame.icon}</div>
              <strong className="retro-gdetail-name">{selectedGame.name}</strong>
              <div className="retro-gdetail-tag">{selectedGame.category}</div>
              <p className="retro-gdetail-desc">{selectedGame.description}</p>
              <div className="retro-gdetail-row">
                <span>System:</span> <strong>{selectedGame.system}</strong>
              </div>
              <div className="retro-gdetail-row">
                <span>Release:</span> <strong>{selectedGame.year}</strong>
              </div>
              <div className="retro-gdetail-row">
                <span>Publisher:</span> <strong>{selectedGame.publisher}</strong>
              </div>
              <div className="retro-gdetail-row">
                <span>Rating:</span> <strong>{selectedGame.rating}</strong>
              </div>
            </div>
          </div>

          {/* Controls Summary Box */}
          {GAME_CONTROLS[selectedGame.id] && (
            <div className="retro-gpanel">
              <header className="retro-gpanel-head">Controls</header>
              <div className="retro-gpanel-body retro-gcontrols-body">
                {GAME_CONTROLS[selectedGame.id].sections.map((section) => (
                  <div key={section.title} className="retro-gcontrols-section">
                    <div className="retro-gcontrols-subhead">{section.title}</div>
                    {section.rows.map((row) => (
                      <div key={row.action} className="retro-gcontrols-row">
                        <span>{row.action}</span>
                        <span className="retro-gcontrols-keys">
                          {row.keys.map((k) => (
                            <kbd key={k} className="retro-gcontrols-kbd">{k}</kbd>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right Games Grid */}
        <section className="retro-games-grid-area">
          <div className="retro-games-grid" role="listbox">
            {filteredGames.map((game) => {
              const isSelected = game.id === selectedId;
              return (
                <button
                  type="button"
                  key={game.id}
                  className={`retro-game-card ${isSelected ? "is-selected" : ""}`}
                  onClick={() => setSelectedId(game.id)}
                  onDoubleClick={() => onLaunch?.(game.id)}
                  title={`Click to select, double-click to play ${game.name}`}
                >
                  <div className="retro-game-icon-box">{game.icon}</div>
                  <span className="retro-game-title">{game.name}</span>
                  <span className="retro-game-cat">{game.category}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
