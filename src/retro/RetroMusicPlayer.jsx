import { useEffect, useRef, useState } from "react";
import { WindowsMediaPlayerIcon } from "./RetroIcons";

/**
 * Authentic Windows XP Style Music Player (Windows Media Player 9 Series / Winamp Hybrid)
 * Features real audio streaming of Kishore Kumar, Lata Mangeshkar & Asha Bhosle classics
 * alongside legendary 90s/2000s Hollywood hits, with animated LED spectrum visualizer,
 * track scrubbing, volume control, shuffle, and playlist categorization.
 */

export const HOLLYWOOD_SONGS = [
  {
    id: "h1",
    title: "Numb",
    artist: "Linkin Park",
    album: "Meteora (2003)",
    duration: 185,
    category: "hollywood",
    tag: "Hollywood",
    src: "https://archive.org/download/linkin-park-numb-1/Linkin-Park-Numb%20%281%29.mp3",
  },
  {
    id: "h2",
    title: "In The End",
    artist: "Linkin Park",
    album: "Hybrid Theory (2000)",
    duration: 216,
    category: "hollywood",
    tag: "Hollywood",
    src: "https://archive.org/download/intheendlinkinparkwith1/In%20the%20end%20-%20Linkin%20Park%20%28with%29%20%281%29.mp3",
  },
  {
    id: "h3",
    title: "Bring Me To Life",
    artist: "Evanescence",
    album: "Fallen (2003)",
    duration: 182,
    category: "hollywood",
    tag: "Hollywood",
    src: "https://archive.org/download/Bring_Me_to_Life/bringme.mp3",
  },
  {
    id: "h4",
    title: "Lose Yourself",
    artist: "Eminem",
    album: "8 Mile (2002)",
    duration: 176,
    category: "hollywood",
    tag: "Hollywood",
    src: "https://archive.org/download/LoseYourself/LooseYouself.mp3",
  },
  {
    id: "h5",
    title: "Remember The Name",
    artist: "Fort Minor",
    album: "The Rising Tied (2005)",
    duration: 230,
    category: "hollywood",
    tag: "Hollywood",
    src: "https://archive.org/download/RememberTheName_47/RememberTheName.mp3",
  },
  {
    id: "h6",
    title: "Smells Like Teen Spirit",
    artist: "Nirvana",
    album: "Nevermind (1991)",
    duration: 301,
    category: "hollywood",
    tag: "Hollywood",
    src: "https://archive.org/download/01.smellsliketeenspirit/01.Smells%20Like%20Teen%20Spirit.mp3",
  },
];

