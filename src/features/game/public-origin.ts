/**
 * Adresse publique du site, pour les liens et QR codes à partager.
 * Sur Vercel, une adresse de déploiement (orion-xxxx.vercel.app) demande un compte Vercel :
 * on pointe donc toujours vers l'adresse de production.
 * Ordre : NEXT_PUBLIC_SITE_URL (domaine personnalisé), puis l'adresse de production fournie
 * par Vercel, puis l'adresse de la page (développement local).
 */
export function publicOrigin(): string {
  // Écrites en toutes lettres : Next.js ne remplace que les références directes à process.env.NEXT_PUBLIC_*.
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");
  const vercelProduction = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProduction) return `https://${vercelProduction}`;
  return window.location.origin;
}
