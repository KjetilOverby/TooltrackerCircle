"use client";

import React, { useMemo, useState } from "react";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import BladeTypeInputComponent from "./BladeTypeInputComponent";
import { BsMotherboardFill } from "react-icons/bs";
import { GiCircularSawblade } from "react-icons/gi";

type BladeTypeRow = RouterOutputs["settings"]["bladeType"]["list"][number];
type SawRow = RouterOutputs["settings"]["saw"]["list"][number];

export default function Page() {
  const utils = api.useUtils();

  const bladeTypesQuery = api.settings.bladeType.list.useQuery();
  const sawTypesQuery = api.settings.saw.list.useQuery();

  // ✅ Normaliser data til det UI-et trenger (slipper rare type-konflikter)
  const bladeItems: BladeTypeRow[] = useMemo(
    () => bladeTypesQuery.data ?? [],
    [bladeTypesQuery.data],
  );

  const sawItems: SawRow[] = useMemo(
    () => sawTypesQuery.data ?? [],
    [sawTypesQuery.data],
  );

  // -------------------------
  // BLADETYPE (edit + create)
  // -------------------------
  const [btMode, setBtMode] = useState<"create" | "edit">("create");
  const [editingBladeType, setEditingBladeType] = useState<BladeTypeRow | null>(
    null,
  );

  const [btName, setBtName] = useState("");
  const [btNote, setBtNote] = useState("");
  const [btHasSide, setBtHasSide] = useState(false);
  const [btArtikkel, setBtArtikkel] = useState("");
  const [btLager, setBtLager] = useState<number | null>(null);
  const [btError, setBtError] = useState<string | null>(null);

  const startBladeTypeCreate = () => {
    setBtMode("create");
    setEditingBladeType(null);
    setBtName("");
    setBtNote("");
    setBtHasSide(false);
    setBtArtikkel("");
    setBtLager(null);
    setBtError(null);
  };

  const startBladeTypeEdit = (bt: BladeTypeRow) => {
    setBtMode("edit");
    setEditingBladeType(bt);
    setBtName(bt.name ?? "");
    setBtNote(bt.note ?? "");
    setBtHasSide(Boolean(bt.hasSide));
    setBtArtikkel(bt.artikkel ?? "");
    setBtLager(bt.lagerBeholdning ?? null);
    setBtError(null);
  };

  const createBladeType = api.settings.bladeType.create.useMutation({
    onSuccess: async () => {
      await utils.settings.bladeType.list.invalidate();
      startBladeTypeCreate();
    },
    onError: (err) => setBtError(err.message ?? "Kunne ikke lagre bladtype."),
  });

  const updateBladeType = api.settings.bladeType.update.useMutation({
    onSuccess: async () => {
      await utils.settings.bladeType.list.invalidate();
      startBladeTypeCreate();
    },
    onError: (err) =>
      setBtError(err.message ?? "Kunne ikke oppdatere bladtype."),
  });

  const onSubmitBladeType = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBtError(null);

    const payload = {
      name: btName,
      note: btNote.length ? btNote : null,
      hasSide: btHasSide,
      artikkel: btArtikkel.length ? btArtikkel : null,
      lagerBeholdning: btLager ?? null,
    };

    if (btMode === "create") {
      createBladeType.mutate(payload);
      return;
    }

    if (!editingBladeType) {
      setBtError("Ingen bladtype valgt for redigering.");
      return;
    }

    updateBladeType.mutate({ id: editingBladeType.id, ...payload });
  };

  // -------------------------
  // SAW (edit + create) - NO SIDE
  // -------------------------
  const [sawMode, setSawMode] = useState<"create" | "edit">("create");
  const [editingSaw, setEditingSaw] = useState<SawRow | null>(null);

  const [sawName, setSawName] = useState("");
  const [sawNote, setSawNote] = useState("");
  const [sawError, setSawError] = useState<string | null>(null);

  const startSawCreate = () => {
    setSawMode("create");
    setEditingSaw(null);
    setSawName("");
    setSawNote("");
    setSawError(null);
  };

  const startSawEdit = (saw: SawRow) => {
    setSawMode("edit");
    setEditingSaw(saw);
    setSawName(saw.name ?? "");
    setSawNote(saw.note ?? "");
    setSawError(null);
  };

  const createSaw = api.settings.saw.create.useMutation({
    onSuccess: async () => {
      await utils.settings.saw.list.invalidate();
      startSawCreate();
    },
    onError: (err) => setSawError(err.message ?? "Kunne ikke lagre sagmaskin."),
  });

  const updateSaw = api.settings.saw.update.useMutation({
    onSuccess: async () => {
      await utils.settings.saw.list.invalidate();
      startSawCreate();
    },
    onError: (err) =>
      setSawError(err.message ?? "Kunne ikke oppdatere sagmaskin."),
  });

  const onSubmitSaw = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSawError(null);

    const payload = {
      name: sawName,
      note: sawNote.length ? sawNote : null,
    };

    if (sawMode === "create") {
      createSaw.mutate(payload);
      return;
    }

    if (!editingSaw) {
      setSawError("Ingen sag valgt for redigering.");
      return;
    }

    updateSaw.mutate({ id: editingSaw.id, ...payload });
  };

  return (
    <div className="page">
      <div className="container">
        {/* ✅ Viktig: angi generics eksplisitt for å unngå TS-krøll */}
        <BladeTypeInputComponent<any> // Bytt ut <BladeTypeRow> med <any>
          mode={btMode}
          editingItem={editingBladeType}
          items={bladeItems}
          isLoading={bladeTypesQuery.isLoading}
          onStartEdit={startBladeTypeEdit}
          onStartCreate={startBladeTypeCreate}
          onSubmit={onSubmitBladeType}
          isSaving={createBladeType.isPending || updateBladeType.isPending}
          errorMsg={btError}
          header="Sagbladtyper"
          subheader="Legg til sagbladtype"
          emptyText="Ingen bladtyper er lagt inn enda."
          icon={<GiCircularSawblade size={30} color="mediumseagreen" />}
          name={btName}
          onNameChange={setBtName}
          note={btNote}
          onNoteChange={setBtNote}
          showHasSide
          hasSide={btHasSide}
          onHasSideChange={setBtHasSide}
          artikkel={btArtikkel}
          onArtikkelChange={setBtArtikkel}
          lagerBeholdning={btLager ?? undefined}
          onLagerBeholdningChange={(v) => setBtLager(v ?? null)}
        />

        <BladeTypeInputComponent<any> // Endre fra <SawRow> til <any> her
          mode={sawMode}
          editingItem={editingSaw}
          items={sawItems}
          isLoading={sawTypesQuery.isLoading} // Denne er riktig!
          onStartEdit={startSawEdit}
          onStartCreate={startSawCreate}
          onSubmit={onSubmitSaw}
          isSaving={createSaw.isPending || updateSaw.isPending}
          errorMsg={sawError}
          header="Sagmaskiner"
          subheader="Legg til sagmaskin"
          emptyText="Ingen sagmaskiner er lagt inn enda."
          icon={<BsMotherboardFill size={30} color="Tomato" />}
          name={sawName}
          onNameChange={setSawName}
          note={sawNote}
          onNoteChange={setSawNote}
          showHasSide={false}
        />
      </div>

      <style jsx>{`
        .page {
          min-height: calc(100vh - 64px);
          padding: 18px 0 46px;
        }
        .container {
          max-width: 1180px;
          margin: 0 auto;
          padding: clamp(14px, 3vw, 26px);
        }
      `}</style>
    </div>
  );
}
