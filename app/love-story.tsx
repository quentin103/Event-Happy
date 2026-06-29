"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Heart,
  CalendarDays,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Maximize2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  chapters,
  allPhotos,
  src,
  ASPECT,
  type Chapter,
  type Orientation,
} from "./love-story-data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* best photo of the couple — full-bleed cover */
const HERO_PHOTO = "WhatsApp Image 2026-06-19 at 16.52.02 (1).jpeg";

const ACCENT: Record<
  Chapter["accent"],
  { text: string; bg: string; hoverBg: string; via: string; varName: string }
> = {
  gold: {
    text: "text-gold",
    bg: "bg-gold",
    hoverBg: "hover:bg-gold",
    via: "via-gold",
    varName: "var(--gold)",
  },
  "wed-orange": {
    text: "text-wed-orange",
    bg: "bg-wed-orange",
    hoverBg: "hover:bg-wed-orange",
    via: "via-wed-orange",
    varName: "var(--wed-orange)",
  },
  "wed-fuchsia": {
    text: "text-wed-fuchsia",
    bg: "bg-wed-fuchsia",
    hoverBg: "hover:bg-wed-fuchsia",
    via: "via-wed-fuchsia",
    varName: "var(--wed-fuchsia)",
  },
  marine: {
    text: "text-marine",
    bg: "bg-marine",
    hoverBg: "hover:bg-marine",
    via: "via-marine",
    varName: "var(--marine)",
  },
};

const LIGHTBOX_DIMS: Record<Orientation, { w: number; h: number }> = {
  portrait: { w: 960, h: 1280 },
  tall: { w: 1000, h: 1250 },
  landscape: { w: 1280, h: 960 },
  square: { w: 1100, h: 1100 },
};

function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/70 sm:w-20" />
      <Heart className="size-4 fill-gold text-gold" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/70 sm:w-20" />
    </div>
  );
}

