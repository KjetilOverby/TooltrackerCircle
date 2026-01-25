// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
 
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/select-org(.*)",   // må være tilgjengelig
]);

export default clerkMiddleware(async (auth, req) => {
  // La public routes gå
  if (isPublicRoute(req)) return NextResponse.next();

  // Krev innlogging på alt annet
  await auth.protect();

  // Krev org på alt annet
  const { orgId } = await auth();
  if (!orgId) {
    return NextResponse.redirect(new URL("/select-org", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Viktig: treffer “pages” + app routes, og ikke bare API
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
