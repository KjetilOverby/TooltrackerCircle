import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",                // <-- index er offentlig
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/select-org(.*)",  // må være tilgjengelig
]);

export default clerkMiddleware(async (auth, req) => {
  // Slipp gjennom public routes
  if (isPublicRoute(req)) return NextResponse.next();

  // Sjekk innlogging uten å kaste/redirecte automatisk
  const { userId, orgId } = await auth();

  // Ikke innlogget -> send til /
  if (!userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Innlogget, men mangler org -> send til /select-org
  if (!orgId) {
    return NextResponse.redirect(new URL("/select-org", req.url));
  }

  // OK
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};