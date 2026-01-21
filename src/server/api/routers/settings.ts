import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const sideSchema = z.enum(["LEFT", "RIGHT"]);
const optionalSideSchema = sideSchema.optional().nullable();

function requireOrgId(orgId: string | null | undefined) {
  if (!orgId) {
    throw new Error("Du må være i en organisasjon for å bruke denne funksjonen");
  }
  return orgId;
}

export const settingsRouter = createTRPCRouter({
  // -----------------------
  // SAW (Sager / Maskiner)
  // -----------------------
  saw: createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
      const orgId = requireOrgId(ctx.auth.orgId);

      return ctx.db.saw.findMany({
        where: { orgId },
        orderBy: [{ active: "desc" }, { name: "asc" }],
      });
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          sawType: z.string().min(1).optional().nullable(),
          note: z.string().optional().nullable(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const orgId = requireOrgId(ctx.auth.orgId);
        const userId = ctx.auth.userId;

        return ctx.db.saw.create({
          data: {
            orgId,
            name: input.name.trim(),
            sawType: input.sawType?.trim() ?? null,
            note: input.note?.trim() ?? null,
            createdById: userId ?? null,
          },
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1).optional(),
          sawType: z.string().optional().nullable(),
          side: optionalSideSchema,
          note: z.string().optional().nullable(),
          active: z.boolean().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const orgId = requireOrgId(ctx.auth.orgId);

        // Viktig: alltid scope på orgId
        const existing = await ctx.db.saw.findFirst({
          where: { id: input.id, orgId },
          select: { id: true },
        });
        if (!existing) throw new Error("Fant ikke saga i denne organisasjonen");

        return ctx.db.saw.update({
          where: { id: input.id },
          data: {
            ...(input.name !== undefined ? { name: input.name.trim() } : {}),
            ...(input.sawType !== undefined ? { sawType: input.sawType?.trim() ?? null } : {}),
            ...(input.side !== undefined ? { side: input.side ?? null } : {}),
            ...(input.note !== undefined ? { note: input.note?.trim() ?? null } : {}),
            ...(input.active !== undefined ? { active: input.active } : {}),
          },
        });
      }),

    setActive: protectedProcedure
      .input(z.object({ id: z.string().min(1), active: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const orgId = requireOrgId(ctx.auth.orgId);

        const existing = await ctx.db.saw.findFirst({
          where: { id: input.id, orgId },
          select: { id: true },
        });
        if (!existing) throw new Error("Fant ikke saga i denne organisasjonen");

        return ctx.db.saw.update({
          where: { id: input.id },
          data: { active: input.active },
        });
      }),
  }),

  // -----------------------
  // BLADE TYPE (Bladtyper)
  // -----------------------
  bladeType: createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
      const orgId = requireOrgId(ctx.auth.orgId);

      return ctx.db.bladeType.findMany({
        where: { orgId },
        orderBy: [{ active: "desc" }, { name: "asc" }],
      });
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
         
          note: z.string().optional().nullable(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const orgId = requireOrgId(ctx.auth.orgId);
        const userId = ctx.auth.userId;

        return ctx.db.bladeType.create({
          data: {
            orgId,
            name: input.name.trim(),
          
            note: input.note?.trim() ?? null,
            createdById: userId ?? null,
          },
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1).optional(),
          side: optionalSideSchema,
          note: z.string().optional().nullable(),
          active: z.boolean().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const orgId = requireOrgId(ctx.auth.orgId);

        const existing = await ctx.db.bladeType.findFirst({
          where: { id: input.id, orgId },
          select: { id: true },
        });
        if (!existing) throw new Error("Fant ikke bladtypen i denne organisasjonen");

        return ctx.db.bladeType.update({
          where: { id: input.id },
          data: {
            ...(input.name !== undefined ? { name: input.name.trim() } : {}),
            ...(input.side !== undefined ? { side: input.side ?? null } : {}),
            ...(input.note !== undefined ? { note: input.note?.trim() ?? null } : {}),
            ...(input.active !== undefined ? { active: input.active } : {}),
          },
        });
      }),

    setActive: protectedProcedure
      .input(z.object({ id: z.string().min(1), active: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const orgId = requireOrgId(ctx.auth.orgId);

        const existing = await ctx.db.bladeType.findFirst({
          where: { id: input.id, orgId },
          select: { id: true },
        });
        if (!existing) throw new Error("Fant ikke bladtypen i denne organisasjonen");

        return ctx.db.bladeType.update({
          where: { id: input.id },
          data: { active: input.active },
        });
      }),
  }),

  // -----------------------
  // SAW BLADE (Sagblader)
  // -----------------------
  sawBlade: createTRPCRouter({
    list: protectedProcedure
      .input(
        z.object({
          includeDeleted: z.boolean().optional(),
        }).optional(),
      )
      .query(async ({ ctx, input }) => {
        const orgId = requireOrgId(ctx.auth.orgId);
        const includeDeleted = input?.includeDeleted ?? false;

        return ctx.db.sawBlade.findMany({
          where: {
            orgId,
            ...(includeDeleted ? {} : { deleted: false }),
          },
          include: {
            bladeType: true,
          },
          orderBy: [{ deleted: "asc" }, { createdAt: "desc" }],
        });
      }),

    create: protectedProcedure
      .input(
        z.object({
          IdNummer: z.string().min(1),
          bladeTypeId: z.string().min(1),
          kunde: z.string().optional().nullable(),
          produsent: z.string().optional().nullable(),
          artikkel: z.string().optional().nullable(),
          side: optionalSideSchema, // hvis du bruker side på bladet
          note: z.string().optional().nullable(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const orgId = requireOrgId(ctx.auth.orgId);
        const userId = ctx.auth.userId;

        // Sikre at bladtype tilhører samme org
        const bt = await ctx.db.bladeType.findFirst({
          where: { id: input.bladeTypeId, orgId },
          select: { id: true },
        });
        if (!bt) throw new Error("Ugyldig bladtype for denne organisasjonen");

        return ctx.db.sawBlade.create({
          data: {
            orgId,
            IdNummer: input.IdNummer.trim(),
            bladeTypeId: input.bladeTypeId,
            kunde: input.kunde?.trim() ?? null,
            produsent: input.produsent?.trim() ?? null,
            artikkel: input.artikkel?.trim() ?? null,
            side: input.side ?? null,
            note: input.note?.trim() ?? null,
            createdById: userId ?? null,
          },
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string().min(1),
          // Hold det enkelt i v1: la IdNummer være valgfritt å endre.
          // Hvis du vil låse IdNummer etter historikk, si ifra så legger jeg inn regelen.
          IdNummer: z.string().min(1).optional(),
          bladeTypeId: z.string().min(1).optional(),
          kunde: z.string().optional().nullable(),
          produsent: z.string().optional().nullable(),
          artikkel: z.string().optional().nullable(),
          side: optionalSideSchema,
          note: z.string().optional().nullable(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const orgId = requireOrgId(ctx.auth.orgId);

        const existing = await ctx.db.sawBlade.findFirst({
          where: { id: input.id, orgId },
          select: { id: true },
        });
        if (!existing) throw new Error("Fant ikke sagbladet i denne organisasjonen");

        if (input.bladeTypeId) {
          const bt = await ctx.db.bladeType.findFirst({
            where: { id: input.bladeTypeId, orgId },
            select: { id: true },
          });
          if (!bt) throw new Error("Ugyldig bladtype for denne organisasjonen");
        }

        return ctx.db.sawBlade.update({
          where: { id: input.id },
          data: {
            ...(input.IdNummer !== undefined ? { IdNummer: input.IdNummer.trim() } : {}),
            ...(input.bladeTypeId !== undefined ? { bladeTypeId: input.bladeTypeId } : {}),
            ...(input.kunde !== undefined ? { kunde: input.kunde?.trim() ?? null } : {}),
            ...(input.produsent !== undefined ? { produsent: input.produsent?.trim() ?? null } : {}),
            ...(input.artikkel !== undefined ? { artikkel: input.artikkel?.trim() ?? null } : {}),
            ...(input.side !== undefined ? { side: input.side ?? null } : {}),
            ...(input.note !== undefined ? { note: input.note?.trim() ?? null } : {}),
          },
        });
      }),

    softDelete: protectedProcedure
      .input(
        z.object({
          id: z.string().min(1),
          deleteReason: z.string().optional().nullable(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const orgId = requireOrgId(ctx.auth.orgId);

        const existing = await ctx.db.sawBlade.findFirst({
          where: { id: input.id, orgId },
          select: { id: true },
        });
        if (!existing) throw new Error("Fant ikke sagbladet i denne organisasjonen");

        return ctx.db.sawBlade.update({
          where: { id: input.id },
          data: {
            deleted: true,
            deleteReason: input.deleteReason?.trim() ?? null,
          },
        });
      }),

    restore: protectedProcedure
      .input(z.object({ id: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const orgId = requireOrgId(ctx.auth.orgId);

        const existing = await ctx.db.sawBlade.findFirst({
          where: { id: input.id, orgId },
          select: { id: true },
        });
        if (!existing) throw new Error("Fant ikke sagbladet i denne organisasjonen");

        return ctx.db.sawBlade.update({
          where: { id: input.id },
          data: {
            deleted: false,
            deleteReason: null,
          },
        });
      }),
  }),
});
