import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

function requireOrgId(orgId: string | null | undefined) {
  if (!orgId) {
    throw new Error("Du må være i en organisasjon for å bruke denne funksjonen");
  }
  return orgId;
}

export const driftstatistikkRouter = createTRPCRouter({
    getReasonStats: protectedProcedure
    .input(z.object({ from: z.date().optional(), to: z.date().optional() }))
    .query(async ({ ctx, input }) => {
      const orgId = requireOrgId(ctx.auth.orgId);
      const fromDate = input.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDate = input.to ?? new Date();
  
      const stats = await ctx.db.bladeInstall.groupBy({
        by: ['removedReason'],
        where: {
          orgId,
          removedAt: { gte: fromDate, lte: toDate },
        },
        _count: { removedReason: true },
        orderBy: { _count: { removedReason: 'desc' } },
      });
  
      // 1. Finn totalt antall bytter først
      const totalCount = stats.reduce((acc, curr) => acc + curr._count.removedReason, 0);
      
      if (totalCount === 0) return [];
  
      let runningTotal = 0;
  
      // 2. Map dataene med riktig prosentregning
      return stats.map((s) => {
        const count = s._count.removedReason;
        runningTotal += count;
        
        // Regn ut hvor mange prosent av totalen denne "bunten" utgjør
        const cumulativePercentage = (runningTotal / totalCount) * 100;
  
        return {
          reason: s.removedReason ?? "Uoppgitt",
          count: count,
          // Vi runder av til nærmeste heltall for å slippe lange desimaler
          cumulative: Math.round(cumulativePercentage), 
        };
      });
    }),

    getAllMachineStats: protectedProcedure
  .input(z.object({ from: z.date().optional() }))
  .query(async ({ ctx, input }) => {
    const orgId = requireOrgId(ctx.auth.orgId);
    const fromDate = input.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const stats = await ctx.db.bladeInstall.findMany({
      where: {
        orgId,
        removedAt: { gte: fromDate },
      },
      select: {
        removedReason: true,
        saw: {
          select: {
            name: true,
          },
        },
      },
    });

    // 1. Definer en skikkelig type for det vi lager
    interface GroupedStat {
      machineName: string;
      removedReason: string;
      _count: { _all: number };
    }

    const grouped = stats.reduce((acc, curr) => {
      const machineName = curr.saw?.name ?? "Ukjent maskin";
      const reason = curr.removedReason ?? "Uoppgitt";
      const key = `${machineName}-${reason}`;
      
      // 2. Bruk ??= for å fjerne linter-feil 82:9
      acc[key] ??= {
        machineName,
        removedReason: reason,
        _count: { _all: 0 }
      };
      
      acc[key]._count._all += 1;
      return acc;
    }, {} as Record<string, GroupedStat>); // 3. Bruk typen her i stedet for 'any'

    // 4. Nå returneres en trygg type (GroupedStat[]), som fjerner feil 94:7
    return Object.values(grouped);
  }),

});