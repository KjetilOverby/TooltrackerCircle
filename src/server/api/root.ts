import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * Dette er hovedrouteren for serveren din.
 *
 * Alle underroutere som er lagt til i `/api/routers` skal legges til her manuelt.
 */
export const appRouter = createTRPCRouter({
  // Legg til underroutere her
  post: postRouter,
});

// Eksporter type-definisjonen for API-et
export type AppRouter = typeof appRouter;

/**
 * Opprett en server-side caller for tRPC API-et.
 * Dette lar deg gjøre direkte kall til API-et fra serveren uten å gå via HTTP.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.getLatest();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);