export type Orientation = "portrait" | "landscape" | "square" | "tall";

export type Photo = {
  file: string;
  caption: string;
  /** livre d'or — petite description, un brin créative, dans l'esprit de l'événement */
  description: string;
  orientation: Orientation;
};

export type Chapter = {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  /** accent token: matches a wedding palette color */
  accent: "gold" | "wed-orange" | "wed-fuchsia" | "marine";
  photos: Photo[];
};

const BASE = "/photo/";

/** Couverture / photo d'accueil (héros) — une version par format d'écran. */
export const HERO_PHOTO_MOBILE = "couverture/home.jpg";
export const HERO_PHOTO_DESKTOP = "couverture/home.jpeg";
/** défaut (desktop) — conservé pour compatibilité */
export const HERO_PHOTO = HERO_PHOTO_DESKTOP;

/** Photo de clôture, à côté du livre d'or (section « merci aux invités »). */
export const GUESTBOOK_PHOTO = "A la fin.jpeg";

/**
 * Build a public src from a path that may contain sub-folders, spaces & parens.
 * Each path segment is encoded on its own so the "/" separators are preserved.
 */
export const src = (file: string) =>
  BASE + file.split("/").map(encodeURIComponent).join("/");

export const ASPECT: Record<Orientation, string> = {
  portrait: "3 / 4",
  tall: "4 / 5",
  landscape: "4 / 3",
  square: "1 / 1",
};

const D = "WhatsApp Image 2026-06-19 at "; // common filename prefix
const N = "WhatsApp Image 2026-07-03 at "; // prefix of the newer batch

