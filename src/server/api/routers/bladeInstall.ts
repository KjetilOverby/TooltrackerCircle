import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const bladeInstallRouter = createTRPCRouter({
  install: protectedProcedure
    .input(
      z.object({
        sawId: z.string().min(1),
        bladeId: z.string().min(1),
        side: z.string().optional(),
        note: z.string().optional(),
        replaceReason: z.string().optional(),
        replaceNote: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // ✅ T3: Prisma client ligger normalt på ctx.db
      const db = ctx.db;
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "ctx.db mangler i tRPC context",
        });
      }

      const orgId = ctx.auth.orgId;
      if (!orgId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "Du må være i en organisasjon for å montere blad.",
        });
      }
      
    
      

if (!orgId) {
  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "Fant ikke orgId i session/context. Du må være i en organisasjon for å montere blad.",
  });
}
      const userId = ctx.user?.id ?? null;
      const now = new Date();

      return db.$transaction(async (tx) => {
        const currentOnSaw = await tx.bladeInstall.findFirst({
          where: { orgId, sawId: input.sawId, removedAt: null },
          select: { id: true, bladeId: true, sawId: true },
        });

        const currentForBlade = await tx.bladeInstall.findFirst({
          where: { orgId, bladeId: input.bladeId, removedAt: null },
          select: { id: true, sawId: true, bladeId: true },
        });

        if (currentOnSaw?.bladeId === input.bladeId) {
          return { ok: true, noChange: true };
        }

        if (currentOnSaw && !input.replaceReason) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Årsak til bladbytte må fylles ut når du bytter blad i en sag.",
          });
        }

        if (currentOnSaw) {
          await tx.bladeInstall.update({
            where: { id: currentOnSaw.id },
            data: {
              removedAt: now,
              removedById: userId,
              removedReason: input.replaceReason ?? null,
              removedNote: input.replaceNote ?? null,
            },
          });
        }

        if (currentForBlade && currentForBlade.sawId !== input.sawId) {
          await tx.bladeInstall.update({
            where: { id: currentForBlade.id },
            data: {
              removedAt: now,
              removedById: userId,
              removedReason: "Flyttet",
              removedNote: `Flyttet til sag ${input.sawId}`,
            },
          });
        }

        const created = await tx.bladeInstall.create({
          data: {
            orgId,
            sawId: input.sawId,
            bladeId: input.bladeId,
            installedAt: now,
            installedById: userId,
            side: input.side,
            note: input.note,
          },
          select: { id: true },
        });

        return { ok: true, noChange: false, createdInstallId: created.id };
      });
    }),

    uninstall: protectedProcedure
    .input(z.object({ sawId: z.string().min(1),  removedReason: z.string().min(1),
        removedNote: z.string().optional().nullable(), }))
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.auth.orgId;
      if (!orgId) throw new TRPCError({ code: "UNAUTHORIZED", message: "Mangler org" });
  
      const userId = ctx.auth.userId ?? null;
      const now = new Date();
  
      return ctx.db.$transaction(async (tx) => {
        const current = await tx.bladeInstall.findFirst({
          where: { orgId, sawId: input.sawId, removedAt: null },
          select: {
            id: true,
            installedAt: true,
            blade: { select: { id: true, IdNummer: true } },
            saw: { select: { id: true, name: true } },
          },
        });
  
        if (!current) return { ok: true, noChange: true };
  
        const updated = await tx.bladeInstall.update({
          where: { id: current.id },
          data: {
            removedAt: now,
            removedById: userId,
            removedReason: input.removedReason,
            removedNote: input.removedNote ?? null,
          },
          
          select: {
            id: true,
            installedAt: true,
            removedAt: true,
            blade: { select: { id: true, IdNummer: true } },
            saw: { select: { id: true, name: true } },
          },
        });
  
        return { ok: true, noChange: false, install: updated };
      });
    }),

    
    recent: protectedProcedure
    .input(
      z.object({
        take: z.number().min(1).max(50).default(15),
      }),
    )
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "ctx.db mangler i tRPC context",
        });
      }
  
      const orgId = ctx.auth.orgId;
      if (!orgId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Du må være i en organisasjon.",
        });
      }
  
      return db.bladeInstall.findMany({
        where: {
          orgId,
          removedAt: { not: null },
        },
        orderBy: { removedAt: "desc" },
        take: input.take,
        include: {
          blade: true,
          saw: true,          // 👈 DENNE manglet
          _count: {
            select: { runLogs: true },
          },
        },
      });
      
    }),
  
    bladeUnmountsByIdNummer: protectedProcedure
    .input(
      z.object({
        idNummer: z.string().min(1),
        take: z.number().min(1).max(50).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "ctx.db mangler i tRPC context",
        });
      }
  
      const orgId = ctx.auth.orgId;
      if (!orgId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Du må være i en organisasjon.",
        });
      }
  
      // 1) Finn bladet eksakt på IdNummer
      const blade = await db.sawBlade.findFirst({
        where: {
          orgId,
          IdNummer: input.idNummer,
        },
        select: {
          id: true,
          IdNummer: true,
        },
      });
  
      if (!blade) {
        return {
          blade: null,
          rows: [],
        };
      }
  
      // 2) Finn demonteringer for dette bladet
      const rows = await db.bladeInstall.findMany({
        where: {
          orgId,
          bladeId: blade.id,
          removedAt: { not: null },
        },
        orderBy: { removedAt: "desc" },
        take: input.take,
        include: {
          blade: true,
          saw: true,
          _count: {
            select: { runLogs: true },
          },
        },
      });
  
      return {
        blade,
        rows,
      };
    }),
  
    unmountsBySawId: protectedProcedure
    .input(
      z.object({
        sawId: z.string().min(1),
        take: z.number().min(1).max(50).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "ctx.db mangler i tRPC context",
        });
      }
  
      const orgId = ctx.auth.orgId;
      if (!orgId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Du må være i en organisasjon.",
        });
      }
  
      return db.bladeInstall.findMany({
        where: {
          orgId,
          sawId: input.sawId,
          removedAt: { not: null },
        },
        orderBy: { removedAt: "desc" },
        take: input.take,
        include: {
          blade: true,
          saw: true,
          _count: {
            select: { runLogs: true },
          },
        },
      });
    }),
  
});
