import Link from "next/link";
import { Heart, Quote, ArrowLeft, PenLine } from "lucide-react";
import type { Metadata } from "next";

import { listEntries, type GuestbookEntry } from "@/app/lib/guestbook";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Livre d'Or — Lyce Andréa & Joseph",
  description:
    "Les messages et souvenirs laissés par nos invités pour notre mariage.",
};

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function Ornament() {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="h-px w-14 bg-linear-to-r from-transparent to-gold/70 sm:w-24" />
      <Heart className="size-4 fill-gold text-gold" />
      <span className="h-px w-14 bg-linear-to-l from-transparent to-gold/70 sm:w-24" />
    </div>
  );
}

export default async function LivreDOrPage() {
  let entries: GuestbookEntry[] = [];
  let loadError = false;
  try {
    entries = await listEntries();
  } catch (err) {
    console.error("[livre-d-or] chargement de la base échoué:", err);
    loadError = true;
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-marine-deep text-cream">
      {/* décor lumineux discret */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, color-mix(in oklch, var(--marine) 55%, var(--marine-deep)) 0%, var(--marine-deep) 55%, color-mix(in oklch, var(--wed-fuchsia) 20%, var(--marine-deep)) 100%)",
          }}
        />
        <div className="aurora drift-1 absolute -left-[12vmax] -top-[10vmax] size-[40vmax] [background:radial-gradient(closest-side,color-mix(in_oklch,var(--gold)_55%,transparent),transparent)] opacity-30" />
        <div className="aurora drift-2 absolute -bottom-[12vmax] -right-[10vmax] size-[42vmax] [background:radial-gradient(closest-side,color-mix(in_oklch,var(--wed-fuchsia)_60%,transparent),transparent)] opacity-30" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        {/* retour */}
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-cream/70 transition-colors hover:text-gold"
        >
          <ArrowLeft className="size-4" />
          Retour à notre histoire
        </Link>

        {/* en-tête */}
        <header className="mb-14 flex flex-col items-center text-center">
          <p className="mb-3 font-serif-elegant text-xs uppercase tracking-[0.5em] text-gold/90">
            Vos mots, nos trésors
          </p>
          <h1 className="font-script text-6xl leading-none text-gold drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)] sm:text-8xl">
            Livre d&apos;Or
          </h1>
          <p className="mt-5 max-w-xl font-serif-elegant text-base italic text-cream/85 sm:text-lg">
            Chaque message et chaque photo laissés ici sont un éclat de bonheur
            que nous garderons précieusement.
          </p>
          <div className="mt-8">
            <Ornament />
          </div>
        </header>

        {loadError ? (
          /* erreur : base indisponible / injoignable */
          <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-3xl border border-wed-orange/40 bg-white/5 px-8 py-14 text-center backdrop-blur-sm">
            <span className="flex size-12 items-center justify-center rounded-full border border-wed-orange/60 font-display text-2xl text-wed-orange">
              !
            </span>
            <p className="font-display text-xl text-cream">
              Le livre d&apos;or est momentanément indisponible
            </p>
            <p className="font-serif-elegant text-sm text-cream/75">
              Nous n&apos;avons pas pu charger les messages pour l&apos;instant.
              Merci de réessayer dans un petit moment.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
              {/* lien classique = rechargement complet (nouveau rendu serveur) */}
              <a
                href="/livre-d-or"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-display text-sm font-medium text-marine-deep transition-transform hover:scale-[1.03]"
              >
                Réessayer
              </a>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-cream/70 transition-colors hover:text-gold"
              >
                <ArrowLeft className="size-4" />
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        ) : entries.length === 0 ? (
          /* état vide */
          <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-3xl border border-gold/25 bg-white/5 px-8 py-14 text-center backdrop-blur-sm">
            <Heart className="size-8 fill-gold text-gold" />
            <p className="font-display text-xl text-cream">
              Le livre d&apos;or est encore vierge
            </p>
            <p className="font-serif-elegant text-sm text-cream/75">
              Soyez les premiers à y déposer un souvenir.
            </p>
            <Link
              href="/#livre-d-or"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-display text-sm font-medium text-marine-deep transition-transform hover:scale-[1.03]"
            >
              <PenLine className="size-4" />
              Laisser un message
            </Link>
          </div>
        ) : (
          <>
            {/* galerie en mur de souvenirs (masonry) */}
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {entries.map((e) => (
                <figure
                  key={e.id}
                  className="group mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur-sm transition-colors hover:border-gold/40"
                >
                  <div className="relative overflow-hidden">
                    {/* image dynamique servie depuis le volume */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={e.file}
                      alt={`Souvenir de ${e.name}`}
                      loading="lazy"
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  <figcaption className="p-5">
                    <Quote className="mb-2 size-5 text-gold/70" />
                    <p className="font-serif-elegant text-lg italic leading-snug text-cream">
                      {e.comment}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                      <span className="font-display text-sm font-medium text-gold">
                        {e.name}
                      </span>
                      <time
                        dateTime={e.created_at}
                        className="shrink-0 font-serif-elegant text-xs uppercase tracking-wide text-cream/55"
                      >
                        {dateFmt.format(new Date(e.created_at))}
                      </time>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>

            {/* appel à contribuer */}
            <div className="mt-16 flex flex-col items-center gap-4 text-center">
              <p className="font-serif-elegant text-sm italic text-cream/70">
                Envie d&apos;ajouter votre pierre à notre histoire&nbsp;?
              </p>
              <Link
                href="/#livre-d-or"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-display text-sm font-medium text-marine-deep shadow-lg shadow-black/30 transition-transform hover:scale-[1.03]"
              >
                <PenLine className="size-4" />
                Laisser un message
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
