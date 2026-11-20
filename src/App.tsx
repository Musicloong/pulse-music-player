import { useEffect, useState } from "react";
import { AudioLines, ChevronLeft, ChevronRight, Heart, ListMusic, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { WarpCarousel, type WarpCard } from "@/components/ui/warp-carousel";
import { tracks } from "./tracks";

const cards: WarpCard[] = tracks.map((track) => ({
  title: track.title, value: "", footer: `${track.artist} · ${track.album}`, image: track.cover,
  glow: track.color, accent: track.color,
}));

const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
const wrap = (index: number) => (index + tracks.length) % tracks.length;
const PREVIEW_DURATION = 30;
function Cover({ index }: { index: number }) {
  const track = tracks[index];
  return <span className="cover" style={{ backgroundColor: track.color }}>
    <img src={track.cover} alt="" width="48" height="48"
      onError={(event) => { event.currentTarget.hidden = true; }} />
  </span>;
}

export default function App() {
  const [current, setCurrent] = useState(0);
  const [featured, setFeatured] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [previewStarted, setPreviewStarted] = useState(false);
  const [previewNonce, setPreviewNonce] = useState(0);
  const track = tracks[current];
  const selection = tracks[featured];
  const queue = tracks.map((_, index) => wrap(current + index));


  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setElapsed((value) => Math.min(value + 1, PREVIEW_DURATION)), 1000);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (playing && elapsed >= PREVIEW_DURATION) {
      setPlaying(false);
      setPreviewStarted(false);
      setPreviewNonce((value) => value + 1);
    }
  }, [elapsed, playing]);

  function playTrack(index: number) {
    setCurrent(index);
    setFeatured(index);
    setElapsed(0);
    setPlaying(true);
    setPreviewStarted(true);
    setPreviewNonce((value) => value + 1);
  }

  function stopPreview() {
    setPlaying(false);
    setPreviewStarted(false);
    setElapsed(0);
    setPreviewNonce((value) => value + 1);
  }

  function toggle(index = current) {
    if (index === current && playing) stopPreview();
    else playTrack(index);
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
          <p>滑动专辑封面切歌 · 使用下方播放器试听 30 秒</p>
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
            </div>
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
      <iframe className="netease-player-hidden" key={`${selection.neteaseId}-${previewNonce}`}
        title={`网易云音乐试听：${selection.title}`} aria-hidden="true" tabIndex={-1}
        src={`https://music.163.com/outchain/player?type=2&id=${selection.neteaseId}&auto=${previewStarted ? 1 : 0}&height=66`}
        allow="autoplay; encrypted-media" loading="eager" />
      <footer className="music-player" aria-label="播放器">
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
          </div>
          <div className="scrubber">
            <span>{time(elapsed)}</span>
            <div className="scrubber-progress" role="progressbar" aria-label="试听进度" aria-valuemin={0} aria-valuemax={PREVIEW_DURATION} aria-valuenow={elapsed}>
              <span style={{ width: `${(elapsed / PREVIEW_DURATION) * 100}%` }} />
            </div>
            <span>{time(PREVIEW_DURATION)}</span>
          </div>
        </div>
        <div className="player-note">网易云 · 30 秒试听</div>
      </footer>
    </div>
  );
}
