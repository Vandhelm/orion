import type { Metadata } from "next";
import { Krona_One, Noto_Sans_JP, Silkscreen, Space_Mono, VT323 } from "next/font/google";
import "./globals.css";

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const vt323 = VT323({
  variable: "--font-vt323",
  weight: ["400"],
  subsets: ["latin"],
});

const kronaOne = Krona_One({
  variable: "--font-krona-one",
  weight: ["400"],
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

// Seulement quelques kanji/kana décoratifs : pas de préchargement, les tranches
// Unicode nécessaires sont chargées à la demande.
const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-jp",
  weight: ["300", "700", "900"],
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "O.R.I.O.N",
  description: "Jeu de course en ligne : rejoins la grille de départ, affronte les autres pilotes et vise la première place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      // La page d'accueil défile en douceur (orion.css) ; Next.js le coupe pendant les changements de page.
      data-scroll-behavior="smooth"
      className={`${silkscreen.variable} ${vt323.variable} ${kronaOne.variable} ${spaceMono.variable} ${notoSansJp.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
