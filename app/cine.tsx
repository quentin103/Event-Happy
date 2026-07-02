"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useSpring,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  Heart,
  CalendarDays,
  MapPin,
  ImagePlus,
  Send,
  Check,
  X,
  Volume2,
} from "lucide-react";

import {
  chapters,
  src,
  ASPECT,
  HERO_PHOTO_MOBILE,
  HERO_PHOTO_DESKTOP,
  GUESTBOOK_PHOTO,
  type Chapter,
  type Photo,
} from "./love-story-data";

const ACCENT_VAR: Record<Chapter["accent"], string> = {
  gold: "var(--gold)",
  "wed-orange": "var(--wed-orange)",
  "wed-fuchsia": "var(--wed-fuchsia)",
  marine: "var(--marine)",
};

/* fixed bokeh field so each backdrop has drifting points of light */
const BOKEH = [
  { l: "12%", s: "10px", d: "13s", delay: "0s" },
  { l: "28%", s: "6px", d: "17s", delay: "3s" },
  { l: "47%", s: "14px", d: "15s", delay: "6s" },
  { l: "63%", s: "7px", d: "19s", delay: "1.5s" },
  { l: "78%", s: "11px", d: "14s", delay: "4.5s" },
  { l: "90%", s: "8px", d: "18s", delay: "2s" },
];

/* show a couple of photos per scene so each one stays small & crisp */
const GROUP = 2;

type PhotoItem = { photo: Photo; n: number };
type Scene =
  | { kind: "title" }
  | { kind: "photos"; chapter: Chapter; items: PhotoItem[] }
  | { kind: "credits" }
  | { kind: "guestbook" };

function buildScenes(): Scene[] {
  const s: Scene[] = [{ kind: "title" }];
  let n = 0;
  chapters.forEach((ch) => {
    const items: PhotoItem[] = ch.photos.map((photo) => ({
      photo,
      n: (n += 1),
    }));
    for (let i = 0; i < items.length; i += GROUP) {
      s.push({ kind: "photos", chapter: ch, items: items.slice(i, i + GROUP) });
    }
  });
  s.push({ kind: "credits" });
  s.push({ kind: "guestbook" });
  return s;
}

/* ---------- shared motion variants ---------- */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const CONTAINER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
};
const ITEM: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: EASE },
  },
};
const VIEWPORT = { amount: 0.4 as const, once: false };

function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="h-px w-12 bg-linear-to-r from-transparent to-gold/70 sm:w-20" />
      <Heart className="size-4 fill-gold text-gold" />
      <span className="h-px w-12 bg-linear-to-l from-transparent to-gold/70 sm:w-20" />
    </div>
  );
}