export const BOLLYWOOD_SONGS = [
  {
    id: "b1",
    title: "Pal Pal Dil Ke Paas",
    artist: "Kishore Kumar",
    album: "Blackmail (1973)",
    duration: 330,
    category: "bollywood",
    singer: "kishore",
    tag: "Kishore Kumar",
    src: "https://archive.org/download/KishoreKumarRomanticsHindyugm/PalPalDilKes.mp3",
  },
  {
    id: "b2",
    title: "Lag Ja Gale Se Phir",
    artist: "Lata Mangeshkar",
    album: "Woh Kaun Thi? (1964)",
    duration: 257,
    category: "bollywood",
    singer: "lata",
    tag: "Lata Mangeshkar",
    src: "https://archive.org/download/lag-ja-gale-se/Lag%20Ja%20Gale%20Se%20Phir.mp3",
  },
  {
    id: "b3",
    title: "Chura Liya Hai Tumne Jo Dil Ko",
    artist: "Asha Bhosle & Mohd. Rafi",
    album: "Yaadon Ki Baaraat (1973)",
    duration: 283,
    category: "bollywood",
    singer: "asha",
    tag: "Asha Bhosle",
    src: "https://archive.org/download/best-of-oldies-vol.-1-bollywood-songs/Chura%20Liya%20Hai%20Tumne%20-%20Yaadon%20Ki%20Baraat-%20Yaadein%20Vol.%2010.mp3",
  },
  {
    id: "b4",
    title: "Humein Tumse Pyar Kitna",
    artist: "Kishore Kumar",
    album: "Kudrat (1981)",
    duration: 256,
    category: "bollywood",
    singer: "kishore",
    tag: "Kishore Kumar",
    src: "https://archive.org/download/KishoreKumarRomanticsHindyugm/HumeinTumsePyarKitnas.mp3",
  },
  {
    id: "b5",
    title: "Aap Ki Nazron Ne Samjha",
    artist: "Lata Mangeshkar",
    album: "Anpadh (1962)",
    duration: 235,
    category: "bollywood",
    singer: "lata",
    tag: "Lata Mangeshkar",
    src: "https://archive.org/download/lag-ja-gale-se/Aap%20Ki%20Nazron%20Ne%20Samjha.mp3",
  },
  {
    id: "b6",
    title: "O Mere Dil Ke Chain",
    artist: "Kishore Kumar",
    album: "Mere Jeevan Saathi (1972)",
    duration: 264,
    category: "bollywood",
    singer: "kishore",
    tag: "Kishore Kumar",
    src: "https://archive.org/download/best-of-oldies-vol.-1-bollywood-songs/O%20Mere%20Dil%20Ke%20Chain%20-%20Mere%20Jeevan%20Saathi%20-%20Yaadein%20Vol.%2035%20%28Jhankar%20Beat%29.mp3",
  },
  {
    id: "b7",
    title: "Tere Bina Zindagi Se Koi",
    artist: "Lata Mangeshkar & Kishore Kumar",
    album: "Aandhi (1975)",
    duration: 341,
    category: "bollywood",
    singer: "lata",
    tag: "Lata & Kishore",
    src: "https://archive.org/download/best-of-oldies-vol.-1-bollywood-songs/Tere%20Bina%20Zindagi%20Se%20-%20Aandhi%20-%20Yaadein%20Vol.%2016.mp3",
  },
  {
    id: "b8",
    title: "Chhoo Kar Mere Manko",
    artist: "Kishore Kumar",
    album: "Yaarana (1981)",
    duration: 254,
    category: "bollywood",
    singer: "kishore",
    tag: "Kishore Kumar",
    src: "https://archive.org/download/KishoreKumarRomanticsHindyugm/ChukarMereManKos.mp3",
  },
  {
    id: "b9",
    title: "Gaata Rahe Mera Dil",
    artist: "Kishore Kumar & Lata Mangeshkar",
    album: "Guide (1965)",
    duration: 290,
    category: "bollywood",
    singer: "kishore",
    tag: "Kishore & Lata",
    src: "https://archive.org/download/EvergreenHitsOfDevAnandsungByKishoreKumar/GaataRaheMeraDil.mp3",
  },
  {
    id: "b10",
    title: "O Haseena Zulfon Wali",
    artist: "Asha Bhosle & Mohd. Rafi",
    album: "Teesri Manzil (1966)",
    duration: 407,
    category: "bollywood",
    singer: "asha",
    tag: "Asha Bhosle",
    src: "https://archive.org/download/best-of-oldies-vol.-1-bollywood-songs/O%20Haseena%20-%20Teesri%20Manzil%20-%20Yaadein%20Vol.%2014.mp3",
  },
  {
    id: "b11",
    title: "Pyar Deewana Hota Hai",
    artist: "Kishore Kumar",
    album: "Kati Patang (1970)",
    duration: 287,
    category: "bollywood",
    singer: "kishore",
    tag: "Kishore Kumar",
    src: "https://archive.org/download/KishoreKumarRomanticsHindyugm/PyarDiwanaHotaHai-KatiPatang.mp3",
  },
  {
    id: "b12",
    title: "Jaane Jaan Dhoondta Phir Raha",
    artist: "Kishore Kumar & Asha Bhosle",
    album: "Jawani Diwani (1972)",
    duration: 356,
    category: "bollywood",
    singer: "asha",
    tag: "Kishore & Asha",
    src: "https://archive.org/download/best-of-oldies-vol.-1-bollywood-songs/Jaane%20Jaan%20Dhoondta%20Phir%20Raha%20-%20Jawani%20Diwani%20-%20Yaadein%20Vol.%2020.mp3",
  },
  {
    id: "b13",
    title: "Aaja Piya Tohe Pyar Doon",
    artist: "Lata Mangeshkar",
    album: "Baharon Ke Sapne (1967)",
    duration: 251,
    category: "bollywood",
    singer: "lata",
    tag: "Lata Mangeshkar",
    src: "https://archive.org/download/lag-ja-gale-se/Aaja%20Piya%20Tohe%20Pyar%20Doon.mp3",
  },
  {
    id: "b14",
    title: "Ye Samaa Samaa Hai Pyar Ka",
    artist: "Lata Mangeshkar",
    album: "Jab Jab Phool Khile (1965)",
    duration: 198,
    category: "bollywood",
    singer: "lata",
    tag: "Lata Mangeshkar",
    src: "https://archive.org/download/lag-ja-gale-se/Ye%20Samaa%20Samaa%20Hai%20Pyar%20Ka.mp3",
  },
  {
    id: "b15",
    title: "Main Hoon Pyar Tera",
    artist: "Asha Bhosle & Mohd. Rafi",
    album: "Teesri Manzil (1966)",
    duration: 389,
    category: "bollywood",
    singer: "asha",
    tag: "Asha Bhosle",
    src: "https://archive.org/download/best-of-oldies-vol.-1-bollywood-songs/Main%20Hoon%20Pyar%20Tera%20-%20Teesri%20Manzil%20-%20Yaadein%20Vol.%2014.mp3",
  },
];

