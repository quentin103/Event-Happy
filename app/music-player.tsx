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
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  /* Background music: browsers block autoplay-with-sound until the user
     interacts, so we start the track on the very first gesture (scroll,
     tap, click or key). Once it has played, we stop listening so a manual
     pause sticks. */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.55;

    let armed = true;
    const events = ["pointerdown", "keydown", "wheel", "scroll", "touchstart"];
    const cleanup = () =>
      events.forEach((e) => window.removeEventListener(e, start));

    const start = () => {
      if (!armed) return;
      a.play()
        .then(() => {
          armed = false;
          cleanup();
        })
        .catch(() => {
          /* still blocked — keep waiting for a stronger gesture */
        });
    };

    events.forEach((e) =>
      window.addEventListener(e, start, { passive: true }),
    );
    return cleanup;
  }, []);

  /* keep button state in sync with the actual audio element */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => {
      setPlaying(true);
      setReady(true);
    };
    const onPause = () => setPlaying(false);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 print:hidden">
      <audio ref={audioRef} src={MUSIC} loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Mettre la musique en pause" : "Lancer la musique"}
        aria-pressed={playing}
        className="group flex items-center gap-3 rounded-full border border-gold/50 bg-marine-deep/80 py-2.5 pl-2.5 pr-4 text-cream shadow-[0_10px_30px_-10px_rgba(10,12,30,0.7)] backdrop-blur-md transition hover:border-gold hover:bg-marine-deep"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-gold text-marine-deep transition group-hover:scale-105">
          {playing ? (
            <Pause className="size-4 fill-current" />
          ) : (
            <Play className="size-4 translate-x-px fill-current" />
          )}
        </span>

        {/* animated equalizer while playing, music note otherwise */}
        {playing ? (
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

        <span className="text-xs font-medium uppercase tracking-[0.2em] text-cream/85">
          {playing ? "Musique" : ready ? "Reprendre" : "Écouter"}
        </span>
      </button>
    </div>
  );
}
