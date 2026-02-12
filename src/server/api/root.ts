import { postRouter } from "~/server/api/routers/post";
import { settingsRouter } from "~/server/api/routers/settings";
import { sawBladeRouter } from "~/server/api/routers/sawBlade";
import { usersRouter } from "~/server/api/routers/users";
import { bladeInstallRouter } from "./routers/bladeInstall";
import { bladeRunLogRouter } from "./routers/bladeRunLog";
import { driftstatistikkRouter } from "./routers/driftstatistikk";
import { serviceRouter } from "./routers/service";
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
  bladeRunLog: bladeRunLogRouter,
  driftstatistikk: driftstatistikkRouter,
  service: serviceRouter,
});

// Eksporter type-definisjonen for API-et
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
