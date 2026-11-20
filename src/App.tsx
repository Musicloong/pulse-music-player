import { useEffect, useRef, useState } from "react";
import { AudioLines, ChevronLeft, ChevronRight, Heart, ListMusic, Pause, Play, Repeat2, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { WarpCarousel, type WarpCard } from "@/components/ui/warp-carousel";
import { tracks } from "./tracks";

const cards: WarpCard[] = tracks.map((track) => ({
  title: track.title, value: "", footer: `${track.artist} · ${track.album}`, image: track.cover,
  glow: track.color, accent: track.color,
}));

const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
const wrap = (index: number) => (index + tracks.length) % tracks.length;
function Cover({ index }: { index: number }) {
  const track = tracks[index];
  return <span className="cover" style={{ backgroundColor: track.color }}>
    <img src={track.cover} alt="" width="48" height="48"
      onError={(event) => { event.currentTarget.hidden = true; }} />
  </span>;
}

export default function App() {
  const audio = useRef<HTMLAudioElement>(null);
  const playRequest = useRef(0);
  const [duration, setDuration] = useState(30);
  const [current, setCurrent] = useState(0);
  const [featured, setFeatured] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [volume, setVolume] = useState(0.65);
  const [muted, setMuted] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [liked, setLiked] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [previewStarted, setPreviewStarted] = useState(false);
  const [previewNonce, setPreviewNonce] = useState(0);
  const track = tracks[current];
  const selection = tracks[featured];
  const queue = tracks.map((_, index) => wrap(current + index));


  useEffect(() => {
    if (audio.current) audio.current.volume = volume;
  }, [volume]);

  function playTrack(index: number) {
    setCurrent(index);
    setFeatured(index);
    setPreviewStarted(true);
    setPreviewNonce((value) => value + 1);
  }

  function startPreview() {
    setPreviewStarted(true);
    setPreviewNonce((value) => value + 1);
  }

  function toggle(index = current) {
    playTrack(index);
  }

  function toggleLike() {
    setLiked((items) => items.includes(current) ? items.filter((item) => item !== current) : [...items, current]);
  }

  return (
    <div className="music-app">
      <header className="site-header">
        <a className="wordmark" href="#top"><span><AudioLines size={21} /></span>pulse<span className="brand-period">.</span></a>
        <a className="header-link" href="#playlist"><ListMusic size={18} /> 播放队列</a>
      </header>
      <main id="top" className="music-main">
        <div className="page-title">
          <h1>夜间电台<span>.</span></h1>
          <p>滑动专辑封面切歌 · 网易云音乐官方播放器</p>
        </div>
        <div className="music-grid">
          <section className="feature" aria-label="精选曲目">
            <div className="carousel-frame">
              <WarpCarousel cards={cards} index={featured} onIndexChange={playTrack} autoplay={false}
                background="#151222" ariaLabel="精选曲目，左右拖动或按方向键切换" />
              <div className="carousel-nav">
                <button className="icon-control" aria-label="上一张卡片" onClick={() => playTrack(wrap(featured - 1))}><ChevronLeft size={20} /></button>
                <div className="indicators" aria-label="选择精选曲目">
                  {tracks.map((item, index) => Math.min(wrap(index - featured), wrap(featured - index)) <= 2 && <button key={item.title} aria-label={item.title}
                    aria-current={index === featured ? "true" : undefined} onClick={() => playTrack(index)} />)}
                </div>
                <button className="icon-control" aria-label="下一张卡片" onClick={() => playTrack(wrap(featured + 1))}><ChevronRight size={20} /></button>
              </div>
            </div>
            <div className="feature-action">
              <div><strong>{selection.title}</strong><small>{selection.artist} · {selection.album}</small></div>
              <div className="feature-buttons">
                <button className="primary-btn" onClick={startPreview}>试听 30 秒</button>
                <a className="song-link" href={`https://music.163.com/#/song?id=${selection.neteaseId}`} target="_blank" rel="noreferrer">网易云歌曲页</a>
              </div>
            </div>
            <iframe className="netease-player" key={`${selection.neteaseId}-${previewNonce}`}
                title={`网易云音乐播放：${selection.title}`}
                src={`https://music.163.com/outchain/player?type=2&id=${selection.neteaseId}&auto=${previewStarted ? 1 : 0}&height=66`}
                allow="autoplay" loading="eager" />
          </section>
          <aside className="up-next" id="playlist" aria-labelledby="queue-title">
            <h2 id="queue-title">播放队列</h2>
            {queue.map((index) => {
              const item = tracks[index];
              return <button className="song" key={index} aria-current={index === current ? "true" : undefined} onClick={() => toggle(index)}>
                <Cover index={index} />
                <span><strong>{item.title}</strong><small>{item.artist} · {item.album}</small></span>
                {index === featured ? <AudioLines size={18} /> : <small>{time(item.duration)}</small>}
              </button>;
            })}
          </aside>
        </div>
      </main>
      <footer className="music-player" aria-label="播放器">
        <audio ref={audio} muted={muted} loop={repeat} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
          onLoadedMetadata={(event) => { setDuration(event.currentTarget.duration); setReady(true); }} onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)}
          onEnded={() => playTrack(wrap(current + 1))} onError={() => setError("音频无法播放，请再试一次。")} />
        {error && <p className="audio-error" role="status">{error}</p>}
        <div className="playing-song">
          <Cover index={current} /><div><strong>{track.title}</strong><small>{track.artist} · {track.album}</small></div>
          <button className="icon-control favorite" aria-label="收藏当前歌曲" aria-pressed={liked.includes(current)} onClick={toggleLike}>
            <Heart size={18} fill={liked.includes(current) ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="transport">
          <div className="transport-buttons">
            <button className="icon-control" aria-label="上一首" onClick={() => playTrack(wrap(current - 1))}><SkipBack size={18} fill="currentColor" /></button>
            <button className="icon-control main-play" aria-label={playing ? "暂停" : "播放"} onClick={() => toggle()}>
              {playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
            </button>
            <button className="icon-control" aria-label="下一首" onClick={() => playTrack(wrap(current + 1))}><SkipForward size={18} fill="currentColor" /></button>
            <button className="icon-control repeat" aria-label="单曲循环" aria-pressed={repeat} onClick={() => setRepeat(!repeat)}><Repeat2 size={18} /></button>
          </div>
          <div className="scrubber">
            <span>{time(elapsed)}</span>
            <input type="range" aria-label="播放进度" min="0" max={duration} step="0.1" value={elapsed} disabled={!ready}
              onChange={(event) => {
                const value = event.currentTarget.valueAsNumber;
                if (audio.current) audio.current.currentTime = value;
                setElapsed(value);
              }} />
            <span>{time(duration)}</span>
          </div>
        </div>
        <div className="volume-controls">
          <button className="icon-control" aria-label={muted ? "取消静音" : "静音"} onClick={() => setMuted(!muted)}>
            {muted || volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}
          </button>
          <input type="range" aria-label="音量" min="0" max="1" step="0.01" value={muted ? 0 : volume}
            onChange={(event) => { setMuted(false); setVolume(event.currentTarget.valueAsNumber); }} />
        </div>
      </footer>
    </div>
  );
}
