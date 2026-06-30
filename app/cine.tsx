"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useSpring,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  ChevronDown,
  Heart,
  CalendarDays,
  MapPin,
  ImagePlus,
  Send,
} from "lucide-react";

import {
  chapters,
  src,
  ASPECT,
  HERO_PHOTO,
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

/* durée d'affichage de chaque niveau avant le défilement automatique (ms).
   Réglable ici : 10 000 ms ≈ 10 secondes par niveau. */
const SCENE_DURATION_MS = 10_000;

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

/* ============================================================ */
export default function Cine() {
  const scenes = useMemo(() => buildScenes(), []);
  const reduced = useReducedMotion();

  useEffect(() => {
    document.documentElement.classList.add("cine-snap");
    return () => document.documentElement.classList.remove("cine-snap");
  }, []);

  /* défilement automatique : on avance d'un niveau toutes les
     SCENE_DURATION_MS et on s'arrête sur le dernier niveau (générique).
     Respecte la préférence « réduire les animations ». */
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      const h = window.innerHeight;
      const current = Math.round(window.scrollY / h);
      const next = current + 1;
      if (next >= scenes.length) {
        window.clearInterval(id);
        return;
      }
      window.scrollTo({ top: next * h, behavior: "smooth" });
    }, SCENE_DURATION_MS);
    return () => window.clearInterval(id);
  }, [reduced, scenes.length]);

  return (
    <div className="relative text-cream">
      {/* fixed cinematic overlays above every scene */}
      {/* <div className="pointer-events-none fixed inset-0 z-40">
        <div className="film-grain absolute inset-0" />
        <div className="absolute inset-x-0 top-0 h-[4vh] bg-black" />
        <div className="absolute inset-x-0 bottom-0 h-[4vh] bg-black" />
      </div> */}

      {scenes.map((sc, i) => (
        <section
          key={i}
          className="relative h-svh w-full snap-start snap-always overflow-hidden"
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
      <motion.div className=" absolute inset-0" >
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
        className="mx-auto mb-6 h-[2px] w-16 rounded-full sm:mx-0"
        style={{
          background: `linear-gradient(to right, transparent, ${accentVar}, transparent)`,
          boxShadow: `0 0 16px 1px color-mix(in oklch, ${accentVar} 55%, transparent)`,
        }}
      />
      <div className="space-y-5">
        {items.map((it) => (
          <p
            key={it.photo.file}
            className="font-display text-2xl font-medium leading-snug text-cream drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)] sm:text-[1.95rem]"
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

  const soloClass = "h-[50vh] max-w-[86vw] sm:h-[72vh] sm:max-w-[44vw]";
  const bigClass = "h-[40vh] max-w-[52vw] sm:h-[62vh] sm:max-w-[34vw]";
  const smallClass = "h-[28vh] max-w-[40vw] sm:h-[44vh] sm:max-w-[26vw]";

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
        <StoryText items={items} accentVar={accentVar} />

        {/* photos côte à côte, sans superposition */}
        <div className="relative flex items-center justify-center gap-4 sm:gap-8">
          {items.map((it, k) => {
            const isBig = solo || (bigFirst ? k === 0 : k === 1);
            const sizeClass = solo ? soloClass : isBig ? bigClass : smallClass;
            const sizes = solo
              ? "(max-width: 768px) 86vw, 44vw"
              : isBig
                ? "(max-width: 768px) 52vw, 34vw"
                : "(max-width: 768px) 40vw, 26vw";
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
        <SeamMedallion />
      </div>
      {/* mobile : séparation horizontale au niveau de la couture (≈ 42vh) */}
      <div className="pointer-events-none absolute inset-x-0 top-[42vh] z-20 flex -translate-y-1/2 items-center justify-center sm:hidden">
        <span className="absolute inset-x-0 h-px" style={{ background: line("h") }} />
        <SeamMedallion />
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

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setFileName(file.name);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // UI seulement pour l'instant : aucun envoi réel, juste un remerciement.
    setSent(true);
  };

  return (
    <div className="relative flex h-full w-full flex-col sm:flex-row">
      {/* moitié image — arrière-plan plein cadre */}
      <motion.div
        variants={CONTAINER}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        className="relative h-[42vh] w-full overflow-hidden sm:h-full sm:w-1/2"
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

      {/* moitié formulaire — texte de remerciement + formulaire, dégradé accordé au fond */}
      <motion.div
        variants={CONTAINER}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        style={{
          /* horizontal : tout le bord gauche = la couleur de raccord exacte
             vers laquelle l'image se fond, donc aucune coupure au milieu */
          background:
            "linear-gradient(to right, color-mix(in oklch, var(--marine) 60%, var(--marine-deep)) 0%, var(--marine-deep) 50%, color-mix(in oklch, var(--wed-orange) 22%, var(--marine-deep)) 100%)",
        }}
        className="relative flex w-full flex-1 items-center justify-center overflow-y-auto px-6 py-8 sm:h-full sm:w-1/2 sm:px-10"
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
              <p className="font-serif-elegant text-sm text-cream/80">
                Votre message nous touche droit au cœur.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4 text-left">
              <div>
                <label
                  htmlFor="gb-name"
                  className="mb-1.5 block font-serif-elegant text-xs uppercase tracking-[0.2em] text-cream/70"
                >
                  Votre nom
                </label>
                <input
                  id="gb-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Famille Kouassi"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-cream placeholder:text-cream/40 outline-none backdrop-blur-sm transition-colors focus:border-gold/70"
                />
              </div>

              <div>
                <label
                  htmlFor="gb-message"
                  className="mb-1.5 block font-serif-elegant text-xs uppercase tracking-[0.2em] text-cream/70"
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
                  className="w-full resize-none rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-cream placeholder:text-cream/40 outline-none backdrop-blur-sm transition-colors focus:border-gold/70"
                />
              </div>

              <label
                htmlFor="gb-photo"
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gold/40 bg-white/5 px-4 py-3 text-cream/80 transition-colors hover:border-gold/70 hover:bg-white/10"
              >
                {preview ? (
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/20">
                    {/* aperçu local (blob) — next/image non requis ici */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Aperçu"
                      className="size-full object-cover"
                    />
                  </span>
                ) : (
                  <ImagePlus className="size-5 shrink-0 text-gold" />
                )}
                <span className="truncate font-serif-elegant text-sm">
                  {fileName ?? "Ajouter une photo"}
                </span>
                <input
                  id="gb-photo"
                  type="file"
                  accept="image/*"
                  onChange={onPhoto}
                  className="hidden"
                />
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 font-display text-base font-medium text-marine-deep shadow-lg shadow-black/30 transition-transform hover:scale-[1.02] active:scale-95"
              >
                <Send className="size-4" />
                Envoyer
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
