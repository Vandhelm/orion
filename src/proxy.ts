import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Vérification optimiste (présence du cookie seulement, pas d'accès BD).
// La vraie vérification se fait avec requireSession() dans chaque page protégée.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/compte/:path*"],
};
