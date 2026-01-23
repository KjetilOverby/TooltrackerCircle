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
         hasSide: z.boolean().default(false),
          note: z.string().optional().nullable(),
          artikkel: z.string().optional().nullable(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const orgId = requireOrgId(ctx.auth.orgId);
        const userId = ctx.auth.userId;

        return ctx.db.bladeType.create({
          data: {
            orgId,
            name: input.name.trim(),
            hasSide: input.hasSide,
            note: input.note?.trim() ?? null,
            artikkel: input.artikkel?.trim() ?? null,
            createdById: userId ?? null,
          },
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1).optional(),
          hasSide: z.boolean().optional(),
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
            ...(input.hasSide !== undefined ? { side: input.hasSide ?? null } : {}),
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


});