export const chapters: Chapter[] = [
  {
    id: "ancienne-photo",
    index: "I",
    eyebrow: "Le commencement",
    title: "Les Débuts",
    subtitle:
      "Là où tout a commencé — deux jeunes cœurs, une étincelle, une évidence.",
    accent: "gold",
    photos: [
      {
        file: `Ancienne photo/${D}16.52.37 (3).jpeg`,
        caption: "Un miroir, un clic, et c'est nous deux",
        description:
          "Un selfie volé dans le miroir, premier portrait d'une histoire qui ne fait que commencer.",
        orientation: "portrait",
      },
      {
        file: `Ancienne photo/${D}16.52.40.jpeg`,
        caption: "Un selfie, et tout un éclat de joie",
        description:
          "Un bras tendu, un éclat de rire, et notre bonheur capturé d'un seul clic.",
        orientation: "portrait",
      },
      {
        file: `Ancienne photo/${D}16.52.40 (3).jpeg`,
        caption: "En voiture, des sourires plein le cœur",
        description:
          "Sur la banquette, deux complices qui chantent faux et rient fort.",
        orientation: "portrait",
      },
      {
        file: `Ancienne photo/${D}16.52.41 (1).jpeg`,
        caption: "Le soleil, la plage, et nous deux",
        description:
          "Du soleil plein la peau et toi à mes côtés : la définition même d'un jour parfait.",
        orientation: "square",
      },
      {
        file: `Ancienne photo/${D}16.52.38 (1).jpeg`,
        caption: "Pieds dans le sable, cœurs en fête",
        description:
          "Les pieds dans le sable, on a laissé tous nos soucis au bord de l'eau.",
        orientation: "portrait",
      },
      {
        file: `Ancienne photo/${D}16.52.40 (4).jpeg`,
        caption: "Un câlin volé en plein soleil",
        description:
          "Un câlin volé en plein soleil, parce qu'on n'en a tout simplement jamais assez.",
        orientation: "landscape",
      },
      {
        file: `Ancienne photo/${D}16.52.38.jpeg`,
        caption: "Sublime, et tout sourire pour toi",
        description: "Toute pomponnée, et ce sourire-là n'est que pour toi.",
        orientation: "portrait",
      },
      {
        file: `Ancienne photo/${D}16.52.38 (4).jpeg`,
        caption: "Quand la nuit fait briller nos yeux",
        description: "La nuit tombe, et nos yeux n'en brillent que plus fort.",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "dans-la-maison",
    index: "II",
    eyebrow: "Notre cocon",
    title: "À la Maison",
    subtitle:
      "Pas besoin de grand-chose — un toit, un sourire, tout notre monde.",
    accent: "wed-orange",
    photos: [
      {
        file: `Dans la maison/${D}16.52.02 (4).jpeg`,
        caption: "Élégance, tendresse et regards complices",
        description:
          "Un brin d'élégance, beaucoup de tendresse, et toujours ce même regard complice.",
        orientation: "portrait",
      },
      {
        file: `Dans la maison/${D}16.52.36.jpeg`,
        caption: "Hauts en couleur, et fous de joie",
        description:
          "Hauts en couleur et fous de joie, à l'image de notre amour.",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "en-journee",
    index: "III",
    eyebrow: "Sous le soleil",
    title: "Au Grand Jour",
    subtitle:
      "Balades, sorties et grands sourires — chaque journée une page à écrire.",
    accent: "wed-fuchsia",
    photos: [
      {
        file: `En journée/${D}16.52.02.jpeg`,
        caption: "Sous le soleil, nos plus beaux sourires",
        description:
          "Sous le soleil, on a offert au monde nos plus beaux sourires.",
        orientation: "portrait",
      },
      {
        file: `En journée/${D}16.52.02 (3).jpeg`,
        caption: "Assortis jusqu'au bout des doigts",
        description:
          "Mêmes couleurs, même élan : assortis jusqu'au bout des doigts.",
        orientation: "landscape",
      },
      {
        file: `En journée/${D}16.52.35.jpeg`,
        caption: "La tête dans les nuages, le sourire au ciel",
        description:
          "La tête dans les nuages, mais le cœur bien ancré l'un à l'autre.",
        orientation: "portrait",
      },
      {
        file: `En journée/${D}16.52.36 (3).jpeg`,
        caption: "Main dans la main, à travers la ville",
        description:
          "On a arpenté la ville main dans la main, sans jamais vraiment regarder le chemin.",
        orientation: "landscape",
      },
      {
        file: `En journée/${D}16.52.36 (4).jpeg`,
        caption: "Nos balades qui sentent bon le quotidien",
        description:
          "Ces petites balades de rien du tout qui font, mine de rien, les plus beaux souvenirs.",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "en-voiture",
    index: "IV",
    eyebrow: "En chemin",
    title: "Sur la Route",
    subtitle: "Une nouvelle route, un nouvel horizon — et toujours à deux.",
    accent: "marine",
    photos: [
      {
        file: `En voiture/${D}16.52.39 (3).jpeg`,
        caption: "En route vers mille nouvelles aventures",
        description:
          "Une nouvelle route, un nouvel horizon, et toujours la même envie d'y aller ensemble.",
        orientation: "portrait",
      },
      {
        file: `En voiture/${D}16.52.40 (2).jpeg`,
        caption: "Sur la banquette, le bonheur tout simple",
        description:
          "Pas besoin de grand-chose : la route devant, ta main dans la mienne.",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "ensemble",
    index: "V",
    eyebrow: "Complices",
    title: "Tous les Deux",
    subtitle: "Deux complices, une évidence — et déjà tout un monde à nous.",
    accent: "gold",
    photos: [
      {
        file: `Ensemble/${D}16.52.37.jpeg`,
        caption: "Nos premiers fous rires, déjà complices",
        description:
          "Avant même les mots, il y a eu ce rire partagé — le tout premier d'une très longue série.",
        orientation: "portrait",
      },
      {
        file: `Ensemble/${D}16.52.41 (2).jpeg`,
        caption: "Élégants et déjà fous l'un de l'autre",
        description:
          "Tirés à quatre épingles, mais incapables de cacher notre joie d'être ensemble.",
        orientation: "portrait",
      },
      {
        file: `Ensemble/${D}16.52.37 (1).jpeg`,
        caption: "Le grand jour des présentations en famille",
        description:
          "Le jour où nos deux familles n'en sont plus devenues qu'une seule.",
        orientation: "landscape",
      },
      {
        file: `Ensemble/${D}16.52.39.jpeg`,
        caption: "La nuit nous appartient, le cœur en fête",
        description:
          "La nuit nous appartient, le cœur en fête et tout l'avenir devant nous.",
        orientation: "landscape",
      },
    ],
  },
  {
    id: "la-nuit",
    index: "VI",
    eyebrow: "Quand la nuit tombe",
    title: "Au Clair de Lune",
    subtitle:
      "Quand la nuit s'allume, le monde s'efface — il ne reste que nous.",
    accent: "wed-fuchsia",
    photos: [
      {
        file: `La nuit/${D}16.52.39 (2).jpeg`,
        caption: "Deux regards, et déjà des étincelles",
        description:
          "On s'est regardés une seule fois, et le cœur avait déjà tout décidé.",
        orientation: "square",
      },
      {
        file: `La nuit/${D}16.52.40 (5).jpeg`,
        caption: "Collés-serrés, le cœur tout léger",
        description:
          "Serrés l'un contre l'autre, comme si le reste du monde avait disparu.",
        orientation: "square",
      },
      {
        file: `La nuit/${D}16.52.40 (1).jpeg`,
        caption: "Une soirée qui scintille de mille feux",
        description:
          "Quand la nuit s'allume de mille lumières, c'est encore plus beau à deux.",
        orientation: "portrait",
      },
      {
        file: `La nuit/${D}16.52.39 (4).jpeg`,
        caption: "Complices jusqu'à la dernière bêtise",
        description:
          "Toujours partants pour une bêtise de plus, du moment qu'on la fait à deux.",
        orientation: "portrait",
      },
      {
        file: `La nuit/${D}16.52.42 (1).jpeg`,
        caption: "Dîners, confidences et éclats de rire",
        description:
          "Autour d'une table, nos confidences et nos rires qui n'en finissent plus.",
        orientation: "portrait",
      },
      {
        file: `La nuit/${D}16.52.42.jpeg`,
        caption: "On trinque à la vie, à nous, à demain",
        description:
          "On lève nos verres à la vie, à nous deux, et à tous les demains qu'il nous reste à écrire.",
        orientation: "landscape",
      },
    ],
  },
  {
    id: "ensemble-events",
    index: "VII",
    eyebrow: "En fête",
    title: "Les Grands Jours",
    subtitle:
      "Élégants, rayonnants — toujours côte à côte aux plus belles occasions.",
    accent: "wed-orange",
    photos: [
      {
        file: `Ensemble a des events/${D}16.52.41.jpeg`,
        caption: "Toujours de la fête, toujours ensemble",
        description:
          "Là où il y a de la fête, on y est — et toujours côte à côte.",
        orientation: "landscape",
      },
      {
        file: `Ensemble a des events/${D}16.52.03.jpeg`,
        caption: "Côte à côte, partout où la vie nous mène",
        description:
          "Où que la vie nous emmène, on y avance épaule contre épaule.",
        orientation: "landscape",
      },
      {
        file: `Ensemble a des events/${D}16.52.37 (4).jpeg`,
        caption: "Une épaule, un refuge, mon amour",
        description: "Ton épaule, mon refuge préféré, en toutes circonstances.",
        orientation: "portrait",
      },
      {
        file: `Ensemble a des events/${D}16.52.37 (2).jpeg`,
        caption: "Sous les étoiles, rien que nous deux",
        description:
          "Sous les étoiles, le monde s'efface : il ne reste plus que nous deux.",
        orientation: "portrait",
      },
      {
        file: `Ensemble a des events/${D}16.52.41 (3).jpeg`,
        caption: "Séance ciné, popcorn et tendresse",
        description:
          "Lumières tamisées, popcorn partagé et ta main bien au chaud dans la mienne.",
        orientation: "portrait",
      },
      {
        file: `Ensemble a des events/${D}16.52.36 (2).jpeg`,
        caption: "Un dernier été de fiancés, le cœur léger",
        description: "Notre tout dernier été de fiancés, savouré le cœur léger.",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "fermer",
    index: "VIII",
    eyebrow: "Tout près",
    title: "Tout Près",
    subtitle: "Une douceur partagée, un bonheur tout simple, juste nous deux.",
    accent: "marine",
    photos: [
      {
        file: `Fermer/${D}16.52.38 (2).jpeg`,
        caption: "Pause café, douceur partagée",
        description:
          "Une pause café, deux tasses et mille petites douceurs partagées.",
        orientation: "portrait",
      },
      {
        file: `Fermer/${D}16.52.38 (5).jpeg`,
        caption: "Reflets de notre bonheur éclatant",
        description: "Chaque reflet raconte le même bonheur, éclatant et partagé.",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "au-fil-des-jours",
    index: "IX",
    eyebrow: "Instants volés",
    title: "Au Fil des Jours",
    subtitle:
      "Piscine, routes, soirées — tous ces petits riens qui font un grand nous.",
    accent: "gold",
    photos: [
      {
        file: `Nouveau/${N}22.01.25 (3).jpeg`,
        caption: "Un câlin dans l'eau turquoise",
        description:
          "Accrochés l'un à l'autre, même l'eau de la piscine n'a pas pu nous séparer.",
        orientation: "landscape",
      },
      {
        file: `Nouveau/${N}22.05.24.jpeg`,
        caption: "Farniente, sable chaud et toi",
        description:
          "Transats, brise marine et sieste volée : le paradis a un air de plage.",
        orientation: "portrait",
      },
      {
        file: `Nouveau/${N}22.01.24 (1).jpeg`,
        caption: "Grimaces et chill, notre duo du dimanche",
        description:
          "Un dimanche tranquille, deux grimaces, et voilà tout notre bonheur résumé.",
        orientation: "portrait",
      },
      {
        file: `Nouveau/${N}22.01.25 (4).jpeg`,
        caption: "Ton air sérieux, mon plus grand sourire",
        description:
          "Monsieur fait le sérieux, madame rayonne — l'équilibre parfait.",
        orientation: "portrait",
      },
      {
        file: `Nouveau/${N}22.01.25 (6).jpeg`,
        caption: "Sur notre trente-et-un, prêts à briller",
        description:
          "Robe satinée, costume ajusté : la route peut bien attendre, on est splendides.",
        orientation: "portrait",
      },
      {
        file: `Nouveau/${N}22.05.25 (1).jpeg`,
        caption: "En route, le cœur en vacances",
        description:
          "Fenêtres ouvertes, lunettes de soleil, et la route qui n'appartient qu'à nous.",
        orientation: "portrait",
      },
      {
        file: `Nouveau/${N}22.05.25 (2).jpeg`,
        caption: "Peace, love et kilomètres à deux",
        description:
          "Même en noir et blanc, notre complicité saute aux yeux.",
        orientation: "portrait",
      },
      {
        file: `Nouveau/${N}22.05.24 (1).jpeg`,
        caption: "Nos soirées aux mille néons",
        description:
          "Sous les néons multicolores, nos cœurs dansent toujours au même rythme.",
        orientation: "portrait",
      },
      {
        file: `Nouveau/${N}22.01.25 (5).jpeg`,
        caption: "Un baiser au goût d'anniversaire",
        description:
          "Sous les ballons, un baiser qui valait tous les cadeaux du monde.",
        orientation: "landscape",
      },
      {
        file: `Nouveau/${N}22.05.24 (2).jpeg`,
        caption: "Joue contre joue, tout simplement",
        description:
          "Joue contre joue et sourires XXL : la recette de nos plus belles photos.",
        orientation: "portrait",
      },
      {
        file: `Nouveau/${N}22.05.25.jpeg`,
        caption: "Nos mains, notre promesse",
        description:
          "Deux mains enlacées et une bague qui brille : la plus douce des promesses.",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "la-famille",
    index: "X",
    eyebrow: "À trois",
    title: "Notre Famille",
    subtitle: "Le plus beau des cadeaux est venu faire déborder notre amour.",
    accent: "wed-fuchsia",
    photos: [
      {
        file: `La famille/${D}16.52.36 (1).jpeg`,
        caption: "L'attente la plus douce de notre vie",
        description:
          "Neuf mois à rêver à trois — l'attente la plus douce qu'on ait jamais connue.",
        orientation: "square",
      },
      {
        file: `La famille/${D}16.52.16.jpeg`,
        caption: "Et nous voilà trois, comblés de bonheur",
        description:
          "Un petit cœur en plus, et notre amour qui se met à déborder de partout.",
        orientation: "portrait",
      },
    ],
  },
];

export const allPhotos: (Photo & { chapterTitle: string })[] = chapters.flatMap(
  (c) => c.photos.map((p) => ({ ...p, chapterTitle: c.title })),
);
