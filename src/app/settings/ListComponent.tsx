import React from "react";

interface ListComponentProps {
  isLoading: boolean;
  bladeTypes: {
    id: string;
    name: string;
    note?: string | null;
    createdAt: Date | string;
  }[];
}

const ListComponent: React.FC<ListComponentProps> = ({
  isLoading,
  bladeTypes,
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">
        Eksisterende bladtyper
      </h2>

      {isLoading ? (
        <div className="text-sm text-gray-500">Laster…</div>
      ) : bladeTypes.length === 0 ? (
        <div className="text-sm text-gray-500">Ingen bladtyper enda.</div>
      ) : (
        <div className="grid gap-2">
          {bladeTypes.map((bt) => (
            <div
              key={bt.id}
              className="rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50"
            >
              <div className="font-semibold text-gray-900">{bt.name}</div>

              {bt.note && (
                <div className="mt-1 text-sm text-gray-600">{bt.note}</div>
              )}

              <div className="mt-2 text-xs text-gray-400">
                Opprettet: {new Date(bt.createdAt).toLocaleString("no-NB")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListComponent;
