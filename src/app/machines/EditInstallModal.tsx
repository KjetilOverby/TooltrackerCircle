"use client";

import React, { useState, useEffect } from "react";
import REASONS from "../../appdata/changereasons";
import { type RouterOutputs } from "~/trpc/react";

// Henter nøyaktig type fra tRPC routeren
type RecentInstall = RouterOutputs["bladeInstall"]["recent"][number];

interface EditPayload {
  id: string;
  installedAt: Date;
  removedAt: Date | null;
  removedReason: string | null;
  removedNote: string | null;
}

interface EditInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RecentInstall | null;
  onSave: (payload: EditPayload) => void;
  isSaving: boolean;
}

const EditInstallModal: React.FC<EditInstallModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  isSaving,
}) => {
  const [installedAt, setInstalledAt] = useState("");
  const [removedAt, setRemovedAt] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (data && isOpen) {
      // Hjelpefunksjon for å formatere Date til datetime-local format (YYYY-MM-DDTHH:MM)
      const toDTLocal = (d: Date | string | null) => {
        if (!d) return "";
        const date = new Date(d);
        // Justerer for lokal tidssone slik at klokka ikke blir feil i input-feltet
        const offset = date.getTimezoneOffset() * 60000;
        const localISOTime = new Date(date.getTime() - offset)
          .toISOString()
          .slice(0, 16);
        return localISOTime;
      };

      setInstalledAt(toDTLocal(data.installedAt));
      setRemovedAt(toDTLocal(data.removedAt));
      setReason(data.removedReason ?? "");
      setNote(data.removedNote ?? "");
    }
  }, [data, isOpen]);

  if (!isOpen || !data) return null;

  const handleSubmit = () => {
    onSave({
      id: data.id,
      installedAt: new Date(installedAt),
      removedAt: removedAt ? new Date(removedAt) : null,
      removedReason: reason || null,
      removedNote: note || null,
    });
  };

  return (
    <>
      <div
        className="overlay"
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="modal" role="dialog">
          <div className="modalHeader">
            <div className="headerLeft">
              <div className="modalTitle">Rediger loggføring</div>
              <div className="modalSub">
                Blad: <b>{data.blade.IdNummer}</b> på <b>{data.saw.name}</b>
              </div>
            </div>
            <button className="iconBtn" onClick={onClose} type="button">
              ✕
            </button>
          </div>

          <div className="modalBody">
            <div className="dateGrid">
              <div className="field">
                <label className="label">Montert tidspunkt</label>
                <input
                  type="datetime-local"
                  className="inputField"
                  value={installedAt}
                  onChange={(e) => setInstalledAt(e.target.value)}
                />
              </div>
              <div className="field">
                <label className="label">Demontert tidspunkt</label>
                <input
                  type="datetime-local"
                  className="inputField"
                  value={removedAt}
                  onChange={(e) => setRemovedAt(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Årsak</label>
              <select
                className="select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="" disabled>
                  Velg årsak...
                </option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="label">Notat</label>
              <textarea
                className="textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Legg til kommentar..."
              />
            </div>
          </div>

          <div className="footer">
            <div className="hint">
              Endringer her påvirker historisk statistikk for dette bladet.
            </div>
            <div className="actions">
              <button
                className="ghost"
                onClick={onClose}
                disabled={isSaving}
                type="button"
              >
                Avbryt
              </button>
              <button
                className="primary"
                onClick={handleSubmit}
                disabled={isSaving || !installedAt}
                type="button"
              >
                {isSaving ? "Lagrer..." : "Lagre endringer"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .overlay {
          position: fixed;
          inset: 0;
          display: grid;
          place-items: center;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          z-index: 100;
        }
        .modal {
          width: min(600px, 95vw);
          background: white;
          border-radius: 18px;
          overflow: hidden;
          color: #0f172a;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
        }
        .modalHeader {
          padding: 20px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modalTitle { font-size: 18px; font-weight: 700; }
        .modalSub { font-size: 13px; color: #64748b; margin-top: 2px; }
        .modalBody { padding: 20px; display: grid; gap: 16px; }
        .dateGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 480px) { .dateGrid { grid-template-columns: 1fr; } }
        .label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: #475569; }
        .inputField, .select, .textarea {
          width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #cbd5e1;
          font-size: 14px; outline: none; background: #fff;
        }
        .inputField:focus, .select:focus, .textarea:focus { border-color: #3b82f6; ring: 2px solid #3b82f6; }
        .textarea { min-height: 80px; resize: vertical; }
        .footer { padding: 16px 20px; background: #f8fafc; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; }
        .actions { display: flex; gap: 10px; }
        .hint { font-size: 11px; color: #94a3b8; max-width: 220px; line-height: 1.4; }
        .primary { background: #2563eb; color: white; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .primary:hover { background: #1d4ed8; }
        .primary:disabled { background: #94a3b8; cursor: not-allowed; }
        .ghost { background: white; border: 1px solid #cbd5e1; padding: 10px 18px; border-radius: 10px; cursor: pointer; color: #475569; }
        .ghost:hover { background: #f1f5f9; }
        .iconBtn { background: none; border: none; cursor: pointer; font-size: 18px; color: #94a3b8; padding: 4px; }
        .iconBtn:hover { color: #475569; }
      `}</style>
    </>
  );
};

export default EditInstallModal;