/* ---------- progression « status » synchronisée sur la musique ---------- */
function formatClock(sec: number) {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

/* Lit l'audio de fond (#bg-music) et, à mesure que la piste avance :
   - remplit une barre segmentée (un segment par niveau, façon status WhatsApp),
   - fait défiler jusqu'au niveau correspondant (dernier niveau = fin de piste),
   - affiche un décompte du temps restant. */
function StoryProgress({ count, reduced }: { count: number; reduced: boolean }) {
  const [active, setActive] = useState(0);
  const [intra, setIntra] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const audio = document.getElementById("bg-music") as HTMLAudioElement | null;
    if (!audio) return;
    let lastIdx = 0;

    const onTime = () => {
      const d = audio.duration;
      if (!d || Number.isNaN(d) || !Number.isFinite(d)) return;
      const p = Math.min(1, audio.currentTime / d);
      const seg = Math.min(count - 1, Math.floor(p * count));
      setActive(seg);
      setIntra(Math.min(1, p * count - seg));
      setRemaining(Math.max(0, d - audio.currentTime));
      if (!reduced && seg > lastIdx) {
        lastIdx = seg;
        window.scrollTo({ top: seg * window.innerHeight, behavior: "smooth" });
      }
    };
    const onMeta = () =>
      setRemaining(Number.isFinite(audio.duration) ? audio.duration : null);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    onMeta();
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
    };
  }, [count, reduced]);

  /* verrou total : l'utilisateur ne peut pas scroller pendant la lecture.
     Seul le défilement programmatique (piloté par la musique) bouge la page.
     On déverrouille une fois arrivé au dernier niveau (le message), pour que
     le formulaire reste utilisable. */
  useEffect(() => {
    const root = document.documentElement;
    const atEnd = active >= count - 1;
    root.classList.toggle("cine-locked", !atEnd);
    return () => root.classList.remove("cine-locked");
  }, [active, count]);

  return (
    <>
      {/* segments façon status WhatsApp */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex gap-1 px-3 pt-3">
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25"
          >
            <span
              className="block h-full rounded-full bg-gold"
              style={{
                width:
                  i < active ? "100%" : i === active ? `${intra * 100}%` : "0%",
                transition: "width 180ms linear",
              }}
            />
          </span>
        ))}
      </div>
      {/* décompte, façon minuteur de film */}
      {remaining !== null && (
        <div className="pointer-events-none fixed right-3 top-5 z-40 font-mono text-[11px] tracking-[0.25em] text-cream/70 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
          -{formatClock(remaining)}
        </div>
      )}
    </>
  );
}

