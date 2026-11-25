import { SpiritSlot } from "../spirits/SpiritGuestbook";
import { authenticatedClient, spiritsEnabled } from "../spirits/api";
import { useEffect, useRef, useState, useTransition } from "react";
import { Link } from "react-router-dom";
import { designFocus, experiences, projects, technologies } from "../constants";
import { InternetExplorerIcon, MyDocumentsIcon } from "./RetroIcons";
import { markEasterEggFound, track, trackHiddenFeature } from "../utils/analytics";

const site = "abhijit-kad.dev";
const pages = {
  google: "Google",
  home: "Portfolio",
  projects: "Projects",
  experience: "Experience",
  contact: "Contact",
  orkut: "orkut",
};
const profiles = {
  github: { name: "GitHub", url: "https://github.com/CodeSageAbhijit", handle: "CodeSageAbhijit" },
  linkedin: { name: "LinkedIn", url: "https://www.linkedin.com/in/abhijit-kad/", handle: "Abhijeet Kad" },
};
const favorites = {
  google: "Google India (2006)",
  home: "Retro Portfolio",
  orkut: "orkut (2007)",
  github: "GitHub",
  linkedin: "LinkedIn",
};
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
  if (page === "google") return "https://www.google.co.in/";
  if (page === "orkut") return "https://www.orkut.co.in/Profile.aspx?uid=abhijeet";
  if (profiles[page]) return profiles[page].url;
  return `https://${site}/${page === "home" ? "" : "#" + page}`;
}

