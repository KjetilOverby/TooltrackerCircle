"use client";

import React from "react";
import { api } from "~/trpc/react";
import UnmountList from "./UnmountList";
import UninstallModal from "./UninstallModal";
import InstallModal from "../create/InstallModal";
import MachineList from "./MachineList";
import ChangeBladeModal from "./ChangeBladeModal";

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
  // ✅ Inkluder aktiv install + blad.IdNummer
  const sawsQuery = api.settings.saw.listForMachines.useQuery();
  const saws = (sawsQuery.data ?? []).map((s) => ({
    ...s,
    sawType: s.sawType ?? undefined,
  })) as SawForMachines[];

  const recentQuery = api.bladeInstall.recent.useQuery({ take: 15 });

  // -----------------------------
  // Install modal (Monter)
  // -----------------------------
  const [installOpen, setInstallOpen] = React.useState(false);
  const [installSaw, setInstallSaw] = React.useState<SawForMachines | null>(
    null,
  );
  const [search, setSearch] = React.useState("");
  const [selectedBlade, setSelectedBlade] = React.useState<Blade | null>(null);

  const [bladeSearch, setBladeSearch] = React.useState("");

  const bladesForInstallQuery = api.sawBlade.list.useQuery(
    { q: search },
    { enabled: installOpen },
  );
  const bladesForInstall = (bladesForInstallQuery.data ?? []) as Blade[];

  const installMutation = api.bladeInstall.install.useMutation({
    onSuccess: () => {
      setInstallOpen(false);
      setInstallSaw(null);
      setSelectedBlade(null);
      setSearch("");
      void sawsQuery.refetch();
      void recentQuery.refetch();
    },
  });

  function openMountModal(saw: SawForMachines) {
    setInstallSaw(saw);
    setSelectedBlade(null);
    setSearch("");
    setInstallOpen(true);
    void recentQuery.refetch();
  }

  // -----------------------------
  // Uninstall modal (Demonter)
  // -----------------------------
  const [uninstallOpen, setUninstallOpen] = React.useState(false);
  const [uninstallSaw, setUninstallSaw] = React.useState<SawForMachines | null>(
    null,
  );

  const [removedReason, setRemovedReason] = React.useState<string>("Sløvt");
  const [removedNote, setRemovedNote] = React.useState<string>("");

  const uninstallMutation = api.bladeInstall.uninstall.useMutation({
    onSuccess: () => {
      setUninstallOpen(false);
      setUninstallSaw(null);
      void sawsQuery.refetch();
      void recentQuery.refetch();
    },
  });

  function openUninstallModal(saw: SawForMachines) {
    setUninstallSaw(saw);
    setRemovedReason("Sløvt");
    setRemovedNote("");
    setUninstallOpen(true);
  }

  // -----------------------------
  // Change blade modal (Bytt blad)
  // -----------------------------
  const [changeOpen, setChangeOpen] = React.useState(false);
  const [changeSaw, setChangeSaw] = React.useState<SawForMachines | null>(null);
  const [newBladeId, setNewBladeId] = React.useState<string>("");

  // Du kan bruke samme removedReason/removedNote her (det er jo årsak/notat for bladet som tas ut)
  // Derfor resetter vi dem når vi åpner bytt-blad også.

  // Hvis du vil ha egen søkestreng for bytt-blad, kan du lage changeSearch.
  // Her holder vi det enkelt og henter “alle” med q:"" (tilpass på backend om nødvendig).
  const bladesForChangeQuery = api.sawBlade.list.useQuery(
    { q: bladeSearch },
    { enabled: changeOpen },
  );
  const bladeOptions = (bladesForChangeQuery.data ?? []) as Blade[];

  // ⚠️ Denne forutsetter at du har laget en swap-mutation i tRPC:
  // api.bladeInstall.swap.useMutation(...)
  const swapMutation = api.bladeInstall.swap.useMutation({
    onSuccess: () => {
      setChangeSaw(null);
      setChangeOpen(false);
      setNewBladeId("");
      setRemovedReason("Sløvt");
      setRemovedNote("");
      void sawsQuery.refetch();
      void recentQuery.refetch();
    },
  });

  function openChangeBladeModal(saw: SawForMachines) {
    setChangeSaw(saw);
    setNewBladeId("");
    setBladeSearch("");
    setRemovedReason("Sløvt");
    setRemovedNote("");
    setChangeOpen(true);
    void recentQuery.refetch();
  }

  // Antar at installs[0] er den aktive installen (slik du skrev “ny query som inkluderer aktiv install”)
  const currentBlade =
    changeSaw?.installs?.[0]?.blade && changeSaw.installs[0].blade
      ? {
          id: changeSaw.installs[0].blade.id,
          IdNummer: changeSaw.installs[0].blade.IdNummer,
        }
      : null;

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
          openChangeBladeModal={openChangeBladeModal} // ✅ ny
        />

        {/* Monter */}
        <InstallModal
          open={installOpen}
          setOpen={setInstallOpen}
          selectedSaw={installSaw}
          search={search}
          setSearch={setSearch}
          bladesQuery={bladesForInstallQuery}
          blades={bladesForInstall}
          selectedBlade={selectedBlade}
          setSelectedBlade={setSelectedBlade}
          installMutation={installMutation}
        />

        {/* Demontering */}
        <UninstallModal
          uninstallOpen={uninstallOpen}
          uninstallSaw={uninstallSaw}
          setUninstallOpen={setUninstallOpen}
          removedReason={removedReason}
          setRemovedReason={setRemovedReason}
          removedNote={removedNote}
          setRemovedNote={setRemovedNote}
          uninstallMutation={uninstallMutation}
        />

        {/* Siste demonteringer */}
        <UnmountList
          rows={recentQuery.data ?? []}
          isFetching={recentQuery.isFetching}
        />

        {/* Bytt blad (uninstall + install i én modal) */}
        <ChangeBladeModal
          bladeSearch={bladeSearch}
          setBladeSearch={setBladeSearch}
          open={changeOpen}
          setOpen={setChangeOpen}
          saw={changeSaw}
          currentBlade={currentBlade}
          bladeOptions={bladeOptions.map((b) => ({
            id: b.id,
            IdNummer: b.IdNummer,
            bladeTypeName: b.bladeType?.name ?? null,
          }))}
          isLoadingBlades={bladesForChangeQuery.isLoading}
          newBladeId={newBladeId}
          setNewBladeId={setNewBladeId}
          removedReason={removedReason}
          setRemovedReason={setRemovedReason}
          removedNote={removedNote}
          setRemovedNote={setRemovedNote}
          swapMutation={swapMutation}
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

        .container {
          max-width: 1180px;
          margin: 0 auto;
          padding: clamp(16px, 4vw, 32px);
        }

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
