// Adapted from PortfolioXP's windowsStore.js. See public/retro/credits.txt.
const storageKey = "retro-desktop-windows";

export function loadOpenWindows() {
  try {
    const ids = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(ids) ? [...new Set(ids.filter((id) => typeof id === "string"))] : [];
  } catch {
    return [];
  }
}

export function saveOpenWindows(ids) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(ids));
  } catch {
    // Desktop windows still work when browser storage is unavailable.
  }
}
