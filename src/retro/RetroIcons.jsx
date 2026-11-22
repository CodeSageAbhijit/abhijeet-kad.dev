import React from "react";

/**
 * Pixel-perfect Windows XP SVGs & Icons
 * Exactly replicating the classic Luna theme iconography.
 */

export function WindowsFlagIcon({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`xp-flag-icon ${className}`}>
      <g filter="drop-shadow(0px 1px 1px rgba(0,0,0,0.5))">
        {/* Red tile (top-left) */}
        <path
          d="M4 7C8 5.5 12 7.5 14.5 7L14 16C11.5 16.5 7.5 14.5 4 16Z"
          fill="url(#redGrad)"
        />
        {/* Green tile (top-right) */}
        <path
          d="M17 6.5C19.5 7 24 5 28 6.5L27 15.5C23 14 18.5 16 16.5 15.5Z"
          fill="url(#greenGrad)"
        />
        {/* Blue tile (bottom-left) */}
        <path
          d="M4 17.5C8 16 12 18 14.5 17.5L14 26.5C11.5 27 7.5 25 4 26.5Z"
          fill="url(#blueGrad)"
        />
        {/* Yellow tile (bottom-right) */}
        <path
          d="M16.5 17C18.5 17.5 23 15.5 27 17L26 26C22 24.5 17.5 26.5 15.5 26Z"
          fill="url(#yellowGrad)"
        />
      </g>
      <defs>
        <linearGradient id="redGrad" x1="4" y1="6" x2="14" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF6247" />
          <stop offset="0.6" stopColor="#E03010" />
          <stop offset="1" stopColor="#A81800" />
        </linearGradient>
        <linearGradient id="greenGrad" x1="17" y1="6" x2="28" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9CE840" />
          <stop offset="0.6" stopColor="#68B820" />
          <stop offset="1" stopColor="#3C8008" />
        </linearGradient>
        <linearGradient id="blueGrad" x1="4" y1="16" x2="14" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38A8F8" />
          <stop offset="0.6" stopColor="#006CD8" />
          <stop offset="1" stopColor="#0040A0" />
        </linearGradient>
        <linearGradient id="yellowGrad" x1="16" y1="16" x2="27" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFEA60" />
          <stop offset="0.6" stopColor="#F8C000" />
          <stop offset="1" stopColor="#D08800" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function WindowsXPLogo({ width = 160, className = "" }) {
  return (
    <div className={`xp-brand-logo ${className}`} style={{ width, display: "flex", alignItems: "center", gap: 8 }}>
      <WindowsFlagIcon size={36} />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontSize: 9, color: "#fff", letterSpacing: 0.5, opacity: 0.85, fontFamily: "Tahoma, sans-serif" }}>
          Microsoft
        </span>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ fontSize: 24, fontWeight: "bold", fontStyle: "italic", color: "#fff", fontFamily: "'Times New Roman', serif", textShadow: "1px 1px 2px rgba(0,0,0,0.6)" }}>
            Windows
          </span>
          <span style={{ fontSize: 13, fontWeight: "bold", fontStyle: "italic", color: "#FF7020", marginLeft: 3, textShadow: "1px 1px 1px rgba(0,0,0,0.5)", fontFamily: "Tahoma, sans-serif" }}>
            XP
          </span>
        </div>
      </div>
    </div>
  );
}

export function MyComputerIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Computer CRT monitor */}
      <rect x="3" y="3" width="22" height="18" rx="2" fill="#E8E4D8" stroke="#807868" strokeWidth="1.2" />
      <rect x="5" y="5" width="18" height="13" rx="1" fill="#184088" />
      {/* Screen reflection & desktop bliss hill */}
      <path d="M5 12C9 10 14 13 23 11V18H5Z" fill="#50A830" />
      <path d="M5 5L15 5L5 15Z" fill="#3078D0" opacity="0.6" />
      {/* Monitor stand */}
      <rect x="11" y="21" width="6" height="3" fill="#D0CCC0" stroke="#706858" strokeWidth="1" />
      <path d="M8 24H20L21 26H7L8 24Z" fill="#D8D4C8" stroke="#706858" strokeWidth="1" />
      {/* Desktop PC Tower on right */}
      <rect x="22" y="10" width="7" height="17" rx="1" fill="#E0DCD0" stroke="#706858" strokeWidth="1" />
      {/* Floppy slot & CD drive */}
      <line x1="24" y1="13" x2="27" y2="13" stroke="#504838" strokeWidth="1.2" />
      <line x1="24" y1="16" x2="27" y2="16" stroke="#504838" strokeWidth="1.2" />
      <circle cx="25.5" cy="22.5" r="1" fill="#38A048" />
    </svg>
  );
}

export function MyDocumentsIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Back folder tab */}
      <path d="M4 8C4 6.9 4.9 6 6 6H13L15 9H26C27.1 9 28 9.9 28 11V24C28 25.1 27.1 26 26 26H6C4.9 26 4 25.1 4 24V8Z" fill="#E0A020" stroke="#A86C10" strokeWidth="1" />
      {/* Sheet 1 (blue) */}
      <rect x="8" y="7" width="13" height="15" rx="1" fill="#E8F4FC" stroke="#78A0C8" strokeWidth="1" />
      <line x1="11" y1="10" x2="18" y2="10" stroke="#4888C0" strokeWidth="1.2" />
      <line x1="11" y1="13" x2="18" y2="13" stroke="#4888C0" strokeWidth="1.2" />
      <line x1="11" y1="16" x2="16" y2="16" stroke="#4888C0" strokeWidth="1.2" />
      {/* Front folder leaf with 3D slope */}
      <path d="M2 14C2 12.9 2.9 12 4 12H27C28.1 12 29 12.9 29 14L28 26C28 27.1 27.1 28 26 28H4C2.9 28 2 27.1 2 26V14Z" fill="url(#docFolderGrad)" stroke="#B87818" strokeWidth="1" />
      <defs>
        <linearGradient id="docFolderGrad" x1="2" y1="12" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE060" />
          <stop offset="0.6" stopColor="#F8B820" />
          <stop offset="1" stopColor="#D48010" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function InternetExplorerIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Yellow orbital ring passing behind */}
      <path d="M2 19C4 11 16 6 27 10" stroke="#FFC820" strokeWidth="2.5" strokeLinecap="round" />
      {/* Blue 'e' */}
      <ellipse cx="16" cy="16" rx="10" ry="10" fill="url(#ieGrad)" />
      <path d="M7 15H25C25 10 21 7 16 7C10.5 7 7 11 7 16C7 21.5 11 25 17 25C21 25 24 23 25 20L20.5 19C19.5 20.5 18 21.5 16 21.5C12 21.5 10 18.5 10 15Z" fill="#FFFFFF" />
      <path d="M10 13C10.5 10.5 13 9 16 9C19 9 21.5 10.5 22 13H10Z" fill="url(#ieGradInner)" />
      {/* Yellow orbital ring passing in front with arrow */}
      <path d="M28 11C30 18 20 27 5 24" stroke="url(#ieRingGrad)" strokeWidth="3" strokeLinecap="round" />
      <defs>
        <linearGradient id="ieGrad" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#30B8F8" />
          <stop offset="0.5" stopColor="#0074D8" />
          <stop offset="1" stopColor="#003888" />
        </linearGradient>
        <linearGradient id="ieGradInner" x1="10" y1="9" x2="22" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0060C0" />
          <stop offset="1" stopColor="#004098" />
        </linearGradient>
        <linearGradient id="ieRingGrad" x1="5" y1="24" x2="28" y2="11" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E08000" />
          <stop offset="0.5" stopColor="#FFC000" />
          <stop offset="1" stopColor="#FFE060" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function RecycleBinIcon({ size = 32, full = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Bin rim */}
      <ellipse cx="16" cy="7" rx="10" ry="3.5" fill="#B0C8E0" stroke="#507090" strokeWidth="1" />
      {/* Bin container with mesh lines */}
      <path d="M7 8L9.5 26C9.8 27.5 12 28.5 16 28.5C20 28.5 22.2 27.5 22.5 26L25 8" fill="url(#binGrad)" stroke="#507090" strokeWidth="1" />
      {/* Mesh grid pattern */}
      <line x1="10" y1="12" x2="22" y2="12" stroke="#406080" strokeWidth="0.8" opacity="0.6" />
      <line x1="11" y1="17" x2="21" y2="17" stroke="#406080" strokeWidth="0.8" opacity="0.6" />
      <line x1="12" y1="22" x2="20" y2="22" stroke="#406080" strokeWidth="0.8" opacity="0.6" />
      <line x1="13" y1="9" x2="14" y2="26" stroke="#406080" strokeWidth="0.8" opacity="0.6" />
      <line x1="16" y1="9" x2="16" y2="27" stroke="#406080" strokeWidth="0.8" opacity="0.6" />
      <line x1="19" y1="9" x2="18" y2="26" stroke="#406080" strokeWidth="0.8" opacity="0.6" />
      {/* Green recycling triangle symbol */}
      <g transform="translate(11, 13) scale(0.42)">
        <path d="M12 2L16 9H8L12 2Z" fill="#30B040" />
        <path d="M22 17L17 23L13 16L22 17Z" fill="#30B040" />
        <path d="M2 17L11 16L7 23L2 17Z" fill="#30B040" />
      </g>
      <defs>
        <linearGradient id="binGrad" x1="7" y1="8" x2="25" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4E4F4" stopOpacity="0.85" />
          <stop offset="0.7" stopColor="#90B4D8" stopOpacity="0.85" />
          <stop offset="1" stopColor="#6084B0" stopOpacity="0.9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function MyNetworkPlacesIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Upper PC */}
      <rect x="4" y="4" width="13" height="10" rx="1" fill="#E8E4D8" stroke="#706858" strokeWidth="1" />
      <rect x="6" y="6" width="9" height="6" fill="#184088" />
      {/* Lower PC */}
      <rect x="15" y="14" width="13" height="10" rx="1" fill="#E8E4D8" stroke="#706858" strokeWidth="1" />
      <rect x="17" y="16" width="9" height="6" fill="#184088" />
      {/* Network cable lines */}
      <path d="M10 15V26M10 26H22M22 26V25" stroke="#385878" strokeWidth="1.5" />
      <rect x="9" y="25" width="2" height="2" fill="#E8A020" />
      <rect x="21" y="25" width="2" height="2" fill="#E8A020" />
    </svg>
  );
}

