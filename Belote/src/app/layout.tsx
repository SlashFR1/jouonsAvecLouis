import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Belote Multijoueur ♠️♥️♦️♣️ - Jouons avec Louis',
  description: 'Jeu de Belote multijoueur en temps réel avec la variante de la Quinch (annonces), fidèle aux règles officielles de la FFB.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased overflow-hidden">{children}</body>
    </html>
  );
}
