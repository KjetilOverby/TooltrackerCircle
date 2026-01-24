import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const usersRouter = createTRPCRouter({
  byIds: protectedProcedure
    .input(z.object({ ids: z.array(z.string()).min(1) }))
    .query(async ({ input }) => {
      const unique = Array.from(new Set(input.ids));

      const users = await Promise.all(
        unique.map(async (id) => {
          try {
            const clerk = await clerkClient();
const u = await clerk.users.getUser(id);
            return {
              id: u.id,
              name:
                u.fullName ??
                u.primaryEmailAddress?.emailAddress ??
                u.username ??
                "Ukjent",
            };
          } catch {
            return { id, name: "Ukjent" };
          }
        })
      );

      return users; // [{id, name}]
    }),
});
