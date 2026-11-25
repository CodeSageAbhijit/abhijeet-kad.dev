/**
 * Shared per-game action controls used by both the in-emulator Controls modal
 * and the Games Directory sidebar preview.
 */

export const GAME_CONTROLS = {
  mario: {
    footer: "⌨ Move: ←/→ | Jump: X | Run/Fire: Z | Pipe: ↓ | Start: Enter | 1P/2P: Shift",
    sections: [
      {
        title: "🍄 Super Mario Bros. Actions",
        rows: [
          { action: "Walk Left / Right", keys: ["←", "→"] },
          { action: "Jump (A)", keys: ["X"] },
          { action: "Sprint / Fireball (B)", keys: ["Z"] },
          { action: "Crouch / Enter Pipe", keys: ["↓"] },
          { action: "Climb Vine", keys: ["↑"] },
          { action: "Start / Pause", keys: ["Enter"] },
          { action: "Switch 1P / 2P (Select)", keys: ["Shift"] },
        ],
      },
    ],
  },
  sonic: {
    footer: "⌨ Run: ←/→ | Spin Dash: ↓ | Jump: Z / X / C | Start: Enter",
    sections: [
      {
        title: "💨 Sonic the Hedgehog Actions",
        rows: [
          { action: "Run Left / Right", keys: ["←", "→"] },
          { action: "Roll / Spin Dash", keys: ["↓"] },
          { action: "Look Up", keys: ["↑"] },
          { action: "Jump (A / B / C)", keys: ["Z", "X", "C"] },
          { action: "Start / Pause", keys: ["Enter"] },
          { action: "Mode", keys: ["Shift"] },
        ],
      },
    ],
  },
  pokemon: {
    footer: "⌨ Walk: ↑↓←→ | Confirm/Talk (A): X | Back/Run (B): Z | Menu: Enter | Select: Shift",
    sections: [
      {
        title: "⚡ Pokémon Emerald Actions",
        rows: [
          { action: "Move / Navigate Menus", keys: ["↑", "↓", "←", "→"] },
          { action: "Confirm / Interact (A)", keys: ["X"] },
          { action: "Cancel / Running Shoes (B)", keys: ["Z"] },
          { action: "Bag / Save / Menu (Start)", keys: ["Enter"] },
          { action: "Use Registered Item (Select)", keys: ["Shift"] },
          { action: "Help / Shoulder (L / R)", keys: ["Q", "E"] },
        ],
      },
    ],
  },
  gta: {
    footer: "⌨ Walk/Steer: Arrows | Gas/A: X | Brake/Rev/B: Z | Car/Y: A | Handbrake/L: Q | Stylus: Bottom Screen",
    sections: [
      {
        title: "🚶 On Foot (Chinatown Wars)",
        rows: [
          { action: "Walk / Aim Direction", keys: ["↑", "↓", "←", "→"] },
          { action: "Sprint (B)", keys: ["Z"] },
          { action: "Action / Pickup (A)", keys: ["X"] },
          { action: "Attack / Punch / Fire (X)", keys: ["S"] },
          { action: "Enter / Steal Car (Y)", keys: ["A"] },
        ],
      },
      {
        title: "🚗 Driving (Inside Car)",
        rows: [
          { action: "Steer Left / Right", keys: ["←", "→"] },
          { action: "Accelerate / Gas (A)", keys: ["X"] },
          { action: "Brake / Reverse (B)", keys: ["Z"] },
          { action: "Handbrake / Drift (L)", keys: ["Q"] },
          { action: "Exit Car (Y)", keys: ["A"] },
          { action: "Drive-by Fire (X)", keys: ["S"] },
          { action: "Lock Target / Camera (R)", keys: ["E"] },
        ],
      },
      {
        title: "🗺️ Menus & Stylus",
        rows: [
          { action: "Pause / Map Menu (Start)", keys: ["Enter"] },
          { action: "Whistle Cab / Select", keys: ["Shift"] },
          { action: "Stylus (Hotwire / PDA / Throw)", keys: ["Mouse Drag Bottom Screen"] },
        ],
      },
    ],
  },
  zelda: {
    footer: "⌨ Walk: ↑↓←→ | Sword (Y): A | Talk/Lift (A): X | Item (X): S | Run/Back (B): Z | Map: Shift",
    sections: [
      {
        title: "🗡️ Zelda: A Link to the Past Actions",
        rows: [
          { action: "Move Link", keys: ["↑", "↓", "←", "→"] },
          { action: "Slash Sword (Y)", keys: ["A"] },
          { action: "Lift / Talk / Dash (A)", keys: ["X"] },
          { action: "Use Equipped Item (X)", keys: ["S"] },
          { action: "Cancel / Back (B)", keys: ["Z"] },
          { action: "Map / Scroll (L / R)", keys: ["Q", "E"] },
          { action: "Inventory (Start) / Save (Select)", keys: ["Enter", "Shift"] },
        ],
      },
    ],
  },
  pacman: {
    footer: "⌨ Steer Maze: ↑ ↓ ← → | Start: Enter | Select 1P/2P: Shift | Fullscreen: F",
    sections: [
      {
        title: "👻 Pac-Man Actions",
        rows: [
          { action: "Steer Maze", keys: ["↑", "↓", "←", "→"] },
          { action: "Start / Pause", keys: ["Enter"] },
          { action: "1P / 2P Toggle (Select)", keys: ["Shift"] },
        ],
      },
    ],
  },
  vicecity: {
    sections: [
      {
        title: "🌴 GTA: Vice City (PC)",
        rows: [
          { action: "Walk / Drive", keys: ["W", "A", "S", "D"] },
          { action: "Look / Shoot", keys: ["Mouse"] },
          { action: "Enter / Exit Vehicle", keys: ["F", "Enter"] },
          { action: "Jump / Handbrake", keys: ["Space"] },
          { action: "Sprint / Horn", keys: ["Shift"] },
        ],
      },
    ],
  },
  minesweeper: {
    sections: [
      {
        title: "💣 Minesweeper",
        rows: [
          { action: "Reveal Square", keys: ["Left Click"] },
          { action: "Flag / Unflag Mine", keys: ["Right Click"] },
        ],
      },
    ],
  },
  memory: {
    sections: [
      {
        title: "🃏 Tile Match",
        rows: [{ action: "Flip Tile", keys: ["Click"] }],
      },
    ],
  },
  circuit: {
    sections: [
      {
        title: "⚡ Circuit Grid",
        rows: [{ action: "Rotate Wire", keys: ["Click"] }],
      },
    ],
  },
  packet: {
    sections: [
      {
        title: "📦 Packet Run",
        rows: [{ action: "Move Player", keys: ["↑", "↓", "←", "→", "Click"] }],
      },
    ],
  },
};
