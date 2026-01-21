"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import BladeTypeInputComponent from "../settings/BladeTypeInputComponent";
import { BsMotherboardFill } from "react-icons/bs";

import { GiCircularSawblade } from "react-icons/gi";

export default function Page() {
  const utils = api.useUtils();

  const bladeTypesQuery = api.settings.bladeType.list.useQuery();
  const sawTypesQuery = api.settings.saw.list.useQuery();

  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createBladeType = api.settings.bladeType.create.useMutation({
    onSuccess: async () => {
      await utils.settings.bladeType.list.invalidate();
      setName("");
      setNote("");
      setErrorMsg(null);
    },
    onError: (err) => {
      setErrorMsg(err.message ?? "Kunne ikke lagre bladtype.");
    },
  });

  const createSawType = api.settings.saw.create.useMutation({
    onSuccess: async () => {
      await utils.settings.saw.list.invalidate();
      setName("");
      setNote("");
      setErrorMsg(null);
    },
    onError: (err) => {
      setErrorMsg(err.message ?? "Kunne ikke lagre sagtype.");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    createBladeType.mutate({
      name,
      note: note.length ? note : null,
    });
  };

  const handleSubmitSaw = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    createSawType.mutate({
      name,
      note: note.length ? note : null,
    });
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl text-blue-500">Innstillinger</h1>

      <BladeTypeInputComponent
        name={name}
        onNameChange={setName}
        note={note}
        onNoteChange={setNote}
        onSubmit={handleSubmit}
        errorMsg={errorMsg}
        isSaving={createBladeType.isPending}
        isLoading={bladeTypesQuery.isLoading}
        bladeTypes={bladeTypesQuery.data ?? []}
        header="Sagbladtyper"
        icon={<GiCircularSawblade size={30} color="gray" />}
        subheader="Legg til sagbladtyper"
      />

      <BladeTypeInputComponent
        name={name}
        onNameChange={setName}
        note={note}
        onNoteChange={setNote}
        onSubmit={handleSubmitSaw}
        errorMsg={errorMsg}
        isSaving={createSawType.isPending}
        isLoading={sawTypesQuery.isLoading}
        bladeTypes={sawTypesQuery.data ?? []}
        header="Sagmaskiner"
        icon={<BsMotherboardFill size={30} color="gray" />}
        subheader="Legg til sagmaskiner"
      />
    </div>
  );
}