function resolvePage(text) {
  const input = text.trim().toLowerCase();
  if (Object.hasOwn(pages, input) || Object.hasOwn(profiles, input)) return input;
  try {
    const url = new URL(input.includes("://") ? input : `https://${input}`);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    const host = url.hostname.replace(/^www\./, "");
    if (["google.com", "google.co.in"].includes(host)) return "google";
    if (["orkut.com", "orkut.co.in"].includes(host)) return "orkut";
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

const INITIAL_SCRAPS = [
  { from: "Rahul", time: "2 hrs ago", msg: "Heyy Abhi! Cool profile... check out my scraps too! :)" },
  { from: "Priya", time: "Yesterday", msg: "Saw your portfolio 3D CRT, total cybercafé vibes!" },
];

export function PortfolioBrowser({ onOpenProjects /* , onNavigate */ }) {
  const [history, setHistory] = useState({ pages: ["google"], index: 0 });
  const currentTab = history.pages[history.index];
  const [url, setUrl] = useState(pageAddress("google"));
  const [error, setError] = useState(false);
  const [busy, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedTerm, setSearchedTerm] = useState("");
  const [orkutView, setOrkutView] = useState("profile"); // "profile" | "scrapbook"
  const [scraps, setScraps] = useState(INITIAL_SCRAPS);
  const [scrapName, setScrapName] = useState("");
  const [scrapDraft, setScrapDraft] = useState("");
  const [scrapBusy, setScrapBusy] = useState(false);
  const [scrapError, setScrapError] = useState("");
  const [orkutFans, setOrkutFans] = useState(99);
  const [becameFan, setBecameFan] = useState(false);
  const body = useRef(null);
  const profile = profiles[currentTab];

  useEffect(() => {
    if (!spiritsEnabled) return;
    let active = true;
    authenticatedClient()
      .then((client) => client.rpc("orkut_scrapbook", { action: "list" }))
      .then(({ data, error: rpcErr }) => {
        if (!active || rpcErr || !Array.isArray(data)) return;
        const formatted = data.map((row) => ({
          id: row.id,
          from: row.from || "Anonymous",
          time: row.created_at
            ? new Date(row.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
            : "Recently",
          msg: row.msg,
        }));
        setScraps([...formatted, ...INITIAL_SCRAPS]);
      })
      .catch(() => {
        // Keep seeded scraps if offline or migration pending
      });
    return () => { active = false; };
  }, []);

  function navigate(page, step, triggerSource = "click") {
    trackHiddenFeature("ie7_portfolio_browser");
    if (page === "orkut") {
      markEasterEggFound("orkut_2007_profile", triggerSource);
    }
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
    if (page) navigate(page, undefined, "url");
    else setError(true);
  }

  function handleGoogleSearch(e, lucky = false) {
    e?.preventDefault();
    const q = searchQuery.trim();
    trackHiddenFeature("ie7_google_search", { lucky });
    if (lucky) {
      if (q.toLowerCase().includes("orkut")) {
        navigate("orkut", undefined, "search");
      } else {
        navigate("home", undefined, "search");
      }
      return;
    }
    if (q.toLowerCase().includes("orkut")) {
      setSearchedTerm(q);
      return;
    }
    setSearchedTerm(q || "abhijeet kad portfolio");
  }

  async function postScrap(e) {
    e.preventDefault();
    const message = scrapDraft.trim();
    if (!message || scrapBusy) return;
    const sender = scrapName.trim() || "Anonymous";
    setScrapBusy(true);
    setScrapError("");
    trackHiddenFeature("orkut_scrapbook");

    if (spiritsEnabled) {
      try {
        const client = await authenticatedClient();
        const { data, error: rpcErr } = await client.rpc("orkut_scrapbook", {
          action: "post",
          payload: { sender_name: sender, message },
        });
        if (rpcErr) throw new Error(rpcErr.message);
        const created = data || { from: sender, msg: message };
        setScraps((prev) => [
          { id: created.id, from: created.from || sender, time: "Just now", msg: created.msg || message },
          ...prev,
        ]);
        setScrapDraft("");
        setScrapBusy(false);
        return;
      } catch (err) {
        const msg = err?.message || "";
        if (msg.toLowerCase().includes("moment") || msg.toLowerCase().includes("wait")) {
          setScrapError("Give your last scrap 15 seconds before posting another.");
          setScrapBusy(false);
          return;
        }
        // Fallback to local session if backend table/RPC hasn't been migrated yet
      }
    }

    setScraps((prev) => [{ from: sender, time: "Just now", msg: message }, ...prev]);
    setScrapDraft("");
    setScrapBusy(false);
  }

  return (
    <div className={`retro-ie-window${busy ? " classic-busy" : ""}`} aria-busy={busy}>
      <div className="retro-ie-toolbar" aria-label="Browser navigation">
        <button type="button" className="retro-ie-btn-circle" aria-label="Back"
          disabled={busy || history.index === 0} onClick={() => navigate(history.pages[history.index - 1], -1)}>◀</button>
        <button type="button" className="retro-ie-btn-circle" aria-label="Forward"
          disabled={busy || history.index === history.pages.length - 1} onClick={() => navigate(history.pages[history.index + 1], 1)}>▶</button>
        <button type="button" className="retro-ie-tool-btn" onClick={() => { setSearchedTerm(""); navigate("google"); }}>⌂ Home</button>
        <button type="button" className="retro-ie-tool-btn" aria-label="Refresh" onClick={() => navigate(currentTab)}>↻</button>
        <details className="retro-ie-favorites">
          <summary className="retro-ie-tool-btn">★ Favorites</summary>
          <div>
            {Object.entries(favorites).map(([id, title]) => (
              <button type="button" key={id} onClick={(event) => {
                event.currentTarget.closest("details").open = false;
                if (id === "google") setSearchedTerm("");
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
      {error && <p className="retro-ie-error" role="alert">Try abhijit-kad.dev, google.co.in, orkut.com, or pick from Favorites.</p>}
      <div className="retro-ie-content-area" ref={body}>
        <nav className="retro-portfolio-subnav" aria-label="Portfolio pages">
          {Object.entries({ ...pages, github: "GitHub" }).map(([id, title]) => (
            <button type="button" key={id} aria-current={currentTab === id ? "page" : undefined}
              className={currentTab === id ? "is-active" : ""} onClick={() => { if (id === "google") setSearchedTerm(""); navigate(id); }}>{title}</button>
          ))}
        </nav>
        <div className={`retro-web-content${currentTab === "orkut" ? " retro-orkut-wrap" : ""}`}>
          {currentTab === "google" && (
            <div className="retro-google-page">
              <div className="retro-google-logo" aria-label="Google India">
                <span className="g-b">G</span>
                <span className="g-r">o</span>
                <span className="g-y">o</span>
                <span className="g-b">g</span>
                <span className="g-g">l</span>
                <span className="g-r">e</span>
                <sub className="g-in">India</sub>
              </div>
              <form className="retro-google-form" onSubmit={(e) => handleGoogleSearch(e, false)}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search the web, Abhijeet's work, or try 'orkut'..."
                  aria-label="Google Search"
                />
                <div className="retro-google-buttons">
                  <button type="submit" className="retro-native-button">Google Search</button>
                  <button type="button" className="retro-native-button" onClick={() => handleGoogleSearch(null, true)}>I&apos;m Feeling Lucky</button>
                </div>
              </form>

              {searchedTerm ? (
                <div className="retro-google-results">
                  <p className="retro-google-meta">Results <b>1 - 5</b> for <b>{searchedTerm}</b> (0.04 seconds)</p>
                  <article className="retro-google-hit">
                    <button type="button" onClick={() => navigate("home")}>Abhijeet Kad — Software Engineering Portfolio</button>
                    <p>Full-stack &amp; systems portfolio featuring React, Node.js, RawTorrent, and interactive 3D web builds.</p>
                    <span>https://abhijit-kad.dev/</span>
                  </article>
                  <article className="retro-google-hit">
                    <button type="button" onClick={() => navigate("orkut", undefined, "search")}>orkut - Abhijeet Kad (Mumbai, India) · 1 New Scrap!</button>
                    <p>Connect with Abhijeet on orkut · 148 friends · Trusty / Cool / Sexy ratings &amp; nostalgic scrapbook.</p>
                    <span>https://www.orkut.co.in/Profile.aspx?uid=abhijeet</span>
                  </article>
                  <article className="retro-google-hit">
                    <button type="button" onClick={() => navigate("projects")}>Projects Index — Abhijeet Kad ({projects.length} builds)</button>
                    <p>Explore desktop Electron/Node systems, mobile apps, and real-time full-stack applications.</p>
                    <span>https://abhijit-kad.dev/#projects</span>
                  </article>
                  <article className="retro-google-hit">
                    <button type="button" onClick={() => navigate("github")}>CodeSageAbhijit · GitHub Repositories</button>
                    <p>Open source contributions, system utilities, and portfolio source repositories.</p>
                    <span>https://github.com/CodeSageAbhijit</span>
                  </article>
                </div>
              ) : (
                <>
                  <p className="retro-google-langs">
                    Google.co.in offered in: <span>हिन्दी</span> <span>বাংলা</span> <span>తెలుగు</span> <span>मराठी</span> <span>தமிழ்</span>
                  </p>
                  <div className="retro-google-shortcuts">
                    <button type="button" onClick={() => navigate("home")}>Open Abhijeet Portfolio</button>
                    <span>·</span>
                    <button type="button" onClick={() => navigate("orkut", undefined, "click")}>
                      <strong style={{ color: "#ed2b91" }}>New!</strong> orkut.com Profile
                    </button>
                    <span>·</span>
                    <button type="button" onClick={() => navigate("projects")}>Projects</button>
                  </div>
                </>
              )}
            </div>
          )}

          {currentTab === "orkut" && (
            <div className="retro-orkut-page">
              <header className="retro-orkut-topbar">
                <strong className="retro-orkut-brand">orkut</strong>
                <div className="retro-orkut-nav">
                  <button type="button" onClick={() => setOrkutView("profile")}>Home</button>
                  <button type="button" onClick={() => { setOrkutView("scrapbook"); trackHiddenFeature("orkut_scrapbook"); }}>Scrapbook ({scraps.length})</button>
                  <button type="button" onClick={() => navigate("home")}>Portfolio</button>
                </div>
                <span className="retro-orkut-user">abhijeet@orkut.co.in</span>
              </header>

              <div className="retro-orkut-layout">
                <aside className="retro-orkut-sidebar">
                  <div className="retro-orkut-avatar">👨‍💻</div>
                  <h4>Abhijeet Kad</h4>
                  <p>Mumbai, India</p>
                  <p>Friends (148)</p>
                  <div className="retro-orkut-side-links">
                    <button type="button" className={orkutView === "profile" ? "is-on" : ""} onClick={() => setOrkutView("profile")}>👤 Profile</button>
                    <button type="button" className={orkutView === "scrapbook" ? "is-on" : ""} onClick={() => { setOrkutView("scrapbook"); trackHiddenFeature("orkut_scrapbook"); }}>
                      📩 Scrapbook ({scraps.length})
                    </button>
                    <button type="button" onClick={() => { if (!becameFan) { setOrkutFans((f) => f + 1); setBecameFan(true); trackHiddenFeature("orkut_become_fan"); } }}>
                      ★ {becameFan ? `Fan (${orkutFans})` : `Become a fan (${orkutFans}+)`}
                    </button>
                  </div>
                </aside>

                <div className="retro-orkut-main">
                  <div className="retro-orkut-alert">
                    <span>📩 You have <strong>1 new scrap</strong> from Rahul!</span>
                    <button type="button" onClick={() => { setOrkutView("scrapbook"); trackHiddenFeature("orkut_scrapbook"); }}>
                      Read scrap »
                    </button>
                  </div>

                  {orkutView === "profile" ? (
                    <>
                      <div className="retro-orkut-card">
                        <h3>Abhijeet Kad</h3>
                        <div className="retro-orkut-meters">
                          <div><span>Trusty</span><strong>😊😊😊 100%</strong></div>
                          <div><span>Cool</span><strong>😎😎😎 98%</strong></div>
                          <div><span>Sexy</span><strong>♥♥♥ 96%</strong></div>
                          <div><span>Fans</span><strong>★ {orkutFans}+</strong></div>
                        </div>
                        <table className="retro-orkut-table">
                          <tbody>
                            <tr><th>status:</th><td>Shipping fast, writing clean code &amp; sipping cutting chai</td></tr>
                            <tr><th>passion:</th><td>Distributed Systems, Open Source, GTA Vice City, Kishore Kumar</td></tr>
                            <tr><th>about me:</th><td>Full-stack &amp; backend engineer. Always down to build wild retro things on the web.</td></tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="retro-orkut-card">
                        <h4>Recent Visitors</h4>
                        <div className="retro-orkut-visitors">
                          {["Rahul", "Priya", "Ankit", "Neha", "Karan"].map((friend) => (
                            <span key={friend} className="retro-orkut-visitor-chip">🙂 {friend}</span>
                          ))}
                        </div>
                      </div>

                      <div className="retro-orkut-card">
                        <h4>Testimonials (2)</h4>
                        <p className="retro-orkut-testi">&ldquo;10/10 developer — fixes prod bugs faster than 2-minute Maggi.&rdquo; — <em>Ankit</em></p>
                        <p className="retro-orkut-testi">&ldquo;Came for the resume, stayed 20 mins playing Mario on his XP CRT!&rdquo; — <em>Priya</em></p>
                      </div>
                    </>
                  ) : (
                    <div className="retro-orkut-card">
                      <h4>Scrapbook ({scraps.length})</h4>
                      <form className="retro-orkut-scrapform" onSubmit={postScrap}>
                        <input
                          type="text"
                          maxLength={40}
                          placeholder="Your name (optional)..."
                          value={scrapName}
                          disabled={scrapBusy}
                          onChange={(e) => setScrapName(e.target.value)}
                          aria-label="Your name"
                        />
                        <textarea
                          rows={2}
                          maxLength={180}
                          placeholder="Leave a 2007-style scrap for Abhijeet..."
                          value={scrapDraft}
                          disabled={scrapBusy}
                          onChange={(e) => {
                            setScrapDraft(e.target.value);
                            setScrapError("");
                          }}
                          aria-label="Scrap message"
                        />
                        <div className="retro-orkut-scrapbar">
                          <button type="submit" className="retro-native-button" disabled={!scrapDraft.trim() || scrapBusy}>
                            {scrapBusy ? "Posting…" : "Post Scrap"}
                          </button>
                          <small>{scrapDraft.length}/180</small>
                        </div>
                        {scrapError && <p className="retro-ie-error" role="alert">{scrapError}</p>}
                      </form>
                      <ul className="retro-orkut-scraplist">
                        {scraps.map((s, idx) => (
                          <li key={s.id || `${s.from}-${idx}`}>
                            <strong>{s.from}</strong> <small>({s.time})</small>
                            <p>{s.msg}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
      <footer className="retro-ie-statusbar">
        <span>
          {busy
            ? "Opening…"
            : currentTab === "google"
              ? "Done · Google India Classic"
              : currentTab === "orkut"
                ? "Done · orkut (2007)"
                : profile?.name ?? site}
        </span>
      </footer>
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

