"use client";

import React, { useMemo, useState } from "react";
import EtterregistreringList from "./Etterregistrering";
import SearchDriftHistorikk, { type Mode } from "./SearchDriftHistorikk";
import { api } from "~/trpc/react";
import BladeRunLogModal from "./BladeRunLogModal";

const Page = () => {
  const [mode, setMode] = useState<Mode>("BLADE");
  const [idNummer, setIdNummer] = useState("");

  const [runLogOpen, setRunLogOpen] = useState(false);

  const recentQuery = api.bladeInstall.recent.useQuery({ take: 15 });

  type RecentRow = NonNullable<typeof recentQuery.data>[number];

  const [selectedInstall, setSelectedInstall] = useState<RecentRow | null>(
    null,
  );

  const openRunLogModal = (row: RecentRow) => {
    setSelectedInstall(row);
    setRunLogOpen(true);
  };

  const createRunLog = api.bladeRunLog.create.useMutation();

  const bladeQuery = api.bladeInstall.bladeUnmountsByIdNummer.useQuery(
    { idNummer: idNummer.trim(), take: 50 },
    { enabled: false },
  );

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

  return (
    <div className="container">
      <style>{`
        .container {
          max-width: 1200px; /* eller 1100 / 1000 – smak og behag */
          margin: 0 auto;
          padding: 0 1rem; /* luft på mobil */
        }

        @media (min-width: 768px) {
          .container {
            padding: 0 1rem 10rem 0;
          }
        }
      `}</style>

      <EtterregistreringList
        rows={recentQuery.data ?? []}
        isFetching={recentQuery.isFetching}
        onRunLog={openRunLogModal}
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

      {runLogOpen && selectedInstall && (
        <BladeRunLogModal
          open={runLogOpen}
          installId={selectedInstall.id}
          sawName={selectedInstall.saw.name}
          bladeIdNummer={selectedInstall.blade.IdNummer}
          isSaving={createRunLog.isPending}
          error={createRunLog.error?.message ?? null}
          onClose={() => setRunLogOpen(false)}
          onSave={async (input) => {
            await createRunLog.mutateAsync(input);
            await recentQuery.refetch();
          }}
        />
      )}
    </div>
  );
};

export default Page;
