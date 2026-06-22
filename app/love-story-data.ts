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
    subtitle: "Là où tout a commencé — deux jeunes cœurs, une évidence.",
    accent: "gold",
    photos: [
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.37.jpeg",
        caption: "Nos premiers sourires complices",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.39 (2).jpeg",
        caption: "Deux regards, une évidence",
        orientation: "square",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.41 (2).jpeg",
        caption: "Élégants, déjà inséparables",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.37 (3).jpeg",
        caption: "Une virée, un miroir, nous deux",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.40 (2).jpeg",
        caption: "À la maison, simplement heureux",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.40 (5).jpeg",
        caption: "Les éclats de rire de nos débuts",
        orientation: "square",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.40 (3).jpeg",
        caption: "Les nuits qui n'en finissaient pas",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.41 (4).jpeg",
        caption: "Sur la route, ensemble",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.37 (1).jpeg",
        caption: "La rencontre des familles",
        orientation: "landscape",
      },
    ],
  },
  {
    id: "nos-aventures",
    index: "II",
    eyebrow: "Main dans la main",
    title: "Nos Aventures",
    subtitle: "Voyages, sorties et fous rires — chaque jour une nouvelle page.",
    accent: "wed-orange",
    photos: [
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.38 (1).jpeg",
        caption: "Pieds dans le sable, cœurs légers",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.41 (1).jpeg",
        caption: "Sous le soleil, pieds nus",
        orientation: "square",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.35.jpeg",
        caption: "La tête dans les nuages",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.39 (4).jpeg",
        caption: "Complices jusqu'au bout",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.39 (3).jpeg",
        caption: "En route vers de nouveaux souvenirs",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.40.jpeg",
        caption: "Un selfie, mille souvenirs",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.36 (3).jpeg",
        caption: "Dans les rues, main dans la main",
        orientation: "landscape",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.36 (4).jpeg",
        caption: "Nos balades du quotidien",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.40 (4).jpeg",
        caption: "Escapades nocturnes",
        orientation: "landscape",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.40 (1).jpeg",
        caption: "Une soirée sous les lumières",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.41 (3).jpeg",
        caption: "Séance ciné en amoureux",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.42 (1).jpeg",
        caption: "Dîners et confidences",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.41.jpeg",
        caption: "Toujours invités, toujours ensemble",
        orientation: "landscape",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.38 (2).jpeg",
        caption: "Pause café, douceur partagée",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.38 (4).jpeg",
        caption: "Les nuits qui brillent",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "notre-miracle",
    index: "III",
    eyebrow: "Quand nous sommes devenus trois",
    title: "Notre Petit Miracle",
    subtitle: "Le plus beau des cadeaux est venu agrandir notre amour.",
    accent: "wed-fuchsia",
    photos: [
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.36 (1).jpeg",
        caption: "L'attente du plus beau des cadeaux",
        orientation: "square",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.16.jpeg",
        caption: "Notre famille s'agrandit",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "grand-jour",
    index: "IV",
    eyebrow: "L'amour qui mène à l'autel",
    title: "Vers le Grand Jour",
    subtitle: "Élégants, rayonnants — chaque instant nous rapproche du oui.",
    accent: "marine",
    photos: [
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.42.jpeg",
        caption: "Célébrer la vie, ensemble",
        orientation: "landscape",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.03.jpeg",
        caption: "Côte à côte, en toute occasion",
        orientation: "landscape",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.02 (3).jpeg",
        caption: "Assortis, comme toujours",
        orientation: "landscape",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.02 (4).jpeg",
        caption: "Élégance et tendresse",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.02.jpeg",
        caption: "Sous le soleil, nos sourires",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.36.jpeg",
        caption: "Hauts en couleur",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.37 (2).jpeg",
        caption: "Soirées étoilées",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.37 (4).jpeg",
        caption: "Une épaule sur laquelle se reposer",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.38 (5).jpeg",
        caption: "Reflets de notre bonheur",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.39.jpeg",
        caption: "La nuit nous appartient",
        orientation: "landscape",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.39 (1).jpeg",
        caption: "Élégante, rayonnante",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.38 (3).jpeg",
        caption: "Prêts pour les grandes occasions",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.36 (2).jpeg",
        caption: "Un dernier été de fiancés",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.02 (1).jpeg",
        caption: "Beaux et amoureux",
        orientation: "portrait",
      },
      {
        file: "WhatsApp Image 2026-06-19 at 16.52.38.jpeg",
        caption: "Vers l'éternité, à deux",
        orientation: "portrait",
      },
    ],
  },
];

export const allPhotos: (Photo & { chapterTitle: string })[] = chapters.flatMap(
  (c) => c.photos.map((p) => ({ ...p, chapterTitle: c.title })),
);
