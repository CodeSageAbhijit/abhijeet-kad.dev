import { SpiritSlot } from "../spirits/SpiritGuestbook";
import { useEffect, useRef, useState, useTransition } from "react";
import { Link } from "react-router-dom";
import { designFocus, experiences, projects, technologies } from "../constants";
import { InternetExplorerIcon, MyDocumentsIcon } from "./RetroIcons";
import { track, trackHiddenFeature } from "../utils/analytics";

const site = "abhijit-kad.dev";
const pages = { home: "Home", projects: "Projects", experience: "Experience", contact: "Contact" };
const profiles = {
  github: { name: "GitHub", url: "https://github.com/CodeSageAbhijit", handle: "CodeSageAbhijit" },
  linkedin: { name: "LinkedIn", url: "https://www.linkedin.com/in/abhijit-kad/", handle: "Abhijeet Kad" },
};
const favorites = { home: "Retro Portfolio", github: "GitHub", linkedin: "LinkedIn" };
const notesKey = "retro-pc-notes";

function ProjectDetails({ project }) {
  return (
    <article className="retro-project">
      <div className="retro-project-type">{project.type} application</div>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <ul className="retro-tags" aria-label="Technologies">
        {project.tags.map(({ name }) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <div className="retro-project-links">
        <a
          href={project.source_code_link}
          target="_blank"
          rel="noreferrer"
          data-project-link="true"
          onClick={() => track("Project Link Clicked", { project_name: project.name, link_type: "github", url: project.source_code_link }, { transport: "sendBeacon" })}
        >
          Source code ↗
        </a>
        {project.live_link && (
          <a
            href={project.live_link}
            target="_blank"
            rel="noreferrer"
            data-project-link="true"
            onClick={() => track("Project Link Clicked", { project_name: project.name, link_type: "live", url: project.live_link }, { transport: "sendBeacon" })}
          >
            Live site ↗
          </a>
        )}
        {project.exe_link && (
          <a href={project.exe_link} target="_blank" rel="noreferrer">
            Download installer ↗
          </a>
        )}
        {project.apk_link && (
          <a href={project.apk_link} target="_blank" rel="noreferrer">
            Download APK ↗
          </a>
        )}
      </div>
    </article>
  );
}

function pageAddress(page) {
  if (profiles[page]) return profiles[page].url;
  return `https://${site}/${page === "home" ? "" : "#" + page}`;
}

function resolvePage(text) {
  const input = text.trim().toLowerCase();
  if (Object.hasOwn(pages, input) || Object.hasOwn(profiles, input)) return input;
  try {
    const url = new URL(input.includes("://") ? input : `https://${input}`);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    const normalized = (link) => link.hostname.replace(/^www\./, "") + link.pathname.replace(/\/$/, "");
    for (const [id, profile] of Object.entries(profiles)) {
      if (normalized(url) === normalized(new URL(profile.url.toLowerCase()))) return id;
    }
    if (![site, "abhijeet-kad.dev"].includes(normalized(url))) return null;
    const section = url.hash.slice(1);
    if (!section || section === "about" || section === "skills") return "home";
    if (section === "work") return "experience";
    return Object.hasOwn(pages, section) ? section : null;
  } catch {
    return null;
  }
}

export function PortfolioBrowser({ onOpenProjects /* , onNavigate */ }) {
  const [history, setHistory] = useState({ pages: ["home"], index: 0 });
  const currentTab = history.pages[history.index];
  const [url, setUrl] = useState(pageAddress("home"));
  const [error, setError] = useState(false);
  const [busy, startTransition] = useTransition();
  const body = useRef(null);
  const profile = profiles[currentTab];

  function navigate(page, step) {
    trackHiddenFeature("ie7_portfolio_browser");
    // if (page !== currentTab) onNavigate(page);
    setUrl(pageAddress(page));
    setError(false);
    body.current?.scrollTo(0, 0);
    startTransition(() => setHistory((previous) => {
      if (step) return { ...previous, index: previous.index + step };
      if (page === previous.pages[previous.index]) return previous;
      return { pages: [...previous.pages.slice(0, previous.index + 1), page], index: previous.index + 1 };
    }));
  }

  function submit(event) {
    event.preventDefault();
    const page = resolvePage(url);
    if (page) navigate(page);
    else setError(true);
  }

  return (
    <div className={`retro-ie-window${busy ? " classic-busy" : ""}`} aria-busy={busy}>
      <div className="retro-ie-toolbar" aria-label="Browser navigation">
        <button type="button" className="retro-ie-btn-circle" aria-label="Back"
          disabled={busy || history.index === 0} onClick={() => navigate(history.pages[history.index - 1], -1)}>◀</button>
        <button type="button" className="retro-ie-btn-circle" aria-label="Forward"
          disabled={busy || history.index === history.pages.length - 1} onClick={() => navigate(history.pages[history.index + 1], 1)}>▶</button>
        <button type="button" className="retro-ie-tool-btn" onClick={() => navigate("home")}>⌂ Home</button>
        <button type="button" className="retro-ie-tool-btn" aria-label="Refresh" onClick={() => navigate(currentTab)}>↻</button>
        <details className="retro-ie-favorites">
          <summary className="retro-ie-tool-btn">★ Favorites</summary>
          <div>
            {Object.entries(favorites).map(([id, title]) => (
              <button type="button" key={id} onClick={(event) => {
                event.currentTarget.closest("details").open = false;
                navigate(id);
              }}>{title}</button>
            ))}
          </div>
        </details>
      </div>
      <form className="retro-ie-addressbar" onSubmit={submit}>
        <label htmlFor="retro-ie-address-input">Address</label>
        <div className="retro-ie-input-wrap">
          <InternetExplorerIcon size={15} />
          <input id="retro-ie-address-input" type="text" inputMode="url" autoCapitalize="none" spellCheck={false}
            value={url} onChange={(event) => { setUrl(event.target.value); setError(false); }} />
        </div>
        <button type="submit" className="retro-ie-go-btn">Go</button>
      </form>
      {error && <p className="retro-ie-error" role="alert">Choose a portfolio page or profile from Favorites.</p>}
      <div className="retro-ie-content-area" ref={body}>
        <nav className="retro-portfolio-subnav" aria-label="Portfolio pages">
          {Object.entries({ ...pages, github: "GitHub" }).map(([id, title]) => (
            <button type="button" key={id} aria-current={currentTab === id ? "page" : undefined}
              className={currentTab === id ? "is-active" : ""} onClick={() => navigate(id)}>{title}</button>
          ))}
        </nav>
        <div className="retro-web-content">
          {currentTab === "home" && (
            <>
              <div className="retro-site-hero">
                <span>Software engineering portfolio</span>
                <h3>Abhijeet Kad</h3>
                <p>Full-stack development and system design</p>
              </div>
              <h4>Engineering focus</h4>
              <p>{designFocus.join(" · ")}</p>
              <div className="retro-web-links">
                <button type="button" onClick={() => navigate("projects")}>View projects →</button>
                <Link to="/" target="_blank" rel="noopener noreferrer">Open main portfolio ↗</Link>
                <button type="button" onClick={() => navigate("linkedin")}>LinkedIn</button>
              </div>
              <h4>Technologies</h4>
              <p>{technologies.map(({ name }) => name).join(" · ")}</p>
            </>
          )}
          {currentTab === "projects" && (
            <>
              <h3>Projects</h3>
              <button type="button" className="retro-native-button" onClick={onOpenProjects}>Open Projects folder</button>
              {projects.map((project) => <ProjectDetails key={project.name} project={project} />)}
            </>
          )}
          {currentTab === "experience" && (
            <>
              <h3>Experience</h3>
              {experiences.map((job) => (
                <article className="retro-project" key={job.company_name}>
                  <h4>{job.title}</h4>
                  <p>
                    {job.company_name} · {job.date}
                    {job.subtitle && <><br />{job.subtitle}</>}
                  </p>
                  <ul>{job.points.map((point) => <li key={point}>{point}</li>)}</ul>
                </article>
              ))}
            </>
          )}
          {currentTab === "contact" && (
            <>
              <h3>Contact</h3>
              <div className="retro-web-links">
                <Link to="/#contact">Open portfolio contact form ↗</Link>
                <button type="button" onClick={() => navigate("linkedin")}>LinkedIn</button>
              </div>
            </>
          )}
          {profile && (
            <>
              <h3>{profile.name}</h3>
              <p>{profile.handle}</p>
              <div className="retro-web-links">
                <a href={profile.url} target="_blank" rel="noopener noreferrer">Open live {profile.name} profile ↗</a>
              </div>
              {currentTab === "github" && (
                <ul className="retro-profile-repositories">
                  {projects.filter((project) => project.source_code_link?.startsWith(`${profile.url}/`)).map((project) => (
                    <li key={project.name}><a href={project.source_code_link} target="_blank" rel="noopener noreferrer">{project.name} ↗</a></li>
                  ))}
                </ul>
              )}
            </>
          )}
          <SpiritSlot home="retro" />
        </div>
      </div>
      <footer className="retro-ie-statusbar"><span>{busy ? "Opening…" : profile?.name ?? site}</span></footer>
    </div>
  );
}

export function ProjectFiles({ onOpenPictures }) {
  const [project, setProject] = useState(null);

  return (
    <div className="retro-explorer-window">
      <div className="retro-explorer-addressbar">
        <button type="button" className="retro-native-button" disabled={!project} onClick={() => setProject(null)}>‹ Projects</button>
        {project && <span>{project.name}</span>}
      </div>
      <div className="retro-ie-content-area">
        {project ? (
          <section className="retro-web-content">
            <ProjectDetails project={project} />
            {!!project.images?.length && <button type="button" className="retro-native-button" onClick={() => onOpenPictures(project.name)}>View screenshots</button>}
          </section>
        ) : (
          <div className="retro-items-grid retro-project-folder">
            {projects.map((item) => (
              <button
                className="retro-item-tile"
                type="button"
                key={item.name}
                onClick={() => {
                  track("Project Opened", { project_name: item.name });
                  setProject(item);
                }}
              >
                <MyDocumentsIcon size={28} /><span>{item.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <footer className="retro-explorer-statusbar">{project ? project.type : `${projects.length} projects`}</footer>
    </div>
  );
}

/**
 * Authentic Untitled - Notepad (matches Image 3)
 */
export function Notes() {
  const [text, setText] = useState(() => {
    try {
      return localStorage.getItem(notesKey) ?? "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(notesKey, text);
    } catch {
      // Ignored
    }
  }, [text]);

  return (
    <div className="retro-notepad-window">
      <textarea
        className="retro-notepad-textarea"
        aria-label="Notepad Editor"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
}

/**
 * Display & Retro Settings
 */
export function DisplaySettings({ toggles }) {
  return (
    <div className="retro-settings">
      <fieldset>
        <legend>Sound Effects & Hardware</legend>
        <label>
          <input type="checkbox" checked={toggles.sound} onChange={toggles.onSound} />
          Startup, desktop and game sounds
        </label>
        {/* Cartoon cameos paused.
        <label>
          <input type="checkbox" checked={toggles.cameos} onChange={toggles.onCameos} />
          Cartoon cameos
        </label>
        */}
        <label>
          <input type="checkbox" checked={toggles.scanlines} onChange={toggles.onScanlines} />
          CRT Monitor scanlines simulation
        </label>
      </fieldset>

      <fieldset>
        <legend>Display Mode</legend>
        <button type="button" className="retro-native-button" onClick={toggles.onFullscreen}>
          {toggles.fullscreen ? "Exit Full Screen" : "Full Screen"}
        </button>
      </fieldset>

      <a href={`${import.meta.env.BASE_URL}retro/credits.txt`} target="_blank" rel="noreferrer">
        Photo, Sounds & Software Credits ↗
      </a>
    </div>
  );
}

