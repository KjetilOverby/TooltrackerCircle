"use client";

import React, { useState } from "react";
import CreateInputComponent from "./CreateInputComponent";
import { api } from "~/trpc/react";
import CreatedSawbladeList from "./CreatedSawbaldeList";

const Page = () => {
  const utils = api.useUtils();

  // dropdown-data
  const bladeTypesQuery = api.settings.bladeType.list.useQuery();
  const sawsQuery = api.settings.saw.list.useQuery(); // eller sawType/list – avhenger av din modell
  const sawbladeQuery = api.sawBlade.list.useQuery();

  // form state
  const [form, setForm] = useState({
    bladeTypeId: "",
    bladeNumber: "",
    note: "",
    produsent: "",
    sawId: "" as string,
    side: "",
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const createSawBlade = api.sawBlade.create.useMutation({
    onSuccess: async () => {
      // invalider der du har liste over blader
      await utils.sawBlade.list.invalidate(); // hvis du har list-query
      setErrorMsg(null);
      setForm({
        bladeTypeId: "",
        bladeNumber: "",
        note: "",
        produsent: "",
        sawId: "",
        side: "",
      });
    },
    onError: (err) => {
      setErrorMsg(err.message ?? "Kunne ikke lagre sagblad.");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    createSawBlade.mutate({
      IdNummer: form.bladeNumber,
      bladeTypeId: form.bladeTypeId,
      produsent: form.produsent.length ? form.produsent : null,
      note: form.note.length ? form.note : null,
      side: form.side.length ? form.side : null,
    });
  };

  return (
    <div style={{ padding: "5rem" }}>
      <CreateInputComponent
        form={form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        bladeTypes={bladeTypesQuery.data ?? []}
        saws={sawsQuery.data ?? []}
        isLoading={createSawBlade.isPending}
      />

      <CreatedSawbladeList sawBlades={sawbladeQuery.data ?? []} />
    </div>
  );
};

export default Page;
