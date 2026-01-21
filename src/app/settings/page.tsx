"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import BladeTypeInputComponent from "../settings/BladeTypeInputComponent";

export default function Page() {
  const utils = api.useUtils();

  const bladeTypesQuery = api.settings.bladeType.list.useQuery();

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    createBladeType.mutate({
      name,
      note: note.length ? note : null,
    });
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
        Innstillinger
      </h1>

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
      />
    </div>
  );
}