export function NotepadIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Notepad base */}
      <rect x="6" y="4" width="20" height="24" rx="2" fill="#FFFFFF" stroke="#8090A0" strokeWidth="1" />
      {/* Blue top header band */}
      <path d="M6 6C6 4.9 6.9 4 8 4H24C25.1 4 26 4.9 26 6V9H6V6Z" fill="#4A84D8" />
      {/* Ruled lines */}
      <line x1="9" y1="13" x2="23" y2="13" stroke="#90A8C0" strokeWidth="1" />
      <line x1="9" y1="16" x2="23" y2="16" stroke="#90A8C0" strokeWidth="1" />
      <line x1="9" y1="19" x2="23" y2="19" stroke="#90A8C0" strokeWidth="1" />
      <line x1="9" y1="22" x2="19" y2="22" stroke="#90A8C0" strokeWidth="1" />
      {/* Yellow pencil lying across */}
      <g transform="translate(14, 15) rotate(-35)">
        <polygon points="0,0 3,0 3,14 0,14" fill="#FFC820" stroke="#B88010" strokeWidth="0.8" />
        <polygon points="0,14 3,14 1.5,17" fill="#F0D0A0" />
        <polygon points="1,16 2,16 1.5,17" fill="#303030" />
        <rect x="0" y="-3" width="3" height="3" fill="#F06060" />
      </g>
    </svg>
  );
}

