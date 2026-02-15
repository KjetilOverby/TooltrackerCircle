import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const bladeRunLogRouter = createTRPCRouter({
  /**
   * Hent alle runLogs for en installasjon (etterregistrering / historikk)
   */
  byInstallId: protectedProcedure
    .input(z.object({ installId: z.string().min(1) }))
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
          message: "Du må være i en organisasjon for å hente runlogg.",
        });
      }

      return db.bladeRunLog.findMany({
        where: {
          orgId,
          installId: input.installId,
        },
        orderBy: { loggedAt: "desc" },
      });
    }),

    upsert: protectedProcedure
  .input(
    z.object({
      installId: z.string(),
      loggedAt: z.date().optional(),
      sagtid: z.number().nullable().optional(),
      temperatur: z.number().nullable().optional(),
      sideklaring: z.number().nullable().optional(),
      ampere: z.number().nullable().optional(),
      stokkAnt: z.number().nullable().optional(),
      feilkode: z.string().nullable().optional(),
      alt: z.string().nullable().optional(),
      createService: z.object({
        serviceType: z.string(),
        note: z.string().optional(),
        feilkode: z.string().optional(),
      }).optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { installId, createService, ...data } = input;

    return await ctx.db.$transaction(async (tx) => {
      // 1. Finn installasjonen først. Da VET vi at vi har bladeId.
      const install = await tx.bladeInstall.findUnique({
        where: { id: installId },
        select: { bladeId: true }
      });

      if (!install) {
        throw new Error(`Fant ingen installasjon med ID: ${installId}`);
      }

      // 2. Kjør upsert på driftsloggen
      const log = await tx.bladeRunLog.upsert({
        where: { installId },
        create: {
          orgId: ctx.auth.orgId!,
          installId,
          ...data,
          createdById: ctx.auth.userId,
        },
        update: {
          ...data,
          updatedAt: new Date(),
        },
      });

      // 3. Opprett service hvis det er valgt
      if (createService) {
        // Her bruker vi install.bladeId som vi hentet i steg 1
        await tx.bladeService.create({
          data: {
            orgId: ctx.auth.orgId!,
            bladeId: install.bladeId,
            serviceType: createService.serviceType,
            datoInn: new Date(),
            feilkode: createService.feilkode ?? null,
            note: createService.note ?? null,
            createdById: ctx.auth.userId,
          },
        });
      }

      return log;
    });
  }),

  /**
   * Opprett ny runLog (etterregistrering / feil / stopp / service)
   */
  create: protectedProcedure
    .input(
      z.object({
        installId: z.string().min(1),

        loggedAt: z.date().optional(),

        sagtid: z.number().optional(),
        feilkode: z.string().optional(),
        temperatur: z.number().int().optional(),

        sideklaring: z.number().optional(),
        ampere: z.number().optional(),
        stokkAnt: z.number().int().optional(),
        alt: z.string().optional(),

        bladType: z.string().optional(),
        sawType: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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
          message: "Du må være i en organisasjon for å opprette runlogg.",
        });
      }

      const { installId, loggedAt, ...rest } = input;

      // Valgfritt: sikre at install finnes og tilhører org
      const install = await db.bladeInstall.findFirst({
        where: { id: installId, orgId },
        select: { id: true },
      });
      if (!install) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fant ikke installasjonen (eller du mangler tilgang).",
        });
      }

      return db.bladeRunLog.create({
        data: {
          orgId,
          installId,
          createdById: ctx.auth.userId ?? null,
          ...(loggedAt ? { loggedAt } : {}),
          ...rest,
        },
      });
    }),

  /**
   * Oppdater eksisterende runLog
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),

        loggedAt: z.date().optional(),

        sagtid: z.number().optional().nullable(),
        feilkode: z.string().optional().nullable(),
        temperatur: z.number().int().optional().nullable(),

        sideklaring: z.number().optional().nullable(),
        ampere: z.number().optional().nullable(),
        stokkAnt: z.number().int().optional().nullable(),

    

        alt: z.string().optional().nullable(),

        bladType: z.string().optional().nullable(),
        sawType: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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
          message: "Du må være i en organisasjon for å oppdatere runlogg.",
        });
      }

      const existing = await db.bladeRunLog.findFirst({
        where: { id: input.id, orgId },
        select: { id: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fant ikke runlogg (eller du mangler tilgang).",
        });
      }

      const { id, ...data } = input;

      return db.bladeRunLog.update({
        where: { id },
        data,
      });
    }),

  /**
   * Slett runLog
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
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
          message: "Du må være i en organisasjon for å slette runlogg.",
        });
      }

      const existing = await db.bladeRunLog.findFirst({
        where: { id: input.id, orgId },
        select: { id: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fant ikke runlogg (eller du mangler tilgang).",
        });
      }

      return db.bladeRunLog.delete({
        where: { id: input.id },
      });
    }),
});
