"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";
import REASONS from "../../appdata/changereasons";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  blade: { id: string; IdNummer: string } | null;
  fromSaw: { id: string; name: string } | null;
  saws: { id: string; name: string }[];
};

export default function MoveBladeModal({
  open,
  setOpen,
  blade,
  fromSaw,
  saws,
}: Props) {
  const utils = api.useUtils();
  const [sawSearch, setSawSearch] = useState("");
  const [toSawId, setToSawId] = useState("");
  const [replaceReason, setReplaceReason] = useState("");
  const [replaceNote, setReplaceNote] = useState("");

  const currentOnSawQuery = api.bladeInstall.currentOnSaw.useQuery(
    { sawId: toSawId },
    { enabled: open && !!toSawId },
  );

  const destCurrent = currentOnSawQuery.data?.current ?? null;
  const destHasBlade = !!destCurrent?.blade?.id;

  const installMutation = api.bladeInstall.install.useMutation({
    onSuccess: async () => {
      setOpen(false);
      await utils.bladeInstall.invalidate();
      await utils.bladeInstall.currentOnSaw.invalidate();
      await utils.bladeInstall.recent.invalidate();
      await utils.settings.saw.listForMachines.invalidate();
    },
  });

  const isSubmitting = installMutation.isPending;

  useEffect(() => {
    if (!open) {
      setSawSearch("");
      setToSawId("");
      setReplaceReason("");
      setReplaceNote("");
      installMutation.reset();
    }
  }, [open]);

  const filteredSaws = useMemo(() => {
    const q = sawSearch.trim().toLowerCase();
    const base = fromSaw?.id ? saws.filter((s) => s.id !== fromSaw.id) : saws;
    if (!q) return base;
    return base.filter((s) => s.name.toLowerCase().includes(q));
  }, [saws, sawSearch, fromSaw?.id]);

  const toSaw = useMemo(
    () => saws.find((s) => s.id === toSawId) ?? null,
    [saws, toSawId],
  );

  const canSubmit =
    !!blade?.id &&
    !!toSawId &&
    (!destHasBlade || (destHasBlade && !!replaceReason)) &&
    !isSubmitting;

  async function onMove() {
    if (!blade?.id || !toSawId) return;
    try {
      await installMutation.mutateAsync({
        sawId: toSawId,
        bladeId: blade.id,
        replaceReason: destHasBlade ? replaceReason : undefined,
        replaceNote: destHasBlade ? replaceNote : undefined,
      });
    } catch (e) {
      console.error("Move error", e);
    }
  }

  if (!open) return null;

  return (
    <div
      className="mb-overlay"
      onMouseDown={() => !isSubmitting && setOpen(false)}
    >
      <style>{`
        .mb-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000;
          animation: mbFadeIn 0.2s ease-out;
        }

        .mb-modal {
          width: min(650px, 100%);
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          border: 1px solid #f1f5f9;
          overflow: hidden;
        }

        .mb-header {
          padding: 24px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .mb-title {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .mb-sub-info {
          font-size: 14px;
          color: #64748b;
          margin-top: 6px;
        }

        .mb-strong { color: #3b82f6; font-weight: 700; }

        .mb-closeBtn {
          background: #f1f5f9;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mb-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
        }

        .mb-field { display: flex; flex-direction: column; gap: 8px; }

        .mb-label {
          font-size: 12px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .mb-input, .mb-select {
          width: 100%;
          border: 2px solid #f1f5f9;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 15px;
          background: #f8fafc;
          transition: 0.2s;
          outline: none;
        }

        .mb-input:focus, .mb-select:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .mb-list {
          border: 1px solid #f1f5f9;
          border-radius: 14px;
          max-height: 200px;
          overflow-y: auto;
          background: #fff;
        }

        .mb-row {
          width: 100%;
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          border: none;
          border-bottom: 1px solid #f8fafc;
          background: #fff;
          cursor: pointer;
          transition: 0.2s;
          align-items: center;
        }

        .mb-row:hover { background: #f8fafc; }
        .mb-row.selected { background: #eff6ff; }

        .mb-row-name { font-weight: 700; color: #1e293b; }

        .mb-chip {
          font-size: 11px;
          font-weight: 800;
          padding: 2px 8px;
          background: #3b82f6;
          color: white;
          border-radius: 6px;
        }

        .mb-alert-box {
          background: #fff9f0;
          border: 1px solid #ffedd5;
          padding: 16px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mb-footer {
          padding: 20px 24px;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .mb-btn {
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
          border: 1px solid #e2e8f0;
          background: #fff;
        }

        .mb-btn-primary {
          background: #3b82f6;
          color: white;
          border: none;
        }

        .mb-btn-primary:disabled { background: #cbd5e1; cursor: not-allowed; }

        @keyframes mbFadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="mb-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-header">
          <div>
            <h2 className="mb-title">Flytt blad</h2>
            <div className="mb-sub-info">
              Blad: <span className="mb-strong">{blade?.IdNummer}</span>
              {fromSaw && (
                <>
                  {" "}
                  fra <span className="mb-strong">{fromSaw.name}</span>
                </>
              )}
            </div>
          </div>
          <button className="mb-closeBtn" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        <div className="mb-body">
          <div className="mb-field">
            <label className="mb-label">1. Søk etter målsag</label>
            <input
              className="mb-input"
              value={sawSearch}
              onChange={(e) => setSawSearch(e.target.value)}
              placeholder="Skriv maskinnavn..."
            />
            <div className="mb-list">
              {filteredSaws.length === 0 ? (
                <div
                  style={{
                    padding: "16px",
                    color: "#94a3b8",
                    fontSize: "14px",
                  }}
                >
                  Ingen treff
                </div>
              ) : (
                filteredSaws.map((s) => (
                  <button
                    key={s.id}
                    className={`mb-row ${toSawId === s.id ? "selected" : ""}`}
                    onClick={() => setToSawId(s.id)}
                  >
                    <span className="mb-row-name">{s.name}</span>
                    {toSawId === s.id && <span className="mb-chip">VALGT</span>}
                  </button>
                ))
              )}
            </div>
          </div>

          {toSawId && destHasBlade && (
            <div className="mb-alert-box">
              <div
                style={{ fontSize: "13px", color: "#9a3412", fontWeight: 600 }}
              >
                ⚠️ {toSaw?.name} har allerede blad (
                {destCurrent?.blade?.IdNummer}).
              </div>
              <div className="mb-field">
                <label className="mb-label">
                  Bytteårsak for eksisterende blad
                </label>
                <select
                  className="mb-select"
                  value={replaceReason}
                  onChange={(e) => setReplaceReason(e.target.value)}
                >
                  <option value="">Velg årsak...</option>
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-field">
                <label className="mb-label">Notat (valgfritt)</label>
                <input
                  className="mb-input"
                  value={replaceNote}
                  onChange={(e) => setReplaceNote(e.target.value)}
                  placeholder="Hvorfor byttes det?"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mb-footer">
          <button
            className="mb-btn"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Avbryt
          </button>
          <button
            className="mb-btn mb-btn-primary"
            disabled={!canSubmit}
            onClick={() => void onMove()}
          >
            {isSubmitting ? "Flytter..." : "Bekreft flytting"}
          </button>
        </div>
      </div>
    </div>
  );
}