export function OutlookExpressIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Blue globe background */}
      <circle cx="16" cy="16" r="11" fill="url(#globeGrad)" />
      <ellipse cx="16" cy="16" rx="5" ry="11" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" />
      <line x1="5" y1="16" x2="27" y2="16" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" />
      {/* White envelope in front */}
      <rect x="6" y="11" width="20" height="14" rx="1.5" fill="#FFFFFF" stroke="#8090A0" strokeWidth="1" />
      <path d="M6 12L16 19L26 12" stroke="#5078A0" strokeWidth="1.2" />
      <defs>
        <linearGradient id="globeGrad" x1="8" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#68B8F8" />
          <stop offset="1" stopColor="#1850A0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function PaintIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Wooden palette */}
      <path d="M7 16C5 9 12 4 19 5C26 6 28 12 26 17C24.5 21 21 21 19 23C17 25 19 28 15 28C9 28 9 23 7 16Z" fill="#F0D498" stroke="#A88040" strokeWidth="1.2" />
      {/* Thumb hole */}
      <ellipse cx="19" cy="24" rx="2" ry="2.5" fill="#FFFFFF" stroke="#A88040" strokeWidth="0.8" />
      {/* Paint splotches */}
      <circle cx="11" cy="9" r="2.2" fill="#E83020" />
      <circle cx="17" cy="8" r="2.2" fill="#F8C000" />
      <circle cx="22" cy="11" r="2.2" fill="#209830" />
      <circle cx="24" cy="16" r="2.2" fill="#1868D8" />
      <circle cx="11" cy="16" r="2" fill="#A040B0" />
      {/* Paintbrush */}
      <g transform="translate(18, 12) rotate(42)">
        <rect x="-1" y="-8" width="2" height="14" fill="#683818" rx="0.5" />
        <rect x="-1.5" y="6" width="3" height="3" fill="#C0C8D0" />
        <path d="M-1.5 9C-1.5 9 -2 13 0 13C2 13 1.5 9 1.5 9Z" fill="#202020" />
      </g>
    </svg>
  );
}

export function PinballIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Space Cadet Pinball table */}
      <rect x="6" y="4" width="20" height="24" rx="2" fill="#101428" stroke="#506080" strokeWidth="1" />
      {/* Glowing table markings */}
      <circle cx="16" cy="13" r="5" stroke="#7040D0" strokeWidth="1.5" />
      <circle cx="16" cy="13" r="2" fill="#FFC820" />
      {/* Bumpers */}
      <circle cx="11" cy="9" r="2" fill="#E03020" stroke="#FFFFFF" strokeWidth="0.8" />
      <circle cx="21" cy="9" r="2" fill="#E03020" stroke="#FFFFFF" strokeWidth="0.8" />
      {/* Flippers */}
      <line x1="10" y1="23" x2="14" y2="22" stroke="#FF4020" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="23" x2="18" y2="22" stroke="#FF4020" strokeWidth="2" strokeLinecap="round" />
      {/* Pinball metallic sphere */}
      <circle cx="18" cy="17" r="1.8" fill="url(#ballGrad)" />
      <defs>
        <radialGradient id="ballGrad" cx="30%" cy="30%" r="70%">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.6" stopColor="#C0C8D0" />
          <stop offset="1" stopColor="#506070" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function ControlPanelIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Control panel folder/window */}
      <rect x="5" y="6" width="22" height="20" rx="2" fill="#ECE9D8" stroke="#7A96DF" strokeWidth="1.2" />
      <path d="M5 8C5 6.9 5.9 6 7 6H25C26.1 6 27 6.9 27 8V11H5V8Z" fill="#0055EA" />
      {/* Gears / sliders */}
      <circle cx="12" cy="18" r="4" stroke="#708090" strokeWidth="1.5" fill="#E0E4E8" />
      <circle cx="12" cy="18" r="1.5" fill="#506070" />
      <line x1="19" y1="14" x2="24" y2="14" stroke="#506070" strokeWidth="1.5" />
      <line x1="19" y1="18" x2="24" y2="18" stroke="#506070" strokeWidth="1.5" />
      <line x1="19" y1="22" x2="24" y2="22" stroke="#506070" strokeWidth="1.5" />
      <circle cx="21" cy="18" r="2" fill="#3080E0" />
    </svg>
  );
}

