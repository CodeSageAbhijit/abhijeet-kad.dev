import { useState } from "react";
import { projects } from "../constants";

// Viewer navigation adapted from PortfolioXP's Pictures.vue. See public/retro/credits.txt.
const albums = projects.filter((project) => project.images?.length);

export default function RetroPictures({ projectName }) {
  const [selected, setSelected] = useState(() => albums.findIndex((project) => project.name === projectName));
  const [index, setIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const album = albums[Math.max(0, selected)];
  const picture = album.images[index];

  function move(step) {
    setIndex((index + step + album.images.length) % album.images.length);
    setRotation(0);
  }

  return (
    <div className="retro-pictures">
      <header className="retro-file-path">
        <label htmlFor="retro-album">Project</label>
        <select id="retro-album" value={Math.max(selected, 0)} onChange={(event) => {
          setSelected(Number(event.target.value));
          setIndex(0);
          setRotation(0);
        }}>
          {albums.map((project, number) => <option key={project.name} value={number}>{project.name}</option>)}
        </select>
      </header>
      <figure className="retro-picture">
        <img src={picture} alt={`${album.name} screenshot ${index + 1}`} loading="lazy"
          style={{ transform: `rotate(${rotation}deg)${Math.abs(rotation % 180) === 90 ? " scale(0.72)" : ""}` }} />
      </figure>
      <div className="retro-picture-controls">
        <button type="button" className="retro-native-button" aria-label="Previous screenshot" onClick={() => move(-1)}>‹</button>
        <span role="status">{index + 1} / {album.images.length}</span>
        <button type="button" className="retro-native-button" aria-label="Next screenshot" onClick={() => move(1)}>›</button>
        <button type="button" className="retro-native-button" aria-label="Rotate left" onClick={() => setRotation((rotation - 90) % 360)}>↶</button>
        <button type="button" className="retro-native-button" aria-label="Rotate right" onClick={() => setRotation((rotation + 90) % 360)}>↷</button>
        <a href={picture} target="_blank" rel="noreferrer">Open image ↗</a>
      </div>
    </div>
  );
}
