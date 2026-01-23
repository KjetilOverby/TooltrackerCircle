import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";




function requireOrgId(orgId: string | null | undefined) {
  if (!orgId) {
    throw new Error("Du må være i en organisasjon for å bruke denne funksjonen");
  }
  return orgId;
}

// -----------------------
// SAW BLADE (Sagblader)
// -----------------------

export const sawBladeRouter = createTRPCRouter({
  list: protectedProcedure
  .input(
    z
      .object({
        includeDeleted: z.boolean().optional(),
        q: z.string().trim().optional(),
      })
      .optional(),
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
        side: z.string().optional().nullable(),
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
        IdNummer: z.string().min(1).optional(),
        bladeTypeId: z.string().min(1).optional(),
        kunde: z.string().optional().nullable(),
        produsent: z.string().optional().nullable(),
        artikkel: z.string().optional().nullable(),
        side: z.string().optional().nullable(),
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
          ...(input.IdNummer !== undefined
            ? { IdNummer: input.IdNummer.trim() }
            : {}),
          ...(input.bladeTypeId !== undefined
            ? { bladeTypeId: input.bladeTypeId }
            : {}),
          ...(input.kunde !== undefined
            ? { kunde: input.kunde?.trim() ?? null }
            : {}),
          ...(input.produsent !== undefined
            ? { produsent: input.produsent?.trim() ?? null }
            : {}),
          ...(input.artikkel !== undefined
            ? { artikkel: input.artikkel?.trim() ?? null }
            : {}),
          ...(input.side !== undefined ? { side: input.side ?? null } : {}),
          ...(input.note !== undefined
            ? { note: input.note?.trim() ?? null }
            : {}),
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
});
