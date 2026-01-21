import React from "react";
import BladeListComponent from "./ListComponent";

type BladeType = {
  id: string;
  name: string;
  note: string | null;
  createdAt: Date | string;
};

type Props = {
  // form
  name: string;
  onNameChange: (value: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;

  // state
  errorMsg: string | null;
  isSaving: boolean;

  // list
  isLoading: boolean;
  bladeTypes: BladeType[];
  header: string;
  icon: React.ReactNode;
  subheader: string;
};

export default function BladeTypeInputComponent({
  name,
  onNameChange,
  note,
  onNoteChange,
  onSubmit,
  errorMsg,
  isSaving,
  isLoading,
  bladeTypes,
  header,
  icon,
  subheader,
}: Props) {
  return (
    <div
      style={{ marginBottom: "5rem" }}
      className="mx-auto grid max-w-[720px] gap-6 p-4"
    >
      <h1 className="text-2xl font-bold text-gray-900">{header}</h1>

      {/* Legg inn bladtype */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          {subheader}
        </h2>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Navn på sagblad
            </label>
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="F.eks. 445/150-4.0/2.6-z36 MKV"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Notat (valgfritt)
            </label>
            <textarea
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={3}
              placeholder="Valgfritt notat..."
              className="resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="mt-2 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Lagrer…" : "Lagre bladtype"}
          </button>
        </form>
      </div>

      <BladeListComponent
        isLoading={isLoading}
        bladeTypes={bladeTypes}
        icon={icon}
        header="Ingen bladtyper er lagt inn enda."
      />
    </div>
  );
}
