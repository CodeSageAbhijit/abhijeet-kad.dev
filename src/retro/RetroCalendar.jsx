import { useState } from "react";

// Month navigation adapted from PortfolioXP's Calendar.vue. See public/retro/credits.txt.
const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
const weekdayLabel = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const dateLabel = new Intl.DateTimeFormat(undefined, { dateStyle: "full" });
const weekdays = Array.from({ length: 7 }, (_, day) => weekdayLabel.format(new Date(2024, 0, day + 7)));

export default function RetroCalendar() {
  const today = new Date();
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const year = month.getFullYear();
  const currentMonth = month.getMonth();
  const first = month.getDay();
  const count = new Date(year, currentMonth + 1, 0).getDate();
  const isCurrentMonth = year === today.getFullYear() && currentMonth === today.getMonth();

  function move(step) {
    setMonth(new Date(year, currentMonth + step, 1));
  }

  return (
    <div className="retro-calendar">
      <header className="retro-calendar-bar">
        <button type="button" className="retro-native-button" aria-label="Previous month" onClick={() => move(-1)}>‹</button>
        <strong role="status">{monthLabel.format(month)}</strong>
        <button type="button" className="retro-native-button" aria-label="Next month" onClick={() => move(1)}>›</button>
      </header>
      <div className="retro-calendar-grid" aria-label={monthLabel.format(month)}>
        {weekdays.map((day, index) => <b key={index}>{day}</b>)}
        {Array.from({ length: first }, (_, index) => <span key={`blank-${index}`} aria-hidden="true" />)}
        {Array.from({ length: count }, (_, index) => {
          const day = index + 1;
          const current = isCurrentMonth && day === today.getDate();
          return <span key={day} aria-current={current ? "date" : undefined} aria-label={dateLabel.format(new Date(year, currentMonth, day))}>{day}</span>;
        })}
      </div>
      <footer className="retro-window-status">
        <button type="button" className="retro-native-button" onClick={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>Today</button>
        <span>{dateLabel.format(today)}</span>
      </footer>
    </div>
  );
}