export const ALL_SONGS = [...HOLLYWOOD_SONGS, ...BOLLYWOOD_SONGS];

function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function RetroMusicPlayer() {
  const [activeTab, setActiveTab] = useState("all");
  const [singerFilter, setSingerFilter] = useState("all"); // 'all' | 'kishore' | 'lata' | 'asha'
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [visualizerBands, setVisualizerBands] = useState([4, 6, 8, 7, 5, 9, 7, 5, 6, 8]);

  const audioRef = useRef(null);
  const animFrameRef = useRef(null);

  // Compute active playlist based on tab and optional singer sub-filter
  let playlist = ALL_SONGS;
  if (activeTab === "hollywood") {
    playlist = HOLLYWOOD_SONGS;
  } else if (activeTab === "bollywood") {
    if (singerFilter === "kishore") {
      playlist = BOLLYWOOD_SONGS.filter((s) => s.singer === "kishore" || s.tag.includes("Kishore"));
    } else if (singerFilter === "lata") {
      playlist = BOLLYWOOD_SONGS.filter((s) => s.singer === "lata" || s.tag.includes("Lata"));
    } else if (singerFilter === "asha") {
      playlist = BOLLYWOOD_SONGS.filter((s) => s.singer === "asha" || s.tag.includes("Asha"));
    } else {
      playlist = BOLLYWOOD_SONGS;
    }
  }

  // Ensure currentSong is always defined
  const safeIndex = currentSongIndex < playlist.length ? currentSongIndex : 0;
  const currentSong = playlist[safeIndex] || ALL_SONGS[0];

  // Helper to safely play audio
  const playAudio = () => {
    if (!audioRef.current) return;
    const promise = audioRef.current.play();
    if (promise !== undefined) {
      promise.catch((err) => {
        // Autoplay restrictions or network abort
        console.warn("Audio playback notice:", err.message);
        setIsPlaying(false);
      });
    }
  };

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // When currentSong changes, load new source and play if isPlaying is true
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = currentSong.src;
    audioRef.current.load();
    setCurrentTime(0);
    setDuration(currentSong.duration);

    if (isPlaying) {
      playAudio();
    }
  }, [currentSong.src]);

  // Smooth LED Spectrum Visualizer animation when playing
  useEffect(() => {
    let animId;
    if (isPlaying) {
      const animate = () => {
        const now = Date.now();
        setVisualizerBands([
          Math.floor(Math.sin(now / 130) * 10 + 16),
          Math.floor(Math.cos(now / 170) * 12 + 18),
          Math.floor(Math.sin(now / 110) * 14 + 17),
          Math.floor(Math.cos(now / 150) * 9 + 15),
          Math.floor(Math.sin(now / 140) * 13 + 17),
          Math.floor(Math.cos(now / 160) * 11 + 19),
          Math.floor(Math.sin(now / 190) * 10 + 16),
          Math.floor(Math.cos(now / 120) * 12 + 17),
          Math.floor(Math.sin(now / 180) * 8 + 14),
          Math.floor(Math.cos(now / 210) * 10 + 16),
        ]);
        animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);
    } else {
      setVisualizerBands([3, 4, 2, 3, 4, 3, 2, 4, 2, 3]);
    }
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  // Audio Event Handlers
  const handlePlay = () => {
    setIsPlaying(true);
    setIsBuffering(false);
  };

  const handlePause = () => {
    setIsPlaying(false);
    setIsBuffering(false);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (repeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        playAudio();
      }
    } else {
      handleNext();
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      playAudio();
    }
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    setIsBuffering(false);
  };

  const handleNext = () => {
    if (shuffle) {
      const nextIdx = Math.floor(Math.random() * playlist.length);
      setCurrentSongIndex(nextIdx);
    } else {
      setCurrentSongIndex((prev) => (prev + 1) % playlist.length);
    }
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    setCurrentSongIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const selectSong = (index) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  return (
    <div className="retro-music-player">
      {/* Hidden real HTML5 audio engine */}
      <audio
        ref={audioRef}
        preload="auto"
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onEnded={handleEnded}
        onError={(e) => {
          console.warn("Audio element stream error:", e);
          setIsBuffering(false);
        }}
      />

      {/* ── Main Winamp/WMP Skin Container ── */}
      <div className="retro-mp-topbar">
        <div className="retro-mp-brand">
          <WindowsMediaPlayerIcon size={18} />
          <span>Windows Media Player 9 Series</span>
        </div>
        <div className="retro-mp-kbps">192 KBPS · 44.1 KHZ · STEREO AUDIO</div>
      </div>

      {/* ── Visualizer & LCD Screen ── */}
      <div className="retro-mp-display">
        <div className="retro-mp-lcd">
          <div className="retro-mp-track-title">
            <span className="retro-mp-marquee">
              {safeIndex + 1}. {currentSong.artist} - {currentSong.title} ({currentSong.album})
            </span>
          </div>
          <div className="retro-mp-time-row">
            <span className="retro-mp-lcd-time">{formatTime(currentTime)}</span>
            <span className="retro-mp-status-pill">
              {isBuffering ? "BUFFERING" : isPlaying ? "PLAYING" : "PAUSED"}
            </span>
            <span className="retro-mp-lcd-total">
              / {formatTime(duration || currentSong.duration)}
            </span>
          </div>
        </div>

        {/* Green/Cyan LED Spectrum Visualizer */}
        <div className="retro-mp-visualizer" aria-label="Audio Visualizer">
          {visualizerBands.map((height, i) => (
            <div key={i} className="retro-mp-band-col">
              <div
                className={`retro-mp-band-fill ${isPlaying ? "is-active" : ""}`}
                style={{ height: `${height}px` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Scrub Bar ── */}
      <div className="retro-mp-scrub-wrap">
        <input
          type="range"
          min={0}
          max={duration || currentSong.duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="retro-mp-scrubber"
          aria-label="Track progress"
        />
      </div>

      {/* ── Player Controls Row ── */}
      <div className="retro-mp-controls">
        <div className="retro-mp-btn-group">
          <button
            type="button"
            className="retro-mp-btn"
            onClick={handlePrev}
            title="Previous track"
          >
            |◀
          </button>
          <button
            type="button"
            className={`retro-mp-btn retro-mp-play-btn ${isPlaying ? "is-playing" : ""}`}
            onClick={handlePlayPause}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
          <button
            type="button"
            className="retro-mp-btn"
            onClick={handleStop}
            title="Stop"
          >
            ■
          </button>
          <button
            type="button"
            className="retro-mp-btn"
            onClick={handleNext}
            title="Next track"
          >
            ▶|
          </button>
        </div>

        {/* Controls: Shuffle, Repeat, Volume */}
        <div className="retro-mp-volume-group">
          <button
            type="button"
            className={`retro-mp-btn-pill ${shuffle ? "is-active" : ""}`}
            onClick={() => setShuffle(!shuffle)}
            title="Shuffle"
          >
            SHUF
          </button>
          <button
            type="button"
            className={`retro-mp-btn-pill ${repeat ? "is-active" : ""}`}
            onClick={() => setRepeat(!repeat)}
            title="Repeat track"
          >
            REP
          </button>
          <span className="retro-mp-vol-icon">🔊</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="retro-mp-vol-slider"
            aria-label="Volume"
          />
        </div>
      </div>

      {/* ── Playlist Section ── */}
      <div className="retro-mp-playlist-panel">
        <div className="retro-mp-tabs">
          <button
            type="button"
            className={`retro-mp-tab ${activeTab === "all" ? "is-active" : ""}`}
            onClick={() => {
              setActiveTab("all");
              setCurrentSongIndex(0);
            }}
          >
            All Tracks ({ALL_SONGS.length})
          </button>
          <button
            type="button"
            className={`retro-mp-tab ${activeTab === "bollywood" ? "is-active" : ""}`}
            onClick={() => {
              setActiveTab("bollywood");
              setCurrentSongIndex(0);
            }}
          >
            ♫ Bollywood Classics ({BOLLYWOOD_SONGS.length})
          </button>
          <button
            type="button"
            className={`retro-mp-tab ${activeTab === "hollywood" ? "is-active" : ""}`}
            onClick={() => {
              setActiveTab("hollywood");
              setCurrentSongIndex(0);
            }}
          >
            ★ Hollywood Hits ({HOLLYWOOD_SONGS.length})
          </button>
        </div>

        {/* Bollywood singer sub-filters (Kishore, Lata, Asha) */}
        {activeTab === "bollywood" && (
          <div className="retro-mp-subfilters">
            <button
              type="button"
              className={`retro-mp-subfilter-btn ${singerFilter === "all" ? "is-active" : ""}`}
              onClick={() => {
                setSingerFilter("all");
                setCurrentSongIndex(0);
              }}
            >
              All Classics
            </button>
            <button
              type="button"
              className={`retro-mp-subfilter-btn retro-mp-filter-kishore ${singerFilter === "kishore" ? "is-active" : ""}`}
              onClick={() => {
                setSingerFilter("kishore");
                setCurrentSongIndex(0);
              }}
            >
              Kishore Kumar
            </button>
            <button
              type="button"
              className={`retro-mp-subfilter-btn retro-mp-filter-lata ${singerFilter === "lata" ? "is-active" : ""}`}
              onClick={() => {
                setSingerFilter("lata");
                setCurrentSongIndex(0);
              }}
            >
              Lata Mangeshkar
            </button>
            <button
              type="button"
              className={`retro-mp-subfilter-btn retro-mp-filter-asha ${singerFilter === "asha" ? "is-active" : ""}`}
              onClick={() => {
                setSingerFilter("asha");
                setCurrentSongIndex(0);
              }}
            >
              Asha Bhosle
            </button>
          </div>
        )}

        <div className="retro-mp-list" role="listbox">
          {playlist.map((song, i) => {
            const isCurrent = i === safeIndex;
            // Determine singer badge class
            let tagClass = "retro-tag-hollywood";
            if (song.category === "bollywood") {
              if (song.singer === "kishore") tagClass = "retro-tag-kishore";
              else if (song.singer === "lata") tagClass = "retro-tag-lata";
              else if (song.singer === "asha") tagClass = "retro-tag-asha";
              else tagClass = "retro-tag-bollywood";
            }

            return (
              <div
                key={song.id}
                role="option"
                aria-selected={isCurrent}
                className={`retro-mp-row ${isCurrent ? "is-selected" : ""}`}
                onClick={() => selectSong(i)}
              >
                <span className="retro-mp-row-idx">
                  {isCurrent && isPlaying ? "▶ " : `${i + 1}. `}
                </span>
                <span className="retro-mp-row-title">
                  {song.artist} - {song.title}
                </span>
                <span className={`retro-mp-row-tag ${tagClass}`}>
                  {song.tag || (song.category === "bollywood" ? "Bollywood" : "Hollywood")}
                </span>
                <span className="retro-mp-row-dur">{formatTime(song.duration)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
