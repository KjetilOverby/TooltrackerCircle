import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers } from "next/headers";
import { cache } from "react";

import { createCaller, type AppRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { createQueryClient } from "./query-client";

const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  // createTRPCContext forventer { req: Request }
  const req = new Request("http://localhost/api/trpc", { headers: heads });

  return createTRPCContext({ req });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
