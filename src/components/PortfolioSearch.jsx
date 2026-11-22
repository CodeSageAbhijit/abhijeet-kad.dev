import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchPortfolio } from "../utils/portfolioSearch";
import ComputersCanvas from "./canvas/Computers";
import { createKeyClick } from "./canvas/keyClick";
import "./PortfolioSearch.css";

const MAX_QUERY_LENGTH = 96;
const PAGE_SIZE = 4;

export default function PortfolioSearch({ isBooting }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [keystroke, setKeystroke] = useState(null);
  const [sound, setSound] = useState(true);
  const input = useRef(null);
  const audio = useRef(null);
  const navigate = useNavigate();
  const matches = useMemo(() => searchPortfolio(query), [query]);
  const start = Math.floor(selected / PAGE_SIZE) * PAGE_SIZE;
  const display = useMemo(() => ({
    query,
    count: matches.length,
    start,
    selected,
    titles: matches.slice(start, start + PAGE_SIZE).map(({ title }) => title),
  }), [query, matches, selected, start]);

  useEffect(() => () => audio.current?.dispose(), []);

  function updateQuery(value) {
    setQuery(value);
    setSelected(0);
  }

  function focusSearch() {
    input.current?.focus({ preventScroll: true });
  }

  function openResult(index) {
    const result = matches[index];
    if (!result) return;
    if (result.project) navigate({ hash: result.href });
    else if (window.location.hash === result.href) {
      document.getElementById(result.href.slice(1))?.scrollIntoView();
    } else {
      window.location.hash = result.href;
    }
  }

  function changeSelection(step) {
    setSelected((current) => Math.max(0, Math.min(matches.length - 1, current + step)));
  }

  function playClick(key) {
    if (!sound) return;
    try {
      audio.current ??= createKeyClick();
      audio.current?.play(key);
    } catch {
      // Search still works on devices where audio is unavailable.
    }
  }

  function handleModelKey(key) {
    playClick(key);
    if (!key) return;
    if (key === "Enter") {
      openResult(selected);
      return;
    }
    if (key === "Escape") {
      updateQuery("");
      return;
    }

    const element = input.current;
    const isFocused = document.activeElement === element;
    const start = isFocused ? element.selectionStart ?? query.length : query.length;
    const end = isFocused ? element.selectionEnd ?? start : start;
    let next;
    let cursor;
    if (key === "Backspace") {
      cursor = start === end ? Math.max(0, start - 1) : start;
      next = query.slice(0, cursor) + query.slice(end);
    } else if (key === "Delete") {
      cursor = start;
      next = query.slice(0, start) + query.slice(start === end ? end + 1 : end);
    } else {
      cursor = Math.min(start + key.length, MAX_QUERY_LENGTH);
      next = (query.slice(0, start) + key + query.slice(end)).slice(0, MAX_QUERY_LENGTH);
    }
    updateQuery(next);
    if (isFocused) requestAnimationFrame(() => element.setSelectionRange(cursor, cursor));
  }

  function handleTyping(event) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.nativeEvent.isComposing) return;
    const { key } = event;
    if (key.length === 1 || ["Backspace", "Delete", "Enter", "Escape"].includes(key)) {
      playClick(key);
      setKeystroke({ key });
    }
    if (key === "Escape") updateQuery("");
    if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      changeSelection(key === "ArrowDown" ? 1 : -1);
    }
  }

  return (
    <section id="search" className="portfolio-search" aria-labelledby="portfolio-search-title">
      <h2 id="portfolio-search-title" className="sr-only">Search the portfolio</h2>
      <ComputersCanvas
        display={display}
        keystroke={keystroke}
        onKey={handleModelKey}
        onFocus={focusSearch}
        onResult={openResult}
        onPage={(direction) => changeSelection(direction * PAGE_SIZE)}
        sound={sound}
        onSoundToggle={() => setSound(!sound)}
        isBooting={isBooting}
      >
        <form
          className="pc-keyboard-form"
          role="search"
          aria-label="Portfolio"
          onSubmit={(event) => {
            event.preventDefault();
            openResult(selected);
          }}
        >
          <input
            ref={input}
            type="text"
            role="searchbox"
            aria-label="Search projects, skills, and experience"
            aria-describedby="pc-instructions"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            maxLength={MAX_QUERY_LENGTH}
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            onKeyDown={handleTyping}
          />
        </form>
        <span className="sr-only" role="status">
          {matches.length ? `${matches.length} options. Selected ${matches[selected]?.title}.` : "No matches."}
        </span>
      </ComputersCanvas>
    </section>
  );
}
