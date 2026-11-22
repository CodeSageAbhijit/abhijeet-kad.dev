export function requestDesktopFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  }
}

export function exitDesktopFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}
