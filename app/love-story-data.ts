export type Orientation = "portrait" | "landscape" | "square" | "tall";

export type Photo = {
  file: string;
  caption: string;
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

/** Build a Next/Image-safe src from a filename containing spaces & parens. */
export const src = (file: string) => BASE + encodeURIComponent(file);

export const ASPECT: Record<Orientation, string> = {
  portrait: "3 / 4",
  tall: "4 / 5",
  landscape: "4 / 3",
  square: "1 / 1",
};

export const chapters: Chapter[] = [
  {
    id: "premiers-regards",
    index: "I",
    eyebrow: "Le commencement",
    title: "Les Premiers Regards",
    subtitle:
      "Là où tout a commencé — deux jeunes cœurs, une étincelle, une évidence.",
    accent: "gold",
    photos: [
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.37.jpeg",
        caption: "Nos premiers fous rires, déjà complices",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.39 (2).jpeg",
        caption: "Deux regards, et déjà des étincelles",
        orientation: "square",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.41 (2).jpeg",
        caption: "Élégants et déjà fous l'un de l'autre",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.37 (3).jpeg",
        caption: "Un miroir, un clic, et c'est nous deux",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.40 (2).jpeg",
        caption: "À la maison, le bonheur tout simple",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.40 (5).jpeg",
        caption: "Collés-serrés, le cœur tout léger",
        orientation: "square",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.40 (3).jpeg",
        caption: "En voiture, des sourires plein le cœur",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.41 (4).jpeg",
        caption: "Sur la route, la nuit rien qu'à nous",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.37 (1).jpeg",
        caption: "Le grand jour des présentations en famille",
        orientation: "landscape",
      },
    ],
  },
  {
    id: "nos-aventures",
    index: "II",
    eyebrow: "Main dans la main",
    title: "Nos Aventures",
    subtitle:
      "Voyages, sorties et fous rires — chaque jour une nouvelle page à écrire.",
    accent: "wed-orange",
    photos: [
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.38 (1).jpeg",
        caption: "Pieds dans le sable, cœurs en fête",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.41 (1).jpeg",
        caption: "Le soleil, la plage, et nous deux",
        orientation: "square",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.35.jpeg",
        caption: "La tête dans les nuages, le sourire au ciel",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.39 (4).jpeg",
        caption: "Complices jusqu'à la dernière bêtise",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.39 (3).jpeg",
        caption: "En route vers mille nouvelles aventures",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.40.jpeg",
        caption: "Un selfie, et tout un éclat de joie",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.36 (3).jpeg",
        caption: "Main dans la main, à travers la ville",
        orientation: "landscape",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.36 (4).jpeg",
        caption: "Nos balades qui sentent bon le quotidien",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.40 (4).jpeg",
        caption: "Un câlin volé en plein soleil",
        orientation: "landscape",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.40 (1).jpeg",
        caption: "Une soirée qui scintille de mille feux",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.41 (3).jpeg",
        caption: "Séance ciné, popcorn et tendresse",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.42 (1).jpeg",
        caption: "Dîners, confidences et éclats de rire",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.41.jpeg",
        caption: "Toujours de la fête, toujours ensemble",
        orientation: "landscape",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.38 (2).jpeg",
        caption: "Pause café, douceur partagée",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.38 (4).jpeg",
        caption: "Quand la nuit fait briller nos yeux",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "notre-miracle",
    index: "III",
    eyebrow: "Quand nous sommes devenus trois",
    title: "Notre Petit Miracle",
    subtitle: "Le plus beau des cadeaux est venu faire déborder notre amour.",
    accent: "wed-fuchsia",
    photos: [
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.36 (1).jpeg",
        caption: "L'attente la plus douce de notre vie",
        orientation: "square",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.16.jpeg",
        caption: "Et nous voilà trois, comblés de bonheur",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "grand-jour",
    index: "IV",
    eyebrow: "L'amour qui mène à l'autel",
    title: "Vers le Grand Jour",
    subtitle:
      "Élégants, rayonnants — chaque instant nous rapproche un peu plus du oui.",
    accent: "marine",
    photos: [
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.42.jpeg",
        caption: "On trinque à la vie, à nous, à demain",
        orientation: "landscape",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.03.jpeg",
        caption: "Côte à côte, partout où la vie nous mène",
        orientation: "landscape",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.02 (3).jpeg",
        caption: "Assortis jusqu'au bout des doigts",
        orientation: "landscape",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.02 (4).jpeg",
        caption: "Élégance, tendresse et regards complices",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.02.jpeg",
        caption: "Sous le soleil, nos plus beaux sourires",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.36.jpeg",
        caption: "Hauts en couleur, et fous de joie",
        orientation: "portrait",
      },
      // — la robe verte, même soirée élégante, regroupées —
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.37 (4).jpeg",
        caption: "Une épaule, un refuge, mon amour",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.39 (1).jpeg",
        caption: "Rayonnante de bonheur, à ton bras",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.38.jpeg",
        caption: "Sublime, et tout sourire pour toi",
        orientation: "portrait",
      },
      // — les soirées qui scintillent —
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.37 (2).jpeg",
        caption: "Sous les étoiles, rien que nous deux",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.39.jpeg",
        caption: "La nuit nous appartient, le cœur en fête",
        orientation: "landscape",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.38 (5).jpeg",
        caption: "Reflets de notre bonheur éclatant",
        orientation: "portrait",
      },
      // — le grand jardin en costume, même journée, en bouquet final —
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.38 (3).jpeg",
        caption: "Sur notre trente-et-un, prêts à tout",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.36 (2).jpeg",
        caption: "Un dernier été de fiancés, le cœur léger",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.02 (1).jpeg",
        caption: "Beaux, amoureux, et bientôt mariés",
        orientation: "portrait",
      },
    ],
  },
];

export const allPhotos: (Photo & { chapterTitle: string })[] = chapters.flatMap(
  (c) => c.photos.map((p) => ({ ...p, chapterTitle: c.title })),
);
