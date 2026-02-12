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


  getProductionEfficiency: protectedProcedure
  .input(
    z.object({
      from: z.date().optional(),
      to: z.date().optional(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const orgId = requireOrgId(ctx.auth.orgId);

    const fromDate =
      input.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = input.to ?? new Date();

    // 1) Hent alle sager + alle bladtyper (for å kunne vise "0" også)
    const [allSaws, allBladeTypes] = await Promise.all([
      ctx.db.saw.findMany({
        where: { orgId, active: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      ctx.db.bladeType.findMany({
        where: { orgId, active: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);

    // 2) Hent runlogs i valgt periode (koblet til installs i perioden)
    const rows = await ctx.db.bladeRunLog.findMany({
      where: {
        orgId,
        install: {
          orgId,
          removedAt: { 
            not: null, 
            gte: fromDate, 
            lt: toDate 
          },
        
        },
        sagtid: { not: null },
        stokkAnt: { not: null },
      },
      select: {
        sagtid: true,
        stokkAnt: true,
        install: {
          select: {
            sawId: true,
            saw: { select: { id: true, name: true } },
            blade: {
              select: {
                bladeTypeId: true,
                bladeType: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    // 3) Aggreger
    const perSaw = new Map<
      string,
      {
        sawId: string;
        sawName: string;
        totalHours: number;
        totalStokker: number;
        installs: number;
      }
    >();

    const perBladeType = new Map<
      string,
      {
        bladeTypeId: string;
        bladeTypeName: string;
        totalHours: number;
        totalStokker: number;
        installs: number;
      }
    >();

    let totalHoursAll = 0;
    let totalStokkerAll = 0;
    let installsAll = 0;

    for (const r of rows) {
      const hours = Number(r.sagtid ?? 0);
      const stokker = Number(r.stokkAnt ?? 0);

      // OBS: vi dropper bad data / 0 timer
      if (hours <= 0 || stokker < 0) continue;

      installsAll += 1;
      totalHoursAll += hours;
      totalStokkerAll += stokker;

      // per sag
      const s = r.install.saw;
      const sawEntry = perSaw.get(s.id) ?? {
        sawId: s.id,
        sawName: s.name,
        totalHours: 0,
        totalStokker: 0,
        installs: 0,
      };
      sawEntry.totalHours += hours;
      sawEntry.totalStokker += stokker;
      sawEntry.installs += 1;
      perSaw.set(s.id, sawEntry);

      // per bladtype
      const bt = r.install.blade.bladeType;
      const btEntry = perBladeType.get(bt.id) ?? {
        bladeTypeId: bt.id,
        bladeTypeName: bt.name,
        totalHours: 0,
        totalStokker: 0,
        installs: 0,
      };
      btEntry.totalHours += hours;
      btEntry.totalStokker += stokker;
      btEntry.installs += 1;
      perBladeType.set(bt.id, btEntry);
    }

    // 4) “Fyll inn” alle sager / bladtyper med 0 hvis de mangler i perioden
    const perSawList = allSaws
      .map((s) => {
        const x =
          perSaw.get(s.id) ??
          ({
            sawId: s.id,
            sawName: s.name,
            totalHours: 0,
            totalStokker: 0,
            installs: 0,
          } as const);

        return {
          ...x,
          stokkerPerTime: x.totalHours > 0 ? x.totalStokker / x.totalHours : null,
        };
      })
      .sort((a, b) => (b.stokkerPerTime ?? -1) - (a.stokkerPerTime ?? -1));

    const perBladeTypeList = allBladeTypes
      .map((bt) => {
        const x =
          perBladeType.get(bt.id) ??
          ({
            bladeTypeId: bt.id,
            bladeTypeName: bt.name,
            totalHours: 0,
            totalStokker: 0,
            installs: 0,
          } as const);

        return {
          ...x,
          stokkerPerTime: x.totalHours > 0 ? x.totalStokker / x.totalHours : null,
        };
      })
      .sort((a, b) => (b.stokkerPerTime ?? -1) - (a.stokkerPerTime ?? -1));

    // best/worst (hopper over null først)
    const withValue = perSawList.filter((x) => x.stokkerPerTime !== null);
    const bestSaw = withValue[0] ?? null;
    const worstSaw = withValue.length ? withValue[withValue.length - 1] : null;

    return {
      fromDate,
      toDate,
      overall: {
        installs: installsAll,
        totalHours: totalHoursAll,
        totalStokker: totalStokkerAll,
        stokkerPerTime: totalHoursAll > 0 ? totalStokkerAll / totalHoursAll : null,
      },
      perSaw: perSawList,
      perBladeType: perBladeTypeList,
      bestSaw,
      worstSaw,
    };
  })


});