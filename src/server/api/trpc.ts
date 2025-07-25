/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/server/db";
import { auth, currentUser } from "@clerk/nextjs/server"; // Clerk's server-side auth helper




/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { req: Request }) => {
  const clerkAuth = await auth(); // Retrieve Clerk authentication details
  const user = await currentUser(); // Hent informasjon om den nåværende brukeren
 
  return {
    db, // Prisma client
    req: opts.req, // Next.js request object
    auth: clerkAuth, // Clerk authentication object
    user
  };
  
};


export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (process.env.NODE_ENV === "development") {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Middleware for checking authentication
 *
 * This middleware ensures that the user is authenticated before proceeding.
 */
const isAuthedMiddleware = t.middleware(async ({ ctx, next }) => {
  const { userId } = ctx.auth;

  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to access this resource." });
  }

  // Hent brukerens metadata fra Clerk
  const user = await currentUser(); // Clerk SDK for å hente brukerdata
  const userRole = user?.publicMetadata?.role; // Hent rollen fra publicMetadata
  console.log(`User role: ${userRole}`); // Logg brukerens rolle for debugging

  if (userRole !== "Admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "You do not have permission to access this resource." });
  }

  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth, // Pass the auth object to the next context
      userMetadata: user?.publicMetadata, // Legg til metadata i konteksten
    },
  });
});

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const { userId } = ctx.auth;

  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to access this resource." });
  }

  // Hent brukerens metadata fra Clerk
  const user = await currentUser(); // Clerk SDK for å hente brukerdata
  const userRole = user?.publicMetadata?.role; // Hent rollen fra publicMetadata
  console.log(`User role: ${userRole}`); // Logg brukerens rolle for debugging

  if (userRole !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "You do not have permission to access this resource." });
  }

  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth, // Pass the auth object to the next context
      userMetadata: user?.publicMetadata, // Legg til metadata i konteksten
    },
  });
});


/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * This is the base piece you use to build queries and mutations that require authentication.
 */
// export const protectedProcedure = t.procedure.use(isAuthedMiddleware);