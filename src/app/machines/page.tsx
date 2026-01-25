"use client";

import React from "react";
import { api } from "~/trpc/react";
import UnmountList from "./UnmountList";
import UninstallModal from "./UninstallModal";
import InstallModal from "../create/InstallModal";
import MachineList from "./MachineList";

type SawForMachines = {
  id: string;
  name: string;
  sawType?: string | null;
  active?: boolean;
  installs?: Array<{
    id: string;
    installedAt: Date;
    blade: { id: string; IdNummer: string } | null;
  }>;
};

type Blade = {
  id: string;
  IdNummer: string;
  bladeType?: { name: string } | null;
};

export default function MaskinerPage() {
  // ✅ Bruk den nye queryen som inkluderer aktiv install + blad.IdNummer
  const sawsQuery = api.settings.saw.listForMachines.useQuery();
  const saws = (sawsQuery.data ?? []).map((s) => ({
    ...s,
    sawType: s.sawType ?? undefined, // gjør null til undefined
  }));

  // --- Modal state ---
  const [open, setOpen] = React.useState(false);
  const [selectedSaw, setSelectedSaw] = React.useState<SawForMachines | null>(
    null,
  );

  const [search, setSearch] = React.useState("");
  const [selectedBlade, setSelectedBlade] = React.useState<Blade | null>(null);

  const [uninstallOpen, setUninstallOpen] = React.useState(false);
  const [uninstallSaw, setUninstallSaw] = React.useState<SawForMachines | null>(
    null,
  );

  const [removedReason, setRemovedReason] = React.useState<string>("Sløvt");
  const [removedNote, setRemovedNote] = React.useState<string>("");

  // Blade-søk
  const bladesQuery = api.sawBlade.list.useQuery(
    { q: search },
    { enabled: open },
  );
  const blades = (bladesQuery.data ?? []) as Blade[];

  const recentQuery = api.bladeInstall.recent.useQuery({ take: 15 });

  // Monter-mutasjonen
  const installMutation = api.bladeInstall.install.useMutation({
    onSuccess: () => {
      setOpen(false);
      setSelectedSaw(null);
      setSelectedBlade(null);
      setSearch("");
      void sawsQuery.refetch();
      void recentQuery.refetch();
    },
  });

  const uninstallMutation = api.bladeInstall.uninstall.useMutation({
    onSuccess: () => {
      setUninstallOpen(false);
      setUninstallSaw(null);
      void sawsQuery.refetch();
      void recentQuery.refetch();
    },
  });

  function openMountModal(saw: SawForMachines) {
    setSelectedSaw(saw);
    setSelectedBlade(null);
    setSearch("");
    setOpen(true);
    void recentQuery.refetch();
  }

  function openUninstallModal(saw: SawForMachines) {
    setUninstallSaw(saw);
    setRemovedReason("Sløvt");
    setRemovedNote("");
    setUninstallOpen(true);
  }

  return (
    <div className="page">
      <div className="container">
        <h1>Maskiner</h1>
        <p className="subtitle">Klikk Monter for å velge blad fra databasen.</p>

        {sawsQuery.isLoading && <p>Laster…</p>}
        {sawsQuery.isError && <p>Feil: {sawsQuery.error.message}</p>}

        <MachineList
          saws={saws}
          openMountModal={openMountModal}
          openUninstallModal={openUninstallModal}
        />

        <InstallModal
          open={open}
          setOpen={setOpen}
          selectedSaw={selectedSaw}
          search={search}
          setSearch={setSearch}
          bladesQuery={bladesQuery}
          blades={blades}
          selectedBlade={selectedBlade}
          setSelectedBlade={setSelectedBlade}
          installMutation={installMutation}
        />

        <UninstallModal
          uninstallOpen={uninstallOpen}
          uninstallSaw={uninstallSaw}
          setUninstallOpen={setUninstallOpen}
          removedReason={removedReason}
          setRemovedReason={setRemovedReason}
          removedNote={removedNote}
          uninstallMutation={uninstallMutation}
          setRemovedNote={setRemovedNote}
        />

        <UnmountList
          rows={recentQuery.data ?? []}
          isFetching={recentQuery.isFetching}
        />
      </div>
      <style jsx>{`
        .page {
          min-height: 100vh;
          background:
            radial-gradient(
              1200px 420px at 20% -10%,
              #e9eef5 0%,
              transparent 60%
            ),
            radial-gradient(
              1000px 420px at 100% 0%,
              #eef2f7 0%,
              transparent 55%
            ),
            #f6f7f9;
        }

        /* 🔥 Denne er nøkkelen */
        .container {
          max-width: 1180px; /* Ikke for bred */
          margin: 0 auto;
          padding: clamp(16px, 4vw, 32px);
        }

        /* Overskrift spacing */
        .container h1 {
          margin-bottom: 6px;
        }

        .subtitle {
          margin-bottom: 22px;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
