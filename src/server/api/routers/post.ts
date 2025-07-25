import { z } from "zod";
import { clerkClient, createClerkClient } from "@clerk/nextjs/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";



export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, userId } = ctx.auth;
      if (!orgId) {
        throw new Error("Du må være i en organisasjon for å opprette en post");
      }
  
      return ctx.db.post.create({
        data: {
          name: input.name,
          orgId,
          userId
        },
      });
    }),

    getLatest: protectedProcedure.query(async ({ ctx }) => {
      const { orgId } = ctx.auth;
    
      if (!orgId) {
        return null; // 👈 Ikke kast feil, bare si "ingen post"
      }
    
      // Hent poster for organisasjonen
      const posts = await ctx.db.post.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
      });
    
      if (!posts || posts.length === 0) {
        return null; // Ingen poster funnet
      }
    
      // Opprett Clerk-klient
      const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    
      // Hent brukerinformasjon for hver post basert på userId
      const postsWithAuthorInfo = await Promise.all(
        posts.map(async (post) => {
          try {
            const user = await clerkClient.users.getUser(post.userId); // Hent brukerdata fra Clerk
            return {
              ...post,
              author: {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`, // Kombiner fornavn og etternavn
                email: user.emailAddresses[0]?.emailAddress, // Hent e-postadresse
              },
            };
          } catch (error) {
            console.error(`Failed to fetch user with ID ${post.userId}:`, error);
            return {
              ...post,
              author: null, // Returner null hvis brukeren ikke finnes
            };
          }
        })
      );
    
      return postsWithAuthorInfo;
    }),


   
});
