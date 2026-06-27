"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Heart,
  CalendarDays,
  MapPin,
} from "lucide-react";

import { chapters, src, type Chapter, type Photo } from "./love-story-data";

/* ------------------------------------------------------------------ */
/*  Assets                                                            */
/* ------------------------------------------------------------------ */
const MUSIC =
  "/audio/" +
  encodeURIComponent(
    "KOLLINS Ft. CHIDINMA - Ma Préférée (Official Video)(MP3_128K).mp3",
  );

/* cover photo of the couple */
const HERO_PHOTO = "WhatsApp Image 2026-06-19 at 16.52.02 (1).jpeg";

const ACCENT_TEXT: Record<Chapter["accent"], string> = {
  gold: "text-gold",
  "wed-orange": "text-wed-orange",
  "wed-fuchsia": "text-wed-fuchsia",
  marine: "text-marine",
};
const ACCENT_VAR: Record<Chapter["accent"], string> = {
  gold: "var(--gold)",
  "wed-orange": "var(--wed-orange)",
  "wed-fuchsia": "var(--wed-fuchsia)",
  marine: "var(--marine)",
};

const KB = ["kb-a", "kb-b", "kb-c", "kb-d"];

/* ------------------------------------------------------------------ */
/*  Scene model — the film is a flat list of timed scenes             */
/* ------------------------------------------------------------------ */
type Scene =
  | { kind: "title"; dur: number }
  | { kind: "chapter"; dur: number; chapter: Chapter }
  | {
      kind: "photo";
      dur: number;
      photo: Photo;
      chapter: Chapter;
      n: number;
      total: number;
    }
  | { kind: "credits"; dur: number };

const DUR = { title: 7, chapter: 4, photo: 5, credits: 14 };

function fmt(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/70 sm:w-20" />
      <Heart className="size-4 fill-gold text-gold" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/70 sm:w-20" />
    </div>
  );
}