/* ============================================================ */
export default function Cine() {
  const scenes = useMemo(() => buildScenes(), []);
  const reduced = useReducedMotion();

  useEffect(() => {
    document.documentElement.classList.add("cine-snap");
    // à l'actualisation, on repart toujours du tout début
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    return () => {
      document.documentElement.classList.remove("cine-snap");
      if ("scrollRestoration" in history) history.scrollRestoration = "auto";
    };
  }, []);

  return (
    <div className="relative text-cream">
      {/* barre de progression segmentée + décompte, calés sur la musique :
         le diaporama avance au rythme de la piste et arrive au dernier niveau
         (le message) pile à la fin de la musique. */}
      <StoryProgress count={scenes.length} reduced={!!reduced} />
      {/* fixed cinematic overlays above every scene */}
      {/* <div className="pointer-events-none fixed inset-0 z-40">
        <div className="film-grain absolute inset-0" />
        <div className="absolute inset-x-0 top-0 h-[4vh] bg-black" />
        <div className="absolute inset-x-0 bottom-0 h-[4vh] bg-black" />
      </div> */}

      {scenes.map((sc, i) => (
        <section
          key={i}
          id={sc.kind === "guestbook" ? "livre-d-or" : undefined}
          className="relative h-svh w-full snap-start snap-always overflow-hidden"
        >
          <SceneView scene={sc} seed={i} />
          {i === 0 && (
            <div className="pointer-events-none absolute bottom-[7vh] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1 text-cream/70">
              <Volume2 className="size-5 animate-pulse" />
              <span className="font-serif-elegant text-xs uppercase tracking-[0.3em]">
                Touchez pour le son
              </span>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

/* ---------- living, luminous background ---------- */
/* deep-marine stage lit by the wedding palette (orange · fuchsia · gold).
   4 colour moods rotate so the background is rich, varied & never black. */
type Orb = {
  c: string;
  s: string;
  css: React.CSSProperties;
  d: string;
  o: number;
};

function Backdrop({ seed }: { seed: number }) {
  const m = seed % 4;
  const O = "var(--wed-orange)";
  const F = "var(--wed-fuchsia)";
  const G = "var(--gold)";
  const glow = (c: string) =>
    `radial-gradient(closest-side, color-mix(in oklch, ${c} 85%, transparent), transparent)`;

  /* the whole frame is washed with a different colour mood per scene */
  const base = [
    // warm sunset: orange → marine → fuchsia
    `linear-gradient(145deg, color-mix(in oklch, var(--wed-orange) 46%, var(--marine-deep)) 0%, var(--marine-deep) 52%, color-mix(in oklch, var(--wed-fuchsia) 30%, var(--marine-deep)) 100%)`,
    // passion: fuchsia → marine → orange
    `linear-gradient(135deg, color-mix(in oklch, var(--wed-fuchsia) 48%, var(--marine-deep)) 0%, var(--marine-deep) 55%, color-mix(in oklch, var(--wed-orange) 28%, var(--marine-deep)) 100%)`,
    // jewel marine → fuchsia
    `linear-gradient(160deg, color-mix(in oklch, var(--marine) 70%, var(--marine-deep)) 0%, var(--marine-deep) 48%, color-mix(in oklch, var(--wed-fuchsia) 30%, var(--marine-deep)) 100%)`,
    // gilded warmth: orange → gold → marine
    `linear-gradient(150deg, color-mix(in oklch, var(--wed-orange) 44%, var(--marine-deep)) 0%, color-mix(in oklch, var(--gold) 26%, var(--marine-deep)) 46%, var(--marine-deep) 100%)`,
  ][m];

  const sets: Orb[][] = [
    [
      { c: O, s: "46vmax", css: { top: "-14vmax", left: "-12vmax" }, d: "drift-1", o: 0.44 },
      { c: G, s: "26vmax", css: { top: "26%", right: "4%" }, d: "drift-2", o: 0.26 },
      { c: F, s: "34vmax", css: { bottom: "-16vmax", right: "-10vmax" }, d: "drift-1", o: 0.36 },
    ],
    [
      { c: F, s: "46vmax", css: { top: "-14vmax", right: "-12vmax" }, d: "drift-2", o: 0.44 },
      { c: O, s: "36vmax", css: { bottom: "-16vmax", left: "-12vmax" }, d: "drift-1", o: 0.38 },
      { c: G, s: "22vmax", css: { top: "40%", left: "44%" }, d: "drift-1", o: 0.24 },
    ],
    [
      { c: O, s: "40vmax", css: { bottom: "-14vmax", left: "-10vmax" }, d: "drift-1", o: 0.4 },
      { c: F, s: "40vmax", css: { top: "-14vmax", right: "-10vmax" }, d: "drift-2", o: 0.4 },
      { c: G, s: "22vmax", css: { top: "44%", left: "42%" }, d: "drift-2", o: 0.22 },
    ],
    [
      { c: O, s: "38vmax", css: { top: "-12vmax", left: "-10vmax" }, d: "drift-2", o: 0.42 },
      { c: F, s: "38vmax", css: { top: "-12vmax", right: "-10vmax" }, d: "drift-1", o: 0.42 },
      { c: G, s: "26vmax", css: { bottom: "-12vmax", left: "40%" }, d: "drift-1", o: 0.24 },
    ],
  ];

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: base }}
    >
      {sets[m].map((orb, i) => (
        <div
          key={i}
          className={`aurora ${orb.d}`}
          style={{
            width: orb.s,
            height: orb.s,
            opacity: orb.o,
            background: glow(orb.c),
            ...orb.css,
          }}
        />
      ))}
      <div className="spotlight" />
      {BOKEH.map((b, i) => (
        <span
          key={i}
          className="bokeh"
          style={{
            left: b.l,
            width: b.s,
            height: b.s,
            animationDuration: b.d,
            animationDelay: b.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ---------- still photo (pas d'effet de souris, pas de superposition) ---------- */
function StillPhoto({
  photo,
  accentVar,
  sizeClass,
  sizes,
  priority = false,
}: {
  photo: Photo;
  accentVar: string;
  sizeClass: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <motion.div variants={ITEM} className="relative">
      {/* accent halo */}
      <div
        className="pointer-events-none absolute -inset-4 rounded-[2.5rem] opacity-30 blur-2xl"
        style={{ background: `radial-gradient(closest-side, ${accentVar}, transparent)` }}
      />
      <div
        style={{ aspectRatio: ASPECT[photo.orientation] }}
        className={`relative overflow-hidden rounded-2xl bg-black ring-1 ring-white/15 ${sizeClass}`}
      >
        <Image
          src={src(photo.file)}
          alt={photo.caption}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-[center_28%]"
        />
      </div>
    </motion.div>
  );
}

/* ============================================================ */
function SceneView({ scene, seed }: { scene: Scene; seed: number }) {
  if (scene.kind === "title") return <TitleScene />;
  if (scene.kind === "photos")
    return (
      <PhotosScene
        chapter={scene.chapter}
        items={scene.items}
        seed={seed}
      />
    );
  if (scene.kind === "guestbook") return <GuestbookScene seed={seed} />;
  return <CreditsScene seed={seed} />;
}

/* vrai en dessous de 768px (mobile) — tablette & desktop = false.
   Rendu SSR par défaut = desktop, corrigé au montage (évite tout décalage
   d'hydratation), puis mis à jour à chaque changement de taille d'écran. */
function useIsMobile(query = "(max-width: 767px)") {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return isMobile;
}

function TitleScene() {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const mx = useSpring(0, { stiffness: 60, damping: 18 });
  const my = useSpring(0, { stiffness: 60, damping: 18 });
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * -28);
    my.set(((e.clientY - r.top) / r.height - 0.5) * -28);
  };

  return (
    <div
      onMouseMove={onMove}
      className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center"
    >
      <motion.div className=" absolute inset-0" >
        {/* pas de zoom sur mobile (le -6% ne sert qu'au parallaxe souris) */}
        <div className="absolute inset-0 sm:inset-[-6%]">
          {/* desktop / tablette — fond en fondu selon la taille d'écran */}
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: isMobile ? 0 : 1 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <Image
              src={src(HERO_PHOTO_DESKTOP)}
              alt="Lyce Andréa & Joseph"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_28%]"
            />
          </motion.div>
          {/* mobile */}
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: isMobile ? 1 : 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <Image
              src={src(HERO_PHOTO_MOBILE)}
              alt="Lyce Andréa & Joseph"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/90" />
      </motion.div>
      {/* luminous accents over the hero */}
      <div className="aurora drift-1 absolute left-[-10vmax] top-[-12vmax] size-[42vmax] [background:radial-gradient(closest-side,color-mix(in_oklch,var(--gold)_60%,transparent),transparent)]" />
      {BOKEH.slice(0, 4).map((b, i) => (
        <span
          key={i}
          className="bokeh"
          style={{
            left: b.l,
            width: b.s,
            height: b.s,
            animationDuration: b.d,
            animationDelay: b.delay,
          }}
        />
      ))}

      <motion.div
        variants={CONTAINER}
        initial="hidden"
        animate="visible"
        className="relative flex flex-col items-center"
      >
        <motion.p
          variants={ITEM}
          className="mb-5 font-serif-elegant text-sm uppercase tracking-[0.5em] text-gold/90"
        >
          Notre histoire d&apos;amour
        </motion.p>
        <motion.h1
          variants={ITEM}
          className="font-script text-6xl leading-[0.95] text-gold drop-shadow-[0_2px_22px_rgba(0,0,0,0.7)] sm:text-8xl md:text-9xl"
        >
          Lyce Andréa
        </motion.h1>
        <motion.span
          variants={ITEM}
          className="my-1 font-script text-4xl text-gold sm:text-6xl"
        >
          &amp;
        </motion.span>
        <motion.h1
          variants={ITEM}
          className="font-script text-6xl leading-[0.95] text-gold drop-shadow-[0_2px_22px_rgba(0,0,0,0.7)] sm:text-8xl md:text-9xl"
        >
          Joseph
        </motion.h1>
        <motion.div variants={ITEM} className="mt-8">
          <Ornament />
        </motion.div>
      </motion.div>
    </div>
  );
}

/* free, lightly-styled text zone — just the memory, told plainly, off the
   image (one line per photo, for both or a single one) */
function StoryText({
  items,
  accentVar,
}: {
  items: PhotoItem[];
  accentVar: string;
}) {
  return (
    <motion.div
      variants={ITEM}
      className="w-full max-w-md text-center sm:max-w-[21rem] sm:text-left"
    >
      <div
        className="mx-auto mb-4 h-[2px] w-16 rounded-full sm:mx-0 sm:mb-6"
        style={{
          background: `linear-gradient(to right, transparent, ${accentVar}, transparent)`,
          boxShadow: `0 0 16px 1px color-mix(in oklch, ${accentVar} 55%, transparent)`,
        }}
      />
      <div className="space-y-3 sm:space-y-5">
        {items.map((it) => (
          <p
            key={it.photo.file}
            className="font-display text-xl font-medium leading-snug text-cream drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)] sm:text-[1.95rem]"
          >
            {it.photo.caption}.
          </p>
        ))}
      </div>
    </motion.div>
  );
}

function PhotosScene({
  chapter,
  items,
  seed,
}: {
  chapter: Chapter;
  items: PhotoItem[];
  seed: number;
}) {
  const accentVar = ACCENT_VAR[chapter.accent];
  const solo = items.length === 1;
  /* disposition « aléatoire » mais stable (déterministe via le seed) :
     une grande + une petite, l'ordre alterne d'un niveau à l'autre. */
  const bigFirst = seed % 2 === 0;
  const textSide = seed % 2 === 0;

  const soloClass = "h-[58vh] max-w-[90vw] sm:h-[72vh] sm:max-w-[44vw]";
  const bigClass = "h-[48vh] max-w-[60vw] sm:h-[62vh] sm:max-w-[34vw]";
  const smallClass = "h-[34vh] max-w-[46vw] sm:h-[44vh] sm:max-w-[26vw]";

  return (
    <div className="relative flex h-full w-full items-center justify-center px-4">
      <Backdrop seed={seed} />

      <motion.div
        variants={CONTAINER}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        className={`relative flex w-full max-w-6xl items-center justify-center gap-5 sm:gap-14 ${
          textSide ? "flex-col-reverse sm:flex-row" : "flex-col-reverse sm:flex-row-reverse"
        }`}
      >
        <StoryText items={items} accentVar={accentVar} />

        {/* photos côte à côte, sans superposition */}
        <div className="relative flex items-center justify-center gap-4 sm:gap-8">
          {items.map((it, k) => {
            const isBig = solo || (bigFirst ? k === 0 : k === 1);
            const sizeClass = solo ? soloClass : isBig ? bigClass : smallClass;
            const sizes = solo
              ? "(max-width: 768px) 90vw, 44vw"
              : isBig
                ? "(max-width: 768px) 60vw, 34vw"
                : "(max-width: 768px) 46vw, 26vw";
            return (
              <StillPhoto
                key={it.photo.file}
                photo={it.photo}
                accentVar={accentVar}
                sizeClass={sizeClass}
                sizes={sizes}
                priority={seed <= 2}
              />
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function CreditsScene({ seed }: { seed: number }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center">
      <Backdrop seed={seed} />
      <motion.div
        variants={CONTAINER}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        className="relative flex flex-col items-center"
      >
        <motion.div variants={ITEM}>
          <Heart className="size-7 fill-gold text-gold" />
        </motion.div>
        <motion.p
          variants={ITEM}
          className="mt-6 font-serif-elegant text-xl italic text-cream/85 sm:text-2xl"
        >
          Et l&apos;histoire continue…
        </motion.p>
        <motion.h2
          variants={ITEM}
          className="mt-4 font-script text-5xl leading-tight sm:text-7xl"
        >
          <span className="gold-text">Lyce Andréa &amp; Joseph</span>
        </motion.h2>
        <motion.div variants={ITEM} className="mt-8">
          <Ornament />
        </motion.div>
        <motion.div
          variants={ITEM}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
            <CalendarDays className="size-4 text-gold" />
            Mercredi 15 Juillet 2026
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
            <MapPin className="size-4 text-gold" />
            Mairie d&apos;Angré Djorogobité
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ---------- motif de séparation entre la photo et le formulaire ---------- */
function SeamMedallion() {
  return (
    <span className="relative flex items-center justify-center">
      {/* halo doux */}
      <span
        className="absolute size-20 rounded-full opacity-60 blur-xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklch, var(--gold) 65%, transparent), transparent)",
        }}
      />
      {/* anneau pointillé qui tourne lentement */}
      <motion.svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        className="absolute"
        animate={{ rotate: 360 }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="32"
          cy="32"
          r="29"
          fill="none"
          stroke="var(--gold)"
          strokeOpacity="0.5"
          strokeWidth="1"
          strokeDasharray="2 6"
          strokeLinecap="round"
        />
      </motion.svg>
      {/* médaillon + cœur doré */}
      <svg
        width="52"
        height="52"
        viewBox="0 0 52 52"
        className="relative drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]"
      >
        <circle
          cx="26"
          cy="26"
          r="19"
          fill="var(--marine-deep)"
          stroke="var(--gold)"
          strokeWidth="1.5"
        />
        <g transform="translate(14 14)">
          <path
            fill="var(--gold)"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </g>
      </svg>
    </span>
  );
}

function SeamMotif() {
  const line = (orientation: "v" | "h") =>
    orientation === "v"
      ? "linear-gradient(to bottom, transparent, color-mix(in oklch, var(--gold) 70%, transparent) 16%, color-mix(in oklch, var(--gold) 70%, transparent) 84%, transparent)"
      : "linear-gradient(to right, transparent, color-mix(in oklch, var(--gold) 70%, transparent) 16%, color-mix(in oklch, var(--gold) 70%, transparent) 84%, transparent)";

  return (
    <>
      {/* desktop : séparation verticale au centre */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center justify-center sm:flex">
        <span className="absolute inset-y-0 w-px" style={{ background: line("v") }} />
        {/* <SeamMedallion /> */}
      </div>
      {/* mobile : séparation horizontale au niveau de la couture (≈ 34vh) */}
      <div className="pointer-events-none absolute inset-x-0 top-[34vh] z-20 flex -translate-y-1/2 items-center justify-center sm:hidden">
        <span className="absolute inset-x-0 h-px" style={{ background: line("h") }} />
        {/* <SeamMedallion /> */}
      </div>
    </>
  );
}

/* ---------- livre d'or : merci aux invités + photo & message ---------- */
function GuestbookScene({ seed }: { seed: number }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // n'accepte qu'une image — sinon on ignore et on réinitialise le champ
    if (!file.type.startsWith("image/")) {
      e.target.value = "";
      return;
    }
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setFileName(file.name);
  };

  const removePhoto = () => {
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setFileName(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Ajoutez une photo pour laisser votre souvenir.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("comment", message.trim());
      fd.append("photo", file);
      const res = await fetch("/api/guestbook", { method: "POST", body: fd });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Envoi impossible, réessayez.");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible, réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col sm:flex-row">
      {/* moitié image — arrière-plan plein cadre */}
      <motion.div
        variants={CONTAINER}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        className="relative h-[34vh] w-full overflow-hidden sm:h-full sm:w-1/2"
      >
        <Image
          src={src(GUESTBOOK_PHOTO)}
          alt="Merci à nos invités"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-[center_28%]"
        />
      </motion.div>

      {/* moitié formulaire — texte de remerciement + formulaire, fond uni
         (plus de dégradé : la séparation est marquée par le motif SVG) */}
      <motion.div
        variants={CONTAINER}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        style={{ background: "var(--marine-deep)" }}
        className="relative flex w-full flex-1 items-center justify-center px-6 py-6 sm:h-full sm:w-1/2 sm:px-10 sm:py-0"
      >
        <motion.div variants={ITEM} className="w-full max-w-md text-center sm:text-left">
          {/* texte de remerciement, bien visible au-dessus du formulaire */}
          <p className="mb-3 font-serif-elegant text-xs uppercase tracking-[0.4em] text-gold/90">
            Merci d&apos;être là
          </p>
          <h2 className="font-script text-4xl leading-tight text-gold sm:text-5xl">
            Laissez-nous un souvenir
          </h2>
          <p className="mt-3 font-serif-elegant text-sm italic text-cream/80 sm:text-base">
            Un mot, une photo&nbsp;: offrez-nous un éclat de cette journée à garder
            pour toujours.
          </p>

          {sent ? (
            <div className="mt-8 flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
              <Heart className="size-7 fill-gold text-gold" />
              <p className="font-display text-xl text-cream">
                Merci{name ? `, ${name}` : ""}&nbsp;!
              </p>
              <p className="text-sm text-cream/80">
                Votre message nous touche droit au cœur.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-4 space-y-3 text-left sm:space-y-4">
              <div>
                <label
                  htmlFor="gb-name"
                  className="mb-1 block  text-xs uppercase tracking-[0.2em] text-cream/70 sm:mb-1.5"
                >
                  Votre nom
                </label>
                <input
                  id="gb-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Lyce, Joseph, ou vos prénoms"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-cream placeholder:text-cream/40 outline-none backdrop-blur-sm transition-colors focus:border-gold/70 sm:py-3"
                />
              </div>

              <div>
                <label
                  htmlFor="gb-message"
                  className="mb-1 block text-xs uppercase tracking-[0.2em] text-cream/70 sm:mb-1.5"
                >
                  Votre message
                </label>
                <textarea
                  id="gb-message"
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Vos vœux, un souvenir, un mot doux…"
                  className="w-full resize-none rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-cream placeholder:text-cream/40 outline-none backdrop-blur-sm transition-colors focus:border-gold/70 sm:py-3"
                />
              </div>

              <div>
                <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-cream/70 sm:mb-1.5">
                  Votre photo
                </span>
                {/* champ fichier unique, images uniquement */}
                <input
                  ref={fileRef}
                  id="gb-photo"
                  type="file"
                  accept="image/*"
                  onChange={onPhoto}
                  className="hidden"
                />
                {preview ? (
                  <div className="flex items-center gap-3 rounded-xl border border-gold/40 bg-white/10 p-2 backdrop-blur-sm sm:p-2.5">
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/20 sm:size-14">
                      {/* aperçu local (blob) — next/image non requis ici */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt="Aperçu de votre photo"
                        className="size-full object-cover"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 font-serif-elegant text-sm text-gold">
                        <Check className="size-4 shrink-0" />
                        Photo ajoutée
                      </p>
                      <p className="truncate text-xs text-cream/60">{fileName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={removePhoto}
                      aria-label="Retirer la photo"
                      className="shrink-0 rounded-full p-1.5 text-cream/60 transition-colors hover:bg-white/10 hover:text-cream"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="gb-photo"
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gold/40 bg-white/5 px-4 py-2 text-cream/80 transition-colors hover:border-gold/70 hover:bg-white/10 sm:py-3"
                  >
                    <ImagePlus className="size-5 shrink-0 text-gold" />
                    <span className="font-serif-elegant text-sm">
                      Ajouter une photo
                    </span>
                  </label>
                )}
              </div>

              {error && (
                <p className="text-center text-sm text-wed-orange sm:text-left">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-2.5 font-display text-base font-medium text-marine-deep shadow-lg shadow-black/30 transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
              >
                <Send className="size-4" />
                {submitting ? "Envoi…" : "Envoyer"}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>

      {/* motif SVG décoratif sur la ligne de séparation photo / formulaire */}
      <SeamMotif />
    </div>
  );
}