export default function LoveStory() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  /* running offset of each chapter inside allPhotos */
  const offsets = chapters.reduce<number[]>((acc, _c, i) => {
    acc[i] = i === 0 ? 0 : acc[i - 1] + chapters[i - 1].photos.length;
    return acc;
  }, []);

  /* ---------------- GSAP scroll choreography ---------------- */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      // HERO — slow cinematic zoom + parallax on the cover photo
      gsap.fromTo(
        ".hero-bg",
        { scale: 1.08 },
        {
          scale: 1.22,
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        },
      );
      gsap.from(".hero-reveal", {
        y: 44,
        opacity: 0,
        duration: 1.1,
        stagger: 0.14,
        ease: "power3.out",
        delay: 0.15,
      });

      // STORY PAGES — frame reveal + image parallax + text stagger
      gsap.utils.toArray<HTMLElement>(".story-page").forEach((page) => {
        const media = page.querySelector(".sp-media");
        const img = page.querySelector(".sp-img");
        const anims = page.querySelectorAll(".sp-anim");

        if (media) {
          gsap.fromTo(
            media,
            { clipPath: "inset(0% 0% 100% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.2,
              ease: "power3.out",
              scrollTrigger: { trigger: page, start: "top 78%" },
            },
          );
        }
        if (img) {
          gsap.fromTo(
            img,
            { yPercent: -8 },
            {
              yPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: page,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }
        gsap.from(anims, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: page, start: "top 72%" },
        });
      });

      // misc fade-ups (intro / footer)
      gsap.utils.toArray<HTMLElement>(".fade-up").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      // recompute once everything (fonts/images) settled
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      const t = window.setTimeout(refresh, 600);
      return () => {
        window.removeEventListener("load", refresh);
        window.clearTimeout(t);
      };
    }, rootRef);

    return () => ctx.revert();
  }, []);

  /* ---------------- lightbox ---------------- */
  const go = useCallback((dir: 1 | -1) => {
    setOpenIndex((i) =>
      i === null ? i : (i + dir + allPhotos.length) % allPhotos.length,
    );
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, go]);

  const current = openIndex !== null ? allPhotos[openIndex] : null;

  return (
    <div
      ref={rootRef}
      className="relative w-full overflow-x-hidden bg-background text-foreground"
    >
      {/* ============================= HERO ============================= */}
      <header className="hero relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="hero-bg absolute inset-0 -z-20 will-change-transform">
          <Image
            src={src(HERO_PHOTO)}
            alt="Lyce Andréa & Joseph"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_28%]"
          />
        </div>
        {/* legibility overlays */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-marine-deep/75 via-marine-deep/45 to-marine-deep/90" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_30%,transparent_30%,oklch(0.16_0.06_266/0.6)_100%)]" />

        <div className="relative flex flex-col items-center text-cream drop-shadow-[0_2px_18px_rgba(10,12,30,0.55)]">
          <p className="hero-reveal mb-6 font-serif-elegant text-sm uppercase tracking-[0.45em] text-cream/90">
            Nous avons l&apos;immense plaisir
          </p>

          <div className="hero-reveal flex flex-col items-center">
            <h1 className="font-script text-[3rem] leading-[0.95] sm:text-8xl md:text-[8.5rem]">
              Lyce Andréa
            </h1>
            <span className="my-1 font-script text-3xl text-gold sm:text-5xl">
              &amp;
            </span>
            <h1 className="font-script text-[3rem] leading-[0.95] sm:text-8xl md:text-[8.5rem]">
              Joseph
            </h1>
          </div>

          <Ornament className="hero-reveal mt-8" />

          <p className="hero-reveal mt-6 max-w-xl font-serif-elegant text-lg italic leading-relaxed text-cream/85 sm:text-xl">
            Une histoire d&apos;amour racontée en images — de nos premiers
            regards jusqu&apos;au plus beau des engagements.
          </p>

          <div className="hero-reveal mt-9 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
              <CalendarDays className="size-4 text-gold" />
              Mercredi 15 Juillet 2026
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
              <Clock className="size-4 text-gold" />
              10h30
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
              <MapPin className="size-4 text-gold" />
              Mairie d&apos;Angré Djorogobité
            </span>
          </div>
        </div>

        <div className="absolute bottom-8 flex flex-col items-center gap-1 text-cream/70">
          <span className="font-serif-elegant text-xs uppercase tracking-[0.3em]">
            Ouvrir le livre
          </span>
          <ChevronDown className="animate-scroll-bob size-5" />
        </div>
      </header>

      {/* ============================= INTRO ============================= */}
      <section className="relative mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="fade-up font-serif-elegant text-2xl leading-relaxed text-foreground sm:text-3xl">
          « Chaque photo est un souvenir, chaque souvenir une page. Voici la
          nôtre. »
        </p>
        <p className="fade-up mt-6 font-script text-4xl text-wed-orange">
          Lyce &amp; Joseph
        </p>
        <Ornament className="fade-up mt-8" />
      </section>

      {/* ============================= THE BOOK ============================= */}
      {chapters.map((chapter, ci) => {
        const accent = ACCENT[chapter.accent];
        return (
          <div key={chapter.id}>
            {/* one photo / one description per page, alternating sides */}
            {chapter.photos.map((photo, pi) => {
              const flatIndex = offsets[ci] + pi;
              const right = flatIndex % 2 === 1;
              return (
                <section
                  key={photo.file}
                  className="story-page relative flex items-center py-6 sm:py-8"
                >
                  <div className="mx-auto grid w-full max-w-5xl items-center gap-5 px-6 md:grid-cols-2 md:gap-10">
                    {/* media */}
                    <div className={right ? "md:order-2" : ""}>
                      <button
                        type="button"
                        onClick={() => setOpenIndex(flatIndex)}
                        className="sp-media group relative mx-auto block max-h-[64vh] w-full overflow-hidden rounded-2xl shadow-[0_30px_60px_-25px_rgba(20,25,50,0.55)] ring-1 ring-black/5"
                        style={{ aspectRatio: ASPECT[photo.orientation] }}
                      >
                        <div className="sp-img absolute inset-0 will-change-transform">
                          <Image
                            src={src(photo.file)}
                            alt={photo.caption}
                            fill
                            sizes="(max-width: 768px) 92vw, 46vw"
                            className="scale-[1.12] object-cover object-[center_28%] transition-[filter] duration-700 group-hover:brightness-105"
                          />
                        </div>
                        <span
                          className={`pointer-events-none absolute inset-0 ${accent.bg} opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-25`}
                        />
                        <span className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-marine-deep/55 text-cream opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
                          <Maximize2 className="size-4" />
                        </span>
                      </button>
                    </div>

                    {/* description — like a page of a book */}
                    <div
                      className={`flex flex-col ${
                        right ? "md:order-1 md:items-end md:text-right" : ""
                      }`}
                    >
                      <div
                        className={`sp-anim flex items-center gap-3 ${
                          right ? "md:flex-row-reverse" : ""
                        }`}
                      >
                        <span className={`h-px w-10 ${accent.bg}`} />
                        <span className={`size-1.5 rounded-full ${accent.bg}`} />
                        <span className={`h-px w-10 ${accent.bg}`} />
                      </div>

                      <p
                        className={`sp-anim mt-4 font-script text-2xl ${accent.text} sm:text-3xl`}
                      >
                        Souvenir n°{String(flatIndex + 1).padStart(2, "0")}
                      </p>

                      <p className="sp-anim mt-4 max-w-md font-serif-elegant text-xl italic leading-relaxed text-foreground/90 sm:text-2xl">
                        {photo.description}
                      </p>

                      <button
                        type="button"
                        onClick={() => setOpenIndex(flatIndex)}
                        className={`sp-anim mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-foreground/15 px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-transparent hover:text-white ${accent.hoverBg}`}
                      >
                        <Maximize2 className="size-4" />
                        Agrandir la photo
                      </button>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        );
      })}

      {/* ============================= FOOTER ============================= */}
      <footer className="relative isolate mt-6 overflow-hidden px-6 py-20 text-center">
        <div className="absolute inset-0 -z-10 bg-marine-deep" />
        <div className="animate-float-slower absolute -right-16 top-4 -z-10 size-72 rounded-full bg-wed-fuchsia/25 blur-3xl" />
        <div className="animate-float-slow absolute -left-16 bottom-0 -z-10 size-72 rounded-full bg-wed-orange/25 blur-3xl" />

        <div className="mx-auto flex max-w-2xl flex-col items-center">
          <Heart className="fade-up size-7 fill-gold text-gold" />
          <p className="fade-up mt-6 font-serif-elegant text-xl italic text-cream/85 sm:text-2xl">
            Et l&apos;histoire continue…
          </p>
          <h2 className="fade-up mt-4 px-2 font-script text-4xl leading-tight text-cream sm:text-6xl">
            <span className="gold-text">Lyce Andréa &amp; Joseph</span>
          </h2>
          <Ornament className="fade-up mt-8" />
          <p className="fade-up mt-6 font-display text-sm uppercase tracking-[0.3em] text-cream/70">
            15 · 07 · 2026 — Mairie d&apos;Angré Djorogobité
          </p>
        </div>
      </footer>

      {/* ============================= LIGHTBOX ============================= */}
      <Dialog open={isOpen} onOpenChange={(o) => !o && setOpenIndex(null)}>
        <DialogContent
          showCloseButton
          className="max-w-[min(96vw,1100px)] border-none bg-transparent p-0 shadow-none ring-0 sm:max-w-[min(92vw,1000px)]"
        >
          {current && (
            <div className="flex flex-col items-center">
              <DialogTitle className="sr-only">{current.caption}</DialogTitle>
              <DialogDescription className="sr-only">
                Photo issue du chapitre {current.chapterTitle}
              </DialogDescription>

              <div className="relative flex items-center justify-center">
                <Image
                  src={src(current.file)}
                  alt={current.caption}
                  width={LIGHTBOX_DIMS[current.orientation].w}
                  height={LIGHTBOX_DIMS[current.orientation].h}
                  sizes="92vw"
                  className="h-auto max-h-[78vh] w-auto max-w-full rounded-xl object-contain shadow-2xl ring-1 ring-gold/30"
                  priority
                />
                <button
                  type="button"
                  aria-label="Photo précédente"
                  onClick={() => go(-1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-marine-deep/70 p-2 text-cream backdrop-blur-sm transition hover:bg-wed-orange sm:-left-14"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  aria-label="Photo suivante"
                  onClick={() => go(1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-marine-deep/70 p-2 text-cream backdrop-blur-sm transition hover:bg-wed-orange sm:-right-14"
                >
                  <ChevronRight className="size-6" />
                </button>
              </div>

              <div className="mt-4 flex flex-col items-center gap-1 rounded-full bg-marine-deep/70 px-6 py-2 backdrop-blur-sm">
                <p className="font-serif-elegant text-base italic text-cream sm:text-lg">
                  {current.caption}
                </p>
                <p className="text-[11px] uppercase tracking-[0.25em] text-gold/80">
                  {current.chapterTitle} · {(openIndex ?? 0) + 1}/
                  {allPhotos.length}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