export default function Film() {
  /* ---- build the scene list once ---- */
  const { scenes, starts, total } = useMemo(() => {
    const s: Scene[] = [];
    s.push({ kind: "title", dur: DUR.title });
    const totalPhotos = chapters.reduce((a, c) => a + c.photos.length, 0);
    let running = 0;
    chapters.forEach((ch) => {
      s.push({ kind: "chapter", dur: DUR.chapter, chapter: ch });
      ch.photos.forEach((p) => {
        running += 1;
        s.push({
          kind: "photo",
          dur: DUR.photo,
          photo: p,
          chapter: ch,
          n: running,
          total: totalPhotos,
        });
      });
    });
    s.push({ kind: "credits", dur: DUR.credits });

    const st: number[] = [];
    let acc = 0;
    s.forEach((sc) => {
      st.push(acc);
      acc += sc.dur;
    });
    return { scenes: s, starts: st, total: acc };
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const timeRef = useRef<HTMLSpanElement | null>(null);
  const indexRef = useRef(0);
  const playingRef = useRef(false);
  const hideTimer = useRef<number | undefined>(undefined);

  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [controls, setControls] = useState(true);

  /* which scene does a given time belong to */
  const sceneAt = useCallback(
    (t: number) => {
      for (let i = scenes.length - 1; i >= 0; i--) {
        if (t >= starts[i]) return i;
      }
      return 0;
    },
    [scenes.length, starts],
  );

  /* ---- master clock: drive scene + progress off the audio currentTime ---- */
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const loop = () => {
      const a = audioRef.current;
      if (a) {
        const t = a.currentTime;
        const p = Math.min(t / total, 1);
        if (barRef.current)
          barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
        if (timeRef.current)
          timeRef.current.textContent = `${fmt(t)} / ${fmt(total)}`;
        const ni = sceneAt(t);
        if (ni !== indexRef.current) {
          indexRef.current = ni;
          setIndex(ni);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, total, sceneAt]);

  /* ---- auto-hide controls: only fade out while actually playing ---- */
  const poke = useCallback(() => {
    setControls(true);
    window.clearTimeout(hideTimer.current);
    if (playingRef.current)
      hideTimer.current = window.setTimeout(() => setControls(false), 3200);
  }, []);

  /* ---- transport controls ---- */
  const begin = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {});
    playingRef.current = true;
    setStarted(true);
    setEnded(false);
    setPlaying(true);
    poke();
  }, [poke]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (ended) {
      a.currentTime = 0;
      a.play().catch(() => {});
      playingRef.current = true;
      setEnded(false);
      setPlaying(true);
    } else if (playing) {
      a.pause();
      playingRef.current = false;
      setPlaying(false);
    } else {
      a.play().catch(() => {});
      playingRef.current = true;
      setPlaying(true);
    }
    poke();
  }, [playing, ended, poke]);

  const seekTo = useCallback(
    (t: number) => {
      const a = audioRef.current;
      if (!a) return;
      a.currentTime = Math.max(0, Math.min(t, total - 0.05));
      setEnded(false);
    },
    [total],
  );

  const replay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {});
    playingRef.current = true;
    setEnded(false);
    setPlaying(true);
    poke();
  }, [poke]);

  const skip = useCallback(
    (dir: 1 | -1) => {
      const i = indexRef.current;
      const target =
        dir > 0
          ? Math.min(i + 1, scenes.length - 1)
          : // if we're more than 1.2s into a scene, go to its start; else previous
            starts[i] && audioRef.current && audioRef.current.currentTime - starts[i] > 1.2
            ? i
            : Math.max(i - 1, 0);
      seekTo(starts[target] + 0.02);
    },
    [scenes.length, starts, seekTo],
  );

  const onScrub = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - r.left) / r.width;
      seekTo(ratio * total);
    },
    [seekTo, total],
  );

  /* ---- audio lifecycle ---- */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnd = () => {
      playingRef.current = false;
      setPlaying(false);
      setEnded(true);
      setControls(true);
      window.clearTimeout(hideTimer.current);
      indexRef.current = scenes.length - 1;
      setIndex(scenes.length - 1);
      if (barRef.current) barRef.current.style.transform = "scaleX(1)";
    };
    a.addEventListener("ended", onEnd);
    return () => a.removeEventListener("ended", onEnd);
  }, [scenes.length]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  /* ---- keyboard shortcuts ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!started) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          begin();
        }
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        toggle();
      } else if (e.key === "ArrowRight") skip(1);
      else if (e.key === "ArrowLeft") skip(-1);
      else if (e.key === "m" || e.key === "M") setMuted((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, begin, toggle, skip]);

  /* ---- which scenes to mount (current ± 1 → crossfade + preload) ---- */
  const windowIdx = useMemo(() => {
    const set = new Set<number>();
    [index - 1, index, index + 1].forEach((i) => {
      if (i >= 0 && i < scenes.length) set.add(i);
    });
    return Array.from(set);
  }, [index, scenes.length]);

  return (
    <div
      className={`fixed inset-0 select-none overflow-hidden bg-black text-cream ${
        playing ? "" : "film-paused"
      } ${controls ? "" : "cursor-none"}`}
      onMouseMove={poke}
      onClick={() => {
        if (started) poke();
      }}
    >
      <audio ref={audioRef} src={MUSIC} preload="auto" />

      {/* ===================== SCENE STACK ===================== */}
      {windowIdx.map((i) => {
        const sc = scenes[i];
        const active = i === index;
        return (
          <div
            key={i}
            data-active={active}
            className="absolute inset-0 transition-opacity duration-[1100ms] ease-out"
            style={{ opacity: active ? 1 : 0 }}
            aria-hidden={!active}
          >
            <SceneView scene={sc} idx={i} />
          </div>
        );
      })}

      {/* ===================== FILM OVERLAYS ===================== */}
      {/* vignette */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(120%_120%_at_50%_45%,transparent_55%,rgba(0,0,0,0.6)_100%)]" />
      {/* grain */}
      <div className="film-grain pointer-events-none absolute inset-0 z-20" />
      {/* letterbox bars */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[5.5vh] bg-black" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[5.5vh] bg-black" />

      {/* ===================== START POSTER ===================== */}
      {!started && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center px-6 text-center">
          <div className="absolute inset-0 -z-10">
            <Image
              src={src(HERO_PHOTO)}
              alt="Lyce Andréa & Joseph"
              fill
              priority
              sizes="100vw"
              className="scale-105 object-cover object-[center_28%]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/85" />
          </div>

          <p className="mb-5 font-serif-elegant text-xs uppercase tracking-[0.5em] text-gold/90">
            Un film d&apos;amour
          </p>
          <h1 className="font-script text-5xl leading-[0.95] text-cream drop-shadow-[0_2px_18px_rgba(0,0,0,0.6)] sm:text-7xl md:text-8xl">
            Lyce Andréa
            <span className="mx-3 text-gold">&amp;</span>
            Joseph
          </h1>
          <Ornament className="mt-7" />

          <button
            type="button"
            onClick={begin}
            className="group mt-10 inline-flex items-center gap-3 rounded-full border border-gold/50 bg-white/10 px-7 py-3.5 text-sm font-medium uppercase tracking-[0.25em] text-cream backdrop-blur-md transition hover:border-gold hover:bg-gold hover:text-marine-deep"
          >
            <Play className="size-5 fill-current" />
            Regarder notre film
          </button>
          <p className="mt-5 text-xs uppercase tracking-[0.3em] text-cream/55">
            Avec musique · {fmt(total)}
          </p>
        </div>
      )}

      {/* ===================== REPLAY OVERLAY ===================== */}
      {ended && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40">
          <button
            type="button"
            onClick={replay}
            className="inline-flex items-center gap-3 rounded-full border border-gold/50 bg-white/10 px-7 py-3.5 text-sm font-medium uppercase tracking-[0.25em] text-cream backdrop-blur-md transition hover:border-gold hover:bg-gold hover:text-marine-deep"
          >
            <RotateCcw className="size-5" />
            Revoir le film
          </button>
        </div>
      )}

      {/* ===================== CONTROL BAR ===================== */}
      {started && (
        <div
          className={`absolute inset-x-0 bottom-0 z-40 transition-opacity duration-500 ${
            controls ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-4 pt-12 sm:px-8 sm:pb-6">
            {/* progress */}
            <div
              className="group relative mb-3 h-2 cursor-pointer"
              onClick={onScrub}
            >
              <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white/25" />
              <div
                ref={barRef}
                className="absolute inset-x-0 top-1/2 h-[3px] origin-left -translate-y-1/2 rounded-full bg-gradient-to-r from-gold to-wed-orange"
                style={{ transform: "scaleX(0)" }}
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Scène précédente"
                onClick={() => skip(-1)}
                className="text-cream/80 transition hover:text-gold"
              >
                <SkipBack className="size-5" />
              </button>
              <button
                type="button"
                aria-label={playing ? "Pause" : "Lecture"}
                onClick={toggle}
                className="flex size-11 items-center justify-center rounded-full bg-gold text-marine-deep transition hover:scale-105"
              >
                {playing ? (
                  <Pause className="size-5 fill-current" />
                ) : (
                  <Play className="size-5 translate-x-px fill-current" />
                )}
              </button>
              <button
                type="button"
                aria-label="Scène suivante"
                onClick={() => skip(1)}
                className="text-cream/80 transition hover:text-gold"
              >
                <SkipForward className="size-5" />
              </button>

              <span
                ref={timeRef}
                className="ml-1 font-mono text-xs tabular-nums text-cream/70"
              >
                0:00 / {fmt(total)}
              </span>

              <div className="ml-auto flex items-center gap-4">
                <span className="hidden font-serif-elegant text-sm italic text-cream/70 sm:block">
                  Lyce Andréa &amp; Joseph — Notre histoire
                </span>
                <button
                  type="button"
                  aria-label={muted ? "Activer le son" : "Couper le son"}
                  onClick={() => setMuted((m) => !m)}
                  className="text-cream/80 transition hover:text-gold"
                >
                  {muted ? (
                    <VolumeX className="size-5" />
                  ) : (
                    <Volume2 className="size-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Individual scene renderer                                         */
/* ================================================================== */
function SceneView({ scene, idx }: { scene: Scene; idx: number }) {
  if (scene.kind === "title") {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center bg-marine-deep px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_40%,color-mix(in_oklch,var(--gold)_12%,transparent),transparent_70%)]" />
        <p className="scene-reveal mb-6 font-serif-elegant text-sm uppercase tracking-[0.5em] text-gold/90">
          Nous avons l&apos;immense plaisir de vous présenter
        </p>
        <h1
          className="scene-reveal font-script text-6xl leading-[0.95] text-cream sm:text-8xl md:text-9xl"
          style={{ animationDelay: "0.35s" }}
        >
          Lyce Andréa
        </h1>
        <span
          className="scene-reveal my-2 font-script text-4xl text-gold sm:text-6xl"
          style={{ animationDelay: "0.7s" }}
        >
          &amp;
        </span>
        <h1
          className="scene-reveal font-script text-6xl leading-[0.95] text-cream sm:text-8xl md:text-9xl"
          style={{ animationDelay: "0.95s" }}
        >
          Joseph
        </h1>
        <div className="scene-reveal mt-8" style={{ animationDelay: "1.4s" }}>
          <Ornament />
        </div>
        <p
          className="scene-reveal mt-7 max-w-xl font-serif-elegant text-lg italic text-cream/80 sm:text-xl"
          style={{ animationDelay: "1.7s" }}
        >
          Une histoire d&apos;amour racontée en images.
        </p>
      </div>
    );
  }

  if (scene.kind === "chapter") {
    const ch = scene.chapter;
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center bg-marine-deep px-6 text-center">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(80% 60% at 50% 45%, color-mix(in oklch, ${ACCENT_VAR[ch.accent]} 20%, transparent), transparent 70%)`,
          }}
        />
        <span
          className={`scene-reveal pointer-events-none absolute select-none font-display text-[44vh] font-bold leading-none opacity-10 ${ACCENT_TEXT[ch.accent]}`}
          aria-hidden
        >
          {ch.index}
        </span>
        <div className="relative">
          <p
            className={`scene-reveal mb-3 text-xs font-medium uppercase tracking-[0.45em] ${ACCENT_TEXT[ch.accent]}`}
          >
            {ch.eyebrow}
          </p>
          <h2
            className="scene-reveal font-display text-5xl font-semibold text-cream sm:text-7xl"
            style={{ animationDelay: "0.2s" }}
          >
            {ch.title}
          </h2>
          <div
            className="scene-reveal mx-auto mt-6 h-px w-40 bg-gradient-to-r from-transparent to-transparent"
            style={{
              animationDelay: "0.4s",
              backgroundImage: `linear-gradient(to right, transparent, ${ACCENT_VAR[ch.accent]}, transparent)`,
            }}
          />
          <p
            className="scene-reveal mx-auto mt-6 max-w-xl font-serif-elegant text-lg italic text-cream/75 sm:text-xl"
            style={{ animationDelay: "0.55s" }}
          >
            {ch.subtitle}
          </p>
        </div>
      </div>
    );
  }

  if (scene.kind === "photo") {
    const { photo, chapter, n } = scene;
    return (
      <div className="relative h-full w-full bg-black">
        <div className={`absolute inset-0 ${KB[idx % KB.length]} kb`}>
          <Image
            src={src(photo.file)}
            alt={photo.caption}
            fill
            sizes="100vw"
            priority
            className="object-cover object-[center_28%]"
          />
        </div>
        {/* cinematic grading */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/45" />

        {/* top chapter label */}
        <div className="scene-reveal absolute left-1/2 top-[8vh] -translate-x-1/2 text-center">
          <span
            className={`text-[11px] font-medium uppercase tracking-[0.4em] ${ACCENT_TEXT[chapter.accent]}`}
          >
            {chapter.index} · {chapter.title}
          </span>
        </div>

        {/* bottom subtitle (like a film caption) */}
        <div className="absolute inset-x-0 bottom-[9vh] flex flex-col items-center px-8 text-center">
          <p
            className="scene-reveal font-script text-2xl text-gold sm:text-3xl"
            style={{ animationDelay: "0.15s" }}
          >
            Souvenir n°{String(n).padStart(2, "0")}
          </p>
          <h3
            className="scene-reveal mt-2 max-w-3xl font-display text-3xl font-semibold leading-tight text-cream drop-shadow-[0_2px_14px_rgba(0,0,0,0.7)] sm:text-5xl"
            style={{ animationDelay: "0.35s" }}
          >
            {photo.caption}
          </h3>
        </div>
      </div>
    );
  }

  // credits
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-marine-deep px-6 text-center">
      <div className="absolute -right-16 top-10 size-72 rounded-full bg-wed-fuchsia/25 blur-3xl" />
      <div className="absolute -left-16 bottom-6 size-72 rounded-full bg-wed-orange/25 blur-3xl" />
      <Heart className="scene-reveal size-7 fill-gold text-gold" />
      <p
        className="scene-reveal mt-6 font-serif-elegant text-xl italic text-cream/85 sm:text-2xl"
        style={{ animationDelay: "0.25s" }}
      >
        Et l&apos;histoire continue…
      </p>
      <h2
        className="scene-reveal mt-4 font-script text-5xl leading-tight sm:text-7xl"
        style={{ animationDelay: "0.5s" }}
      >
        <span className="gold-text">Lyce Andréa &amp; Joseph</span>
      </h2>
      <Ornament className="scene-reveal mt-8" />
      <div
        className="scene-reveal mt-8 flex flex-wrap items-center justify-center gap-3"
        style={{ animationDelay: "0.8s" }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-4 py-2 text-sm">
          <CalendarDays className="size-4 text-gold" />
          Mercredi 15 Juillet 2026
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-4 py-2 text-sm">
          <MapPin className="size-4 text-gold" />
          Mairie d&apos;Angré Djorogobité
        </span>
      </div>
    </div>
  );
}
