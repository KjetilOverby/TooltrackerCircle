import { postRouter } from "~/server/api/routers/post";
import { settingsRouter } from "~/server/api/routers/settings";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * Dette er hovedrouteren for serveren din.
 *
 * Alle underroutere som er lagt til i `/api/routers` skal legges til her manuelt.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  settings: settingsRouter, // 👈 legg til denne
});

// Eksporter type-definisjonen for API-et
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
