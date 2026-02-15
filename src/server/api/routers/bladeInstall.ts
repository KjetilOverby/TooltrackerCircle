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
          const toSaw = await tx.saw.findUnique({
            where: { id: input.sawId },
            select: { name: true },
          });
        
          await tx.bladeInstall.update({
            where: { id: currentForBlade.id },
            data: {
              removedAt: now,
              removedById: userId,
              removedReason: "Flyttet",
              removedNote: `Flyttet til sag ${toSaw?.name ?? input.sawId}`,
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
        select: {
          id: true,
          installedAt: true,
          removedAt: true,
          removedReason: true,
          removedNote: true,
      
          blade: {
            select: {
              id: true,
              IdNummer: true,
              side: true,
              bladeType: {
                select: {
                  id: true,
                  name: true,
                },
                
              },
              services: {
                // 👇 Vi legger til en filter-betingelse her
                where: {
                  datoUt: null, 
                },
                orderBy: { createdAt: "desc" },
                take: 1,
                select: {
                  id: true,
                  serviceType: true,
                  datoInn: true, // Greit å ha hvis du vil vise hvor lenge den har vært der
                },
              },
          
              
            },
          },
         
          saw: {
            select: {
              id: true,
              name: true,
            },
          },
          runLog: {
                select: {
                  id: true,
                  loggedAt: true,
                  sagtid: true,
                  temperatur: true,
                  sideklaring: true,
                  feilkode: true,  
                  ampere: true,
                  stokkAnt: true,
                  createdAt: true,
                  updatedAt: true,
                  alt: true,   
                }
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
        
        },
      });
    }),



    swap: protectedProcedure
  .input(
    z.object({
      sawId: z.string().min(1),
      newBladeId: z.string().min(1),
      removedReason: z.string().min(1),
      removedNote: z.string().optional().nullable(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const orgId = ctx.auth.orgId;
    if (!orgId)
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Mangler org" });

    const userId = ctx.auth.userId ?? null;
    const now = new Date();

    return ctx.db.$transaction(async (tx) => {
      // 1) Finn aktiv install på maskinen
      const current = await tx.bladeInstall.findFirst({
        where: { orgId, sawId: input.sawId, removedAt: null },
        select: {
          id: true,
          installedAt: true,
          bladeId: true,
          blade: { select: { id: true, IdNummer: true } },
          saw: { select: { id: true, name: true } },
        },
      });

      // 2) Hent nytt blad (og sjekk org)
      const newBlade = await tx.sawBlade.findFirst({
        where: { orgId, id: input.newBladeId },
        select: { id: true, IdNummer: true },
      });

      if (!newBlade) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fant ikke nytt blad i denne organisasjonen",
        });
      }

      // 3) Ikke tillat å bytte til samme blad som allerede står i
      if (current?.bladeId && current.bladeId === input.newBladeId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Det bladet står allerede i denne maskinen",
        });
      }

      // 4) Sørg for at nytt blad ikke allerede står i en annen maskin (aktiv install)
      const newBladeActiveInstall = await tx.bladeInstall.findFirst({
        where: {
          orgId,
          bladeId: input.newBladeId,
          removedAt: null,
        },
        select: { id: true, sawId: true },
      });

      if (newBladeActiveInstall) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Dette bladet er allerede montert i en annen maskin",
        });
      }

      // 5) Avslutt gammel install (hvis finnes)
      const uninstalled = current
        ? await tx.bladeInstall.update({
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
          })
        : null;

      // 6) Opprett ny install
      const installed = await tx.bladeInstall.create({
        data: {
          orgId,
          sawId: input.sawId,
          bladeId: input.newBladeId,
          installedAt: now,
          installedById: userId,
        },
        select: {
          id: true,
          installedAt: true,
          blade: { select: { id: true, IdNummer: true } },
          saw: { select: { id: true, name: true } },
        },
      });

      return {
        ok: true,
        uninstalled: uninstalled
          ? {
              id: uninstalled.id,
              installedAt: uninstalled.installedAt,
              removedAt: uninstalled.removedAt,
              blade: uninstalled.blade,
              saw: uninstalled.saw,
            }
          : null,
        installed,
      };
    });
  }),


  currentOnSaw: protectedProcedure
  .input(z.object({ sawId: z.string().min(1) }))
  .query(async ({ ctx, input }) => {
    const orgId = ctx.auth.orgId;
    if (!orgId) throw new TRPCError({ code: "UNAUTHORIZED", message: "Mangler org" });

    const current = await ctx.db.bladeInstall.findFirst({
      where: { orgId, sawId: input.sawId, removedAt: null },
      select: {
        id: true,
        blade: { select: { id: true, IdNummer: true } },
      },
    });

    return { current };
  }),

  update: protectedProcedure
  .input(
    z.object({
      id: z.string().min(1), // ID-en til BladeInstall-raden
      installedAt: z.date().optional(),
      removedAt: z.date().optional().nullable(),
      removedReason: z.string().optional().nullable(),
      removedNote: z.string().optional().nullable(),
      note: z.string().optional().nullable(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const orgId = ctx.auth.orgId;
    if (!orgId) throw new TRPCError({ code: "UNAUTHORIZED", message: "Mangler org" });

    const { id, ...data } = input;

    // Sjekk at posten faktisk tilhører brukerens organisasjon før oppdatering
    const existing = await ctx.db.bladeInstall.findFirst({
      where: { id, orgId },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Fant ikke installasjonen eller du mangler tilgang.",
      });
    }

    return ctx.db.bladeInstall.update({
      where: { id },
      data: {
        ...data,
        // Vi kan logge hvem som gjorde endringen hvis du har et "updatedById" felt
        // updatedById: ctx.auth.userId 
      },
    });
  }),

delete: protectedProcedure
  .input(z.object({ id: z.string().min(1) }))
  .mutation(async ({ ctx, input }) => {
    const orgId = ctx.auth.orgId;
    if (!orgId) throw new TRPCError({ code: "UNAUTHORIZED", message: "Mangler org" });

    // Verifiser eierskap før sletting
    const existing = await ctx.db.bladeInstall.findFirst({
      where: { id: input.id, orgId },
    });

    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Posten finnes ikke." });
    }

    return ctx.db.bladeInstall.delete({
      where: { id: input.id },
    });
  }),

  
});
