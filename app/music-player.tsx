"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Music2 } from "lucide-react";

const MUSIC =
  "/audio/" +
  encodeURIComponent(
    "KOLLINS Ft. CHIDINMA - Ma Préférée (Official Video)(MP3_128K).mp3",
  );

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  /* Chrome ne considère pas le défilement (wheel/scroll) comme un geste qui
     débloque le son : seul un clic/tap/touche le ferait. On contourne ça en
     lançant la piste EN MUET dès le chargement (l'autoplay muet est autorisé),
     puis on active le son au tout premier geste — y compris le défilement.
     Comme l'élément joue déjà, le démutage produit du son sans clic. */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = true;
    a.volume = 0.55;
    a.play().catch(() => {
      /* certains navigateurs refusent même l'autoplay muet : le premier
         geste ci-dessous relancera la lecture, son compris. */
    });

    let done = false;
    const events = [
      "pointerdown",
      "keydown",
      "wheel",
      "scroll",
      "touchstart",
      "click",
    ];
    const unmute = () => {
      if (done) return;
      const el = audioRef.current;
      if (!el) return;
      el.muted = false;
      el.volume = 0.55;
      el
        .play()
        .then(() => {
          done = true;
          setSoundOn(true);
          cleanup();
        })
        .catch(() => {
          /* encore bloqué — on attend un geste plus fort (clic/tap) */
        });
    };
    const cleanup = () =>
      events.forEach((e) => window.removeEventListener(e, unmute));

    events.forEach((e) =>
      window.addEventListener(e, unmute, { passive: true }),
    );
    return cleanup;
  }, []);

  /* le bouton reflète si le son est réellement audible (en lecture & non muet) */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const sync = () => setSoundOn(!a.paused && !a.muted && !a.ended);
    a.addEventListener("play", sync);
    a.addEventListener("pause", sync);
    a.addEventListener("ended", sync); // la piste est terminée : on s'arrête
    a.addEventListener("volumechange", sync); // déclenché aussi au changement de muted
    return () => {
      a.removeEventListener("play", sync);
      a.removeEventListener("pause", sync);
      a.removeEventListener("ended", sync);
      a.removeEventListener("volumechange", sync);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused || a.muted || a.ended) {
      a.muted = false;
      // si la piste était finie, on la reprend depuis le début
      if (a.ended || a.currentTime >= a.duration) a.currentTime = 0;
      a.play().catch(() => {});
    } else {
      a.pause();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 print:hidden">
      <audio ref={audioRef} src={MUSIC} preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-label={soundOn ? "Couper la musique" : "Activer la musique"}
        aria-pressed={soundOn}
        className="group flex items-center gap-3 rounded-full border border-gold/50 bg-marine-deep/80 py-2.5 pl-2.5 pr-4 text-cream shadow-[0_10px_30px_-10px_rgba(10,12,30,0.7)] backdrop-blur-md transition hover:border-gold hover:bg-marine-deep"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-gold text-marine-deep transition group-hover:scale-105">
          {soundOn ? (
            <Pause className="size-3 fill-current" />
          ) : (
            <Play className="size-3 translate-x-px fill-current" />
          )}
        </span>

        {/* animated equalizer while playing, music note otherwise */}
        {soundOn ? (
          <span className="flex h-4 items-end gap-[3px]" aria-hidden>
            <span className="eq-bar w-[3px] rounded-full bg-gold" />
            <span
              className="eq-bar w-[3px] rounded-full bg-gold"
              style={{ animationDelay: "0.18s" }}
            />
            <span
              className="eq-bar w-[3px] rounded-full bg-gold"
              style={{ animationDelay: "0.36s" }}
            />
            <span
              className="eq-bar w-[3px] rounded-full bg-gold"
              style={{ animationDelay: "0.1s" }}
            />
          </span>
        ) : (
          <Music2 className="size-4 text-gold" aria-hidden />
        )}
      </button>
    </div>
  );
}
