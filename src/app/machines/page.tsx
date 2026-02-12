"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import UnmountList from "./UnmountList";
import UninstallModal from "./UninstallModal";
import InstallModal from "../create/InstallModal";
import MachineList from "./MachineList";
import ChangeBladeModal from "./ChangeBladeModal";
import MoveBladeModal from "./MoveBladeModal";
import EditInstallModal from "./EditInstallModal";

import { type RouterOutputs } from "~/trpc/react";
import ConfirmDeleteModal from "../_components/common/ConfirmDeleteModal";

type RecentInstall = RouterOutputs["bladeInstall"]["recent"][number];

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
  const sawsQuery = api.settings.saw.listForMachines.useQuery();
  const utils = api.useUtils();

  const saws = (sawsQuery.data ?? []).map((s) => ({
    ...s,
    sawType: s.sawType ?? undefined,
  })) as unknown as SawForMachines[]; // Legg til 'unknown as' her

  const recentQuery = api.bladeInstall.recent.useQuery({ take: 15 });

  // -----------------------------
  // EDIT INSTALL (Rediger loggføring)
  // -----------------------------

  const updateMutation = api.bladeInstall.update.useMutation({
    onSuccess: () => {
      setEditingRow(null);
      void recentQuery.refetch(); // Oppdaterer listen
    },
  });

  // -----------------------------
  // Install modal (Monter)
  // -----------------------------
  const [installOpen, setInstallOpen] = useState(false);
  const [installSaw, setInstallSaw] = useState<SawForMachines | null>(null);
  const [search, setSearch] = useState("");
  const [selectedBlade, setSelectedBlade] = useState<Blade | null>(null);

  const [rowToDelete, setRowToDelete] = useState<RecentInstall | null>(null);

  const [bladeSearch, setBladeSearch] = useState("");

  const bladesForInstallQuery = api.sawBlade.list.useQuery(
    { q: search },
    { enabled: installOpen },
  );
  const bladesForInstall = (bladesForInstallQuery.data ?? []) as Blade[];

  const [editingRow, setEditingRow] = useState<RecentInstall | null>(null);

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

  const [removedReason, setRemovedReason] = React.useState<string>("");
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
    setRemovedReason("");
    setRemovedNote("");
    setUninstallOpen(true);
  }

  // -----------------------------
  // Change blade modal (Bytt blad)
  // -----------------------------
  const [changeOpen, setChangeOpen] = React.useState(false);
  const [changeSaw, setChangeSaw] = React.useState<SawForMachines | null>(null);
  const [newBladeId, setNewBladeId] = React.useState<string>("");

  const bladesForChangeQuery = api.sawBlade.list.useQuery(
    { q: bladeSearch },
    { enabled: changeOpen },
  );
  const bladeOptions = (bladesForChangeQuery.data ?? []) as Blade[];

  const swapMutation = api.bladeInstall.swap.useMutation({
    onSuccess: () => {
      setChangeSaw(null);
      setChangeOpen(false);
      setNewBladeId("");
      setRemovedReason("");
      setRemovedNote("");
      void sawsQuery.refetch();
      void recentQuery.refetch();
    },
  });

  function openChangeBladeModal(saw: SawForMachines) {
    setChangeSaw(saw);
    setNewBladeId("");
    setBladeSearch("");
    setRemovedReason("");
    setRemovedNote("");
    setChangeOpen(true);
    void recentQuery.refetch();
  }

  const currentBlade = changeSaw?.installs?.[0]?.blade
    ? {
        id: changeSaw.installs[0].blade.id,
        IdNummer: changeSaw.installs[0].blade.IdNummer,
      }
    : null;

  // ============================================================
  // ✅ NY: Flytt blad modal (Move)
  // ============================================================
  const [moveOpen, setMoveOpen] = React.useState(false);
  const [moveBlade, setMoveBlade] = React.useState<Blade | null>(null);
  const [moveFromSaw, setMoveFromSaw] = React.useState<SawForMachines | null>(
    null,
  );

  const [moveSawSearch, setMoveSawSearch] = React.useState("");
  const [moveToSawId, setMoveToSawId] = React.useState("");
  const [moveReplaceReason, setMoveReplaceReason] = React.useState<string>("");
  const [moveReplaceNote, setMoveReplaceNote] = React.useState<string>("");

  // Hent aktivt blad i valgt målsag (kun når modal er åpen + toSaw valgt)
  const moveDestQuery = api.bladeInstall.currentOnSaw.useQuery(
    { sawId: moveToSawId },
    { enabled: moveOpen && !!moveToSawId },
  );

  const destBladeIdNummer =
    moveDestQuery.data?.current?.blade?.IdNummer ?? null;
  const destHasBlade = !!destBladeIdNummer;

  const moveMutation = api.bladeInstall.install.useMutation({
    onSuccess: async () => {
      console.log("Mutation success - starter invaliderting..."); // Flytt denne opp hit!

      // Nullstill statene først
      setMoveOpen(false);
      setMoveBlade(null);
      // ... resten av settene dine

      // Vent på at invalidertingen er FERDIG før du går videre
      try {
        await utils.bladeInstall.currentOnSaw.invalidate();
        await utils.bladeInstall.recent.invalidate();
        await utils.settings.saw.listForMachines.invalidate();

        console.log("Alt er markert som stale");

        // I stedet for refetch(), prøv å invalidate selve hoved-queryen til saws
        await utils.bladeInstall.invalidate(); // Invaliderer alt under dette navnerommet
      } catch (e) {
        console.error("Feil under invaliderting:", e);
      }
    },
  });

  function openMoveBladeModal(saw: SawForMachines) {
    const b = saw.installs?.[0]?.blade ?? null;

    if (!b?.id) {
      console.warn("openMoveBladeModal: ingen aktivt blad på sagen", saw);
      return;
    }

    setMoveFromSaw(saw);
    setMoveBlade({ id: b.id, IdNummer: b.IdNummer }); // ✅ viktig: id må med

    setMoveSawSearch("");
    setMoveToSawId("");
    setMoveReplaceReason("");
    setMoveReplaceNote("");
    setMoveOpen(true);
  }

  async function submitMove() {
    if (!moveBlade?.id) return;
    if (!moveToSawId) return;

    await moveMutation.mutateAsync({
      sawId: moveToSawId,
      bladeId: moveBlade.id,
      replaceReason: destHasBlade ? moveReplaceReason || undefined : undefined,
      replaceNote: destHasBlade ? moveReplaceNote || undefined : undefined,
    });
  }

  const deleteMutation = api.bladeInstall.delete.useMutation({
    onSuccess: () => {
      // Valgfritt: Vis en liten toast eller melding
      void recentQuery.refetch(); // Oppdaterer listen så raden forsvinner
      void sawsQuery.refetch(); // Oppdaterer sag-status i tilfelle det var et aktivt blad
    },
    onError: (err) => {
      alert("Feil ved sletting: " + err.message);
    },
  });

  return (
    <div className="page">
      <div className="container">
        <h1>Maskiner</h1>

        {sawsQuery.isLoading && <p>Laster…</p>}
        {sawsQuery.isError && <p>Feil: {sawsQuery.error.message}</p>}

        <MachineList
          saws={saws}
          openMountModal={openMountModal}
          openUninstallModal={openUninstallModal}
          openChangeBladeModal={openChangeBladeModal}
          openMoveBladeModal={openMoveBladeModal}
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
          rows={(recentQuery.data as unknown as any[]) ?? []}
          isFetching={recentQuery.isFetching}
          onEdit={(row) => setEditingRow(row)}
          onDelete={(row) => setRowToDelete(row)}
        />

        {/* Bytt blad */}
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

        <MoveBladeModal
          open={moveOpen}
          setOpen={setMoveOpen}
          blade={
            moveBlade
              ? { id: moveBlade.id, IdNummer: moveBlade.IdNummer }
              : null
          }
          fromSaw={
            moveFromSaw ? { id: moveFromSaw.id, name: moveFromSaw.name } : null
          }
          saws={saws.map((s) => ({ id: s.id, name: s.name }))}
        />

        <EditInstallModal
          isOpen={!!editingRow}
          data={editingRow}
          onClose={() => setEditingRow(null)}
          isSaving={updateMutation.isPending}
          onSave={(payload) => {
            updateMutation.mutate(payload);
          }}
        />
        <ConfirmDeleteModal
          isOpen={!!rowToDelete}
          onClose={() => setRowToDelete(null)}
          onConfirm={() => {
            if (rowToDelete) {
              deleteMutation.mutate({ id: rowToDelete.id });
              setRowToDelete(null);
            }
          }}
          title="Slett loggføring"
          message={`Er du sikker på at du vil slette loggen for ${rowToDelete?.blade.IdNummer} på ${rowToDelete?.saw.name}?`}
          // HER skjer magien: Vi sender bare dangerMessage hvis det finnes runLog!
          dangerMessage={
            rowToDelete?.runLog
              ? "Denne posten inneholder driftsdata (sagtid/stokk). Sletting vil fjerne denne statistikken permanent!"
              : undefined
          }
          isDeleting={deleteMutation.isPending}
        />
      </div>

      <style>{`
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
