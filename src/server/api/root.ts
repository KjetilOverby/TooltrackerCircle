import { postRouter } from "~/server/api/routers/post";
import { settingsRouter } from "~/server/api/routers/settings";
import { sawBladeRouter } from "~/server/api/routers/sawBlade";
import { usersRouter } from "~/server/api/routers/users";
import { bladeInstallRouter } from "./routers/bladeInstall";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * Dette er hovedrouteren for serveren din.
 *
 * Alle underroutere som er lagt til i `/api/routers` skal legges til her manuelt.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  settings: settingsRouter, 
  sawBlade: sawBladeRouter,
  users: usersRouter,
  bladeInstall: bladeInstallRouter,
});

// Eksporter type-definisjonen for API-et
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
