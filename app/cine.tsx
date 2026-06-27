"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import {
  motion,
  useSpring,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { ChevronDown, Heart, CalendarDays, MapPin } from "lucide-react";

import {
  chapters,
  src,
  ASPECT,
  type Chapter,
  type Photo,
} from "./love-story-data";

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
  | { kind: "chapter"; chapter: Chapter }
  | { kind: "photos"; chapter: Chapter; items: PhotoItem[] }
  | { kind: "credits" };

function buildScenes(): Scene[] {
  const s: Scene[] = [{ kind: "title" }];
  let n = 0;
  chapters.forEach((ch) => {
    s.push({ kind: "chapter", chapter: ch });
    const items: PhotoItem[] = ch.photos.map((photo) => ({
      photo,
      n: (n += 1),
    }));
    for (let i = 0; i < items.length; i += GROUP) {
      s.push({ kind: "photos", chapter: ch, items: items.slice(i, i + GROUP) });
    }
  });
  s.push({ kind: "credits" });
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
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/70 sm:w-20" />
      <Heart className="size-4 fill-gold text-gold" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/70 sm:w-20" />
    </div>
  );
}

/* ============================================================ */
export default function Cine() {
  const scenes = useMemo(() => buildScenes(), []);

  useEffect(() => {
    document.documentElement.classList.add("cine-snap");
    return () => document.documentElement.classList.remove("cine-snap");
  }, []);

  return (
    <div className="relative text-cream">
      {/* fixed cinematic overlays above every scene */}
      <div className="pointer-events-none fixed inset-0 z-40">
        <div className="film-grain absolute inset-0" />
        <div className="absolute inset-x-0 top-0 h-[4vh] bg-black" />
        <div className="absolute inset-x-0 bottom-0 h-[4vh] bg-black" />
      </div>

      {scenes.map((sc, i) => (
        <section
          key={i}
          className="relative h-[100svh] w-full snap-start snap-always overflow-hidden"
        >
          <SceneView scene={sc} seed={i} />
          {i === 0 && (
            <div className="pointer-events-none absolute bottom-[7vh] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1 text-cream/70">
              <span className="font-serif-elegant text-xs uppercase tracking-[0.3em]">
                Faites défiler
              </span>
              <ChevronDown className="animate-scroll-bob size-5" />
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

/* ---------- interactive 3D-tilt photo ---------- */
function TiltPhoto({
  photo,
  accentVar,
  wrapperClass,
  sizeClass,
  sizes,
  priority = false,
}: {
  photo: Photo;
  accentVar: string;
  wrapperClass: string;
  sizeClass: string;
  sizes: string;
  priority?: boolean;
}) {
  const reduced = useReducedMotion();
  const rx = useSpring(0, { stiffness: 150, damping: 16 });
  const ry = useSpring(0, { stiffness: 150, damping: 16 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 14);
    rx.set(-py * 14);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div className={`group relative ${wrapperClass}`}>
      <motion.div variants={ITEM} className="relative">
        {/* accent halo */}
        <div
          className="pointer-events-none absolute -inset-5 rounded-[2.5rem] opacity-25 blur-2xl transition-opacity duration-500 group-hover:opacity-70"
          style={{ background: `radial-gradient(closest-side, ${accentVar}, transparent)` }}
        />
        <motion.div
          onMouseMove={onMove}
          onMouseLeave={reset}
          whileHover={{ scale: 1.035 }}
          style={{
            rotateX: rx,
            rotateY: ry,
            transformPerspective: 1000,
            aspectRatio: ASPECT[photo.orientation],
          }}
          className={`relative overflow-hidden rounded-2xl bg-black shadow-[0_30px_70px_-28px_rgba(0,0,0,0.85)] ring-1 ring-white/15 ${sizeClass}`}
        >
          <Image
            src={src(photo.file)}
            alt={photo.caption}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover object-[center_28%]"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

/* 4 superposition models that rotate so two photos are never arranged
   the same way twice */
function layoutFor(seed: number, count: number): string[] {
  if (count === 1) return ["rotate-[-1.5deg]"];
  switch (seed % 4) {
    case 0: // vertical overlap
      return [
        "z-10 -rotate-3 translate-y-6 -mr-6 sm:-mr-16",
        "z-20 rotate-3 -translate-y-6",
      ];
    case 1: // tilted apart
      return [
        "-rotate-3 -translate-y-4 sm:-translate-y-8",
        "rotate-3 translate-y-4 sm:translate-y-8",
      ];
    case 2: // strong diagonal overlap
      return [
        "z-10 -rotate-6 translate-x-3 translate-y-7 sm:translate-x-6 -mr-8 sm:-mr-20",
        "z-20 rotate-3 -translate-y-7",
      ];
    default: // big + small inset, tucked low-left
      return [
        "z-10 rotate-2 translate-y-3",
        "z-20 scale-[0.72] -rotate-3 -ml-10 translate-y-12 sm:-ml-24 sm:translate-y-16",
      ];
  }
}

/* ============================================================ */
function SceneView({ scene, seed }: { scene: Scene; seed: number }) {
  if (scene.kind === "title") return <TitleScene />;
  if (scene.kind === "chapter")
    return <ChapterScene chapter={scene.chapter} seed={seed} />;
  if (scene.kind === "photos")
    return (
      <PhotosScene
        chapter={scene.chapter}
        items={scene.items}
        seed={seed}
      />
    );
  return <CreditsScene seed={seed} />;
}

function TitleScene() {
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
      <motion.div className="absolute inset-0" style={{ x: mx, y: my }}>
        <div className="absolute inset-[-6%]">
          <Image
            src={src(HERO_PHOTO)}
            alt="Lyce Andréa & Joseph"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_28%]"
          />
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
          className="font-script text-6xl leading-[0.95] text-cream drop-shadow-[0_2px_22px_rgba(0,0,0,0.7)] sm:text-8xl md:text-9xl"
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
          className="font-script text-6xl leading-[0.95] text-cream drop-shadow-[0_2px_22px_rgba(0,0,0,0.7)] sm:text-8xl md:text-9xl"
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

function ChapterScene({
  chapter,
  seed,
}: {
  chapter: Chapter;
  seed: number;
}) {
  const accentVar = ACCENT_VAR[chapter.accent];
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center">
      <Backdrop seed={seed} />
      <motion.div
        variants={CONTAINER}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        className="relative max-w-2xl"
      >
        <motion.p
          variants={ITEM}
          className={`mb-4 text-xs font-medium uppercase tracking-[0.5em] ${ACCENT_TEXT[chapter.accent]}`}
        >
          {chapter.eyebrow}
        </motion.p>
        <motion.h2
          variants={ITEM}
          className="font-display text-5xl font-semibold text-cream drop-shadow-[0_2px_30px_rgba(0,0,0,0.5)] sm:text-7xl"
        >
          {chapter.title}
        </motion.h2>
        <motion.div
          variants={ITEM}
          className="mx-auto mt-7 h-[2px] w-44 rounded-full"
          style={{
            background: `linear-gradient(to right, transparent, ${accentVar}, transparent)`,
            boxShadow: `0 0 22px 2px color-mix(in oklch, ${accentVar} 60%, transparent)`,
          }}
        />
        <motion.p
          variants={ITEM}
          className="mx-auto mt-7 max-w-xl font-serif-elegant text-lg italic text-cream/80 sm:text-xl"
        >
          {chapter.subtitle}
        </motion.p>
      </motion.div>
    </div>
  );
}

/* free, lightly-styled text zone — just the memory, told plainly, off the
   image (one line per photo, for both or a single one) */
function StoryText({
  chapter,
  items,
}: {
  chapter: Chapter;
  items: PhotoItem[];
}) {
  return (
    <motion.div
      variants={ITEM}
      className="w-full max-w-md text-center sm:max-w-[21rem] sm:text-left"
    >
      <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.45em] text-cream/50">
        {chapter.title}
      </p>
      <div className="space-y-5">
        {items.map((it) => (
          <p
            key={it.photo.file}
            className="font-serif-elegant text-2xl italic leading-relaxed text-cream/90 sm:text-[1.9rem]"
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
  const wraps = layoutFor(seed, items.length);
  const solo = items.length === 1;
  const sizeClass = solo
    ? "h-[48vh] max-w-[86vw] sm:h-[74vh] sm:max-w-[44vw]"
    : "h-[34vh] max-w-[47vw] sm:h-[62vh] sm:max-w-[31vw]";
  const sizes = solo
    ? "(max-width: 768px) 86vw, 44vw"
    : "(max-width: 768px) 47vw, 31vw";
  const textSide = seed % 2 === 0;

  return (
    <div className="relative flex h-full w-full items-center justify-center px-4">
      <Backdrop seed={seed} />

      <motion.div
        variants={CONTAINER}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        className={`relative flex w-full max-w-6xl items-center justify-center gap-8 sm:gap-14 ${
          textSide ? "flex-col-reverse sm:flex-row" : "flex-col-reverse sm:flex-row-reverse"
        }`}
      >
        <StoryText chapter={chapter} items={items} />

        <div className="relative flex items-center justify-center">
          {items.map((it, k) => (
            <TiltPhoto
              key={it.photo.file}
              photo={it.photo}
              accentVar={accentVar}
              wrapperClass={wraps[k]}
              sizeClass={sizeClass}
              sizes={sizes}
              priority={seed <= 2}
            />
          ))}
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
