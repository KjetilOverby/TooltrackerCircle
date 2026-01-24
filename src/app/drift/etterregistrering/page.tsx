"use client";

import React, { useMemo, useState } from "react";
import EtterregistreringList from "./Etterregistrering";
import SearchDriftHistorikk, { type Mode } from "./SearchDriftHistorikk";
import { api } from "~/trpc/react";

const Page = () => {
  const [mode, setMode] = useState<Mode>("BLADE");

  // Blad-søk (eksakt)
  const [idNummer, setIdNummer] = useState("");
  const bladeQuery = api.bladeInstall.bladeUnmountsByIdNummer.useQuery(
    { idNummer: idNummer.trim(), take: 50 },
    { enabled: false },
  );

  // Maskin-søk
  const [sawId, setSawId] = useState("");
  const sawsQuery = api.settings.saw.list.useQuery(undefined, {
    enabled: mode === "SAW",
    staleTime: 60_000,
  });

  const sawUnmountsQuery = api.bladeInstall.unmountsBySawId.useQuery(
    { sawId, take: 50 },
    { enabled: mode === "SAW" && !!sawId },
  );

  const isFetching =
    mode === "BLADE" ? bladeQuery.isFetching : sawUnmountsQuery.isFetching;

  const rows = useMemo(() => {
    if (mode === "BLADE") return bladeQuery.data?.rows ?? [];
    return sawUnmountsQuery.data ?? [];
  }, [mode, bladeQuery.data, sawUnmountsQuery.data]);

  const headerText =
    mode === "BLADE"
      ? bladeQuery.data?.blade
        ? `Demonteringer for blad: ${bladeQuery.data.blade.IdNummer}`
        : "Søk demonteringer på blad"
      : "Søk demonteringer på maskin";

  const recentQuery = api.bladeInstall.recent.useQuery({ take: 15 });

  return (
    <div className="container">
      <style>{`
        .container { margin: 0 40rem; }
      `}</style>

      <EtterregistreringList
        rows={recentQuery.data ?? []}
        isFetching={recentQuery.isFetching}
      />

      <SearchDriftHistorikk
        mode={mode}
        setMode={setMode}
        idNummer={idNummer}
        setIdNummer={setIdNummer}
        sawId={sawId}
        setSawId={setSawId}
        saws={sawsQuery.data ?? []}
        sawsLoading={sawsQuery.isLoading}
        sawUnmountsQuery={sawUnmountsQuery}
        isFetching={isFetching}
        rows={rows}
        headerText={headerText}
        bladeQuery={bladeQuery}
      />
    </div>
  );
};

export default Page;
