export const SCREEN_WIDTH = 640;
export const SCREEN_HEIGHT = 512;
const ROW_TOP = 180;
const ROW_HEIGHT = 61;
const FOOTER_TOP = 434;

export const initialScreen = { query: "", count: 0, start: 0, selected: 0, titles: [] };

export function drawComputerScreen(context, { query, count, start, selected, titles }) {
  context.fillStyle = "#000";
  context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  context.strokeStyle = "#593b48";
  context.lineWidth = 3;
  context.strokeRect(23, 23, 594, 466);
  context.fillStyle = "#f1bcc8";
  context.font = "bold 37px monospace";
  context.fillText("PORTFOLIO SEARCH", 48, 78);
  context.fillStyle = "#2b1b26";
  context.fillRect(43, 103, 554, 61);
  context.fillStyle = "#f5eadf";
  context.font = "34px monospace";
  context.fillText(query ? `> ${query.slice(-23)}_` : "> Type to search_", 55, 145, 528);

  titles.forEach((title, index) => {
    const row = ROW_TOP + index * ROW_HEIGHT;
    const active = start + index === selected;
    if (active) {
      context.fillStyle = "#2d1f2a";
      context.fillRect(43, row + 3, 554, ROW_HEIGHT - 6);
    }
    context.fillStyle = active ? "#ffe9ed" : "#d4c3ca";
    context.font = "33px monospace";
    context.fillText(`${active ? "› " : "  "}${title}`, 55, row + 42, 528);
  });

  context.fillStyle = "#bba8ae";
  if (!count) {
    context.font = "34px monospace";
    context.fillText("No matches", 55, 237);
  }
  context.font = "24px monospace";
  context.fillText(query ? `${count} ${count === 1 ? "match" : "matches"}` : "Browse sections", 50, 468);
  if (start > 0) {
    context.fillStyle = "#f1bcc8";
    context.fillText("[ ‹ ]", 415, 468);
  }
  if (start + titles.length < count) {
    context.fillStyle = "#f1bcc8";
    context.fillText("[ › ]", 510, 468);
  }
  context.fillStyle = "rgba(0,0,0,.14)";
  for (let y = 0; y < SCREEN_HEIGHT; y += 6) context.fillRect(0, y, SCREEN_WIDTH, 2);
}

export function openScreenControl(x, y, { start, count, titles }, handlers) {
  if (x >= 43 && x <= 597 && y >= ROW_TOP && y < ROW_TOP + titles.length * ROW_HEIGHT) {
    handlers.onResult(start + Math.floor((y - ROW_TOP) / ROW_HEIGHT));
  } else if (y >= FOOTER_TOP && x >= 404) {
    if (x >= 500 && start + titles.length < count) handlers.onPage(1);
    else if (x < 500 && start > 0) handlers.onPage(-1);
  } else handlers.onFocus();
}
