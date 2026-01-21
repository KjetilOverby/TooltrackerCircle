import React from "react";

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
}: Props) {
  return (
    <div style={{ maxWidth: 720, padding: 16, display: "grid", gap: 18 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Bladtyper</h1>

      <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
          Legg inn bladtype
        </h2>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600 }}>Navn</label>
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="F.eks. 75x1.1 22TPI"
              style={{
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600 }}>Notat (valgfritt)</label>
            <textarea
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={3}
              placeholder="Valgfritt notat..."
              style={{
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 8,
                resize: "vertical",
              }}
            />
          </div>

          {errorMsg && (
            <div
              style={{
                padding: 10,
                borderRadius: 8,
                background: "#fff5f5",
                border: "1px solid #ffd1d1",
                color: "#b00020",
                fontSize: 14,
              }}
            >
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            style={{
              padding: 12,
              borderRadius: 10,
              border: "none",
              cursor: isSaving ? "not-allowed" : "pointer",
              fontWeight: 700,
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? "Lagrer…" : "Lagre bladtype"}
          </button>
        </form>
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
          Eksisterende bladtyper
        </h2>

        {isLoading ? (
          <div>Laster…</div>
        ) : bladeTypes.length === 0 ? (
          <div style={{ color: "#666" }}>Ingen bladtyper enda.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {bladeTypes.map((bt) => (
              <div
                key={bt.id}
                style={{
                  border: "1px solid #f0f0f0",
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <div style={{ fontWeight: 700 }}>{bt.name}</div>

                {bt.note ? (
                  <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                    {bt.note}
                  </div>
                ) : null}

                <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
                  Opprettet: {new Date(bt.createdAt).toLocaleString("no-NB")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
