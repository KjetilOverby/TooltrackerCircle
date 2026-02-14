import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

function requireOrgId(orgId: string | null | undefined) {
  if (!orgId) {
    throw new Error("Du må være i en organisasjon for å bruke denne funksjonen");
  }
  return orgId;
}

export const serviceRouter = createTRPCRouter({
    // Finn et blad for innsjekk via nøyaktig IdNummer
// i service.ts routeren
// i service.ts routeren
getByExactIdNummer: protectedProcedure
  .input(z.object({ idNummer: z.string().min(1) }))
  .query(async ({ ctx, input }) => {
    const orgId = requireOrgId(ctx.auth.orgId);

    return ctx.db.sawBlade.findFirst({
      where: { orgId, IdNummer: input.idNummer.trim()},
      include: {
        bladeType: true,
        services: { 
          orderBy: { datoInn: "desc" },
          include: {
            actions: {
              include: {
                kode: true // I skjemaet ditt heter det 'kode', ikke 'code'
              }
            }
          }
        },
        installs: {
          orderBy: { installedAt: "desc" },
          take: 10,
          include: { 
            saw: true,
            runLog: true 
          },
        },
      },
    });
  }),
  
  // Registrer blad inn til service (Denne matcher frontend 'create')
  create: protectedProcedure
  .input(z.object({ 
    bladeId: z.string().min(1),
    serviceType: z.string().optional(),
    note: z.string().optional(),
    datoInn: z.date().default(() => new Date()),
    feilkode: z.string().optional(), // Dette er valideringen
  }))
  .mutation(async ({ ctx, input }) => {
    const orgId = requireOrgId(ctx.auth.orgId);

    // Sjekk om bladet allerede er på service
    const existing = await ctx.db.bladeService.findFirst({
      where: { orgId, bladeId: input.bladeId, datoUt: null },
    });
    if (existing) throw new Error("Bladet er allerede registrert på service");

    return ctx.db.bladeService.create({
      data: {
        orgId,
        bladeId: input.bladeId,
        datoInn: input.datoInn,
        serviceType: input.serviceType,
        note: input.note,
        createdById: ctx.auth.userId,
        feilkode: input.feilkode, // <--- HER SKAL DET STÅ input.feilkode
      },
    });
  }),
  
    // Registrer blad ut av service (Ferdig)
    checkOut: protectedProcedure
    .input(
      z.object({
        serviceId: z.string(),
        datoUt: z.date(),
        noteSupplier: z.string().optional(),
        selectedKodeIds: z.array(z.string()),
        antRep: z.number(),         // Legg til denne
        antTannslipp: z.number(),   // Legg til denne
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.bladeService.update({
        where: { id: input.serviceId },
        data: {
          datoUt: input.datoUt,
          noteSupplier: input.noteSupplier,
          antRep: input.antRep,
          antTannslipp: input.antTannslipp,
          // Husk å koble til handlingene/kodene også
          actions: {
            create: input.selectedKodeIds.map((id) => ({
              kodeId: id,
            })),
          },
        },
      });
    }),
  
    // Liste over alt som er på verksted akkurat nå
    getActiveServices: protectedProcedure.query(async ({ ctx }) => {
      const orgId = requireOrgId(ctx.auth.orgId);
      return ctx.db.bladeService.findMany({
        where: { orgId, datoUt: null },
        include: {
          blade: {
            include: { bladeType: true }
          }
        },
        orderBy: { datoInn: "asc" }
      });
    }),
  });