import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";
import "./theme.css";

const isReload = performance.getEntriesByType("navigation")[0]?.type === "reload";
const retroPath = `${import.meta.env.BASE_URL}retro`;
if (isReload && ![retroPath, `${retroPath}/`].includes(location.pathname)) {
  const previousRestoration = history.scrollRestoration;
  history.scrollRestoration = "manual";
  if (location.hash) {
    history.replaceState(history.state, "", location.pathname + location.search);
  }
  window.addEventListener("pageshow", () => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
      history.scrollRestoration = previousRestoration;
    });
  }, { once: true });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