export function WindowsMediaPlayerIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" fill="url(#wmpGrad)" stroke="#204888" strokeWidth="1" />
      <circle cx="16" cy="16" r="8" fill="#182C4E" />
      {/* Play triangle */}
      <polygon points="14,12 21,16 14,20" fill="url(#wmpPlayGrad)" />
      <defs>
        <linearGradient id="wmpGrad" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#68A8F8" />
          <stop offset="0.7" stopColor="#285CB8" />
          <stop offset="1" stopColor="#082868" />
        </linearGradient>
        <linearGradient id="wmpPlayGrad" x1="14" y1="12" x2="21" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFA020" />
          <stop offset="1" stopColor="#E05000" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function TurnOffComputerIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="url(#powerGrad)" stroke="#B02000" strokeWidth="1" />
      <path d="M12 6V12M8.5 8.5C7 10 7 13.5 8.5 15.5C10.5 17.5 13.5 17.5 15.5 15.5C17 13.5 17 10 15.5 8.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="powerGrad" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF6040" />
          <stop offset="1" stopColor="#C02008" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LogOffIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="url(#keyGrad)" stroke="#B08010" strokeWidth="1" />
      {/* Golden key */}
      <circle cx="10" cy="10" r="3.5" stroke="#FFFFFF" strokeWidth="1.8" />
      <path d="M12.5 12.5L17 17M15.5 15.5L17 14M17 17L18.5 15.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      <defs>
        <linearGradient id="keyGrad" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD040" />
          <stop offset="1" stopColor="#E09010" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function HardDriveIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="5" y="11" width="22" height="10" rx="1.5" fill="#E0DCD0" stroke="#706858" strokeWidth="1" />
      <line x1="7" y1="18" x2="25" y2="18" stroke="#A8A090" strokeWidth="1" />
      <circle cx="23" cy="15" r="1" fill="#30B040" />
      <rect x="8" y="13" width="7" height="3" rx="0.5" fill="#706858" />
    </svg>
  );
}

export function FloppyDriveIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="6" y="8" width="20" height="16" rx="1" fill="#4A6890" stroke="#283C58" strokeWidth="1" />
      <rect x="10" y="8" width="12" height="8" fill="#C0C8D0" stroke="#788898" strokeWidth="0.8" />
      <rect x="12" y="10" width="3" height="4" fill="#304868" />
      <rect x="9" y="18" width="14" height="4" fill="#FFFFFF" />
      <line x1="11" y1="20" x2="17" y2="20" stroke="#1850A0" strokeWidth="1" />
    </svg>
  );
}

export function PalmAvatar({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="3" fill="url(#skyGrad)" />
      {/* Palm tree silhouettes with blue sky */}
      <path d="M14 48C15 36 18 26 21 17" stroke="#382810" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M21 17C16 14 10 16 6 20M21 17C18 11 15 8 10 7M21 17C21 11 23 7 28 6M21 17C26 12 31 12 34 16M21 17C26 17 31 20 33 25" stroke="#284818" strokeWidth="2" strokeLinecap="round" />
      {/* Secondary palm */}
      <path d="M36 48C35 38 33 28 29 20" stroke="#382810" strokeWidth="2" strokeLinecap="round" />
      <path d="M29 20C25 18 20 19 17 22M29 20C28 15 26 11 22 10M29 20C32 15 37 15 41 17M29 20C33 21 37 24 39 28" stroke="#385820" strokeWidth="1.8" strokeLinecap="round" />
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3088E0" />
          <stop offset="0.7" stopColor="#80C8F8" />
          <stop offset="1" stopColor="#D8F0FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
