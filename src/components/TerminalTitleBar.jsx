export default function TerminalTitleBar({ title }) {
  return (
    <div className="term-bar">
      <span className="term-bar-lights" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="term-bar-title">{title}</span>
    </div>
  );
}
