"use client";

import React, { useEffect, useMemo } from "react";
import REASONS from "../../appdata/changereasons";

interface SwapPayload {
  sawId: string;
  newBladeId: string;
  removedReason: string;
  removedNote?: string;
}

type BladeOption = {
  id: string;
  IdNummer: string;
  bladeTypeName?: string | null;
};

interface SwapBladeModalProps {
  open: boolean;
  saw: { id: string; name: string } | null;
  currentBlade?: { id: string; IdNummer: string } | null;
  bladeSearch: string;
  setBladeSearch: (q: string) => void;
  bladeOptions: BladeOption[];
  isLoadingBlades?: boolean;
  newBladeId: string;
  setNewBladeId: (id: string) => void;
  removedReason: string;
  setRemovedReason: (reason: string) => void;
  removedNote: string;
  setRemovedNote: (note: string) => void;
  setOpen: (open: boolean) => void;
  swapMutation: {
    isPending: boolean;
    mutate: (payload: SwapPayload) => void;
  };
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

const SwapBladeModal: React.FC<SwapBladeModalProps> = ({
  open,
  saw,
  currentBlade,
  bladeSearch,
  setBladeSearch,
  bladeOptions,
  isLoadingBlades = false,
  newBladeId,
  setNewBladeId,
  removedReason,
  setRemovedReason,
  removedNote,
  setRemovedNote,
  setOpen,
  swapMutation,
}) => {
  const debouncedSearch = useDebouncedValue(bladeSearch, 250);

  const filteredBladeOptions = useMemo(() => {
    const base = currentBlade?.id
      ? bladeOptions.filter((b) => b.id !== currentBlade.id)
      : bladeOptions;

    const q = (debouncedSearch ?? "").trim().toLowerCase();
    if (!q) return base;
    return base.filter((b) => b.IdNummer.toLowerCase().includes(q));
  }, [bladeOptions, currentBlade?.id, debouncedSearch]);

  const canSubmit =
    !!saw?.id &&
    !!newBladeId &&
    !!removedReason &&
    !swapMutation.isPending &&
    !isLoadingBlades;

  if (!open || !saw) return null;

  return (
    <div
      className="sb-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <style>{`
        .sb-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          animation: sbFadeIn 0.2s ease-out;
        }

        .sb-modal {
          width: min(750px, 100%);
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          border: 1px solid #f1f5f9;
          overflow: hidden;
        }

        .sb-header {
          padding: 24px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: #fff;
        }

        .sb-title {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .sb-sub-wrap {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .sb-pill {
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          background: #f1f5f9;
          color: #475569;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .sb-closeBtn {
          background: #f1f5f9;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: 0.2s;
        }
        .sb-closeBtn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .sb-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
        }

        .sb-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sb-label {
          font-size: 12px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sb-input, .sb-select, .sb-textarea {
          width: 100%;
          border: 2px solid #f1f5f9;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 15px;
          background: #f8fafc;
          color: #0f172a;
          box-sizing: border-box;
          transition: 0.2s;
          outline: none;
        }

        .sb-input:focus, .sb-select:focus, .sb-textarea:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .sb-help {
          font-size: 12px;
          color: #94a3b8;
          margin-top: -4px;
        }

        .sb-list {
          border: 1px solid #f1f5f9;
          border-radius: 14px;
          max-height: 200px;
          overflow-y: auto;
          background: #fff;
        }

        .sb-listItem {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #f8fafc;
          cursor: pointer;
          transition: 0.2s;
        }
        .sb-listItem:hover { background: #f8fafc; }
        .sb-listItem.selected { background: #eff6ff; border-color: #3b82f6; }

        .sb-id { font-weight: 800; color: #1e293b; font-family: monospace; }
        .sb-meta { font-size: 12px; color: #64748b; }

        .sb-footer {
          padding: 20px 24px;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .sb-hint { font-size: 13px; color: #64748b; line-height: 1.4; }
        .sb-hint b { color: #3b82f6; }

        .sb-btn {
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #475569;
        }

        .sb-btn-primary {
          background: #3b82f6;
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }
        .sb-btn-primary:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
        }
        .sb-btn-primary:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          box-shadow: none;
        }

        @keyframes sbFadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="sb-modal" role="dialog" aria-modal="true">
        <div className="sb-header">
          <div>
            <h2 className="sb-title">Bytt sagblad</h2>
            <div className="sb-sub-wrap">
              <span className="sb-pill">Maskin: {saw.name}</span>
              <span className="sb-pill">
                Nåværende: {currentBlade?.IdNummer ?? "Ingen aktiv"}
              </span>
            </div>
          </div>
          <button className="sb-closeBtn" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        <div className="sb-body">
          {/* SØK NYTT BLAD */}
          <div className="sb-field">
            <label className="sb-label">1. Velg nytt blad</label>
            <input
              className="sb-input"
              placeholder="Søk på ID-nummer..."
              value={bladeSearch}
              onChange={(e) => setBladeSearch(e.target.value)}
              autoFocus
              disabled={swapMutation.isPending}
            />
            <div className="sb-list">
              {isLoadingBlades ? (
                <div className="sb-listItem sb-meta">Laster blader...</div>
              ) : filteredBladeOptions.length === 0 ? (
                <div className="sb-listItem sb-meta">Ingen blader funnet.</div>
              ) : (
                filteredBladeOptions.slice(0, 10).map((b) => (
                  <div
                    key={b.id}
                    className={`sb-listItem ${newBladeId === b.id ? "selected" : ""}`}
                    onClick={() => setNewBladeId(b.id)}
                  >
                    <div>
                      <span className="sb-id">{b.IdNummer}</span>
                      <div className="sb-meta">{b.bladeTypeName}</div>
                    </div>
                    <div
                      className="sb-meta"
                      style={{
                        fontWeight: 700,
                        color: newBladeId === b.id ? "#3b82f6" : "#cbd5e1",
                      }}
                    >
                      {newBladeId === b.id ? "VALGT" : "VELG"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ÅRSAK FOR GAMMELT BLAD */}
          <div className="sb-field">
            <label className="sb-label">2. Årsak til bytte</label>
            <select
              className="sb-select"
              value={removedReason}
              onChange={(e) => setRemovedReason(e.target.value)}
              disabled={swapMutation.isPending}
            >
              <option value="" disabled>
                Velg årsak...
              </option>
              {REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {/* NOTAT */}
          <div className="sb-field">
            <label className="sb-label">3. Kommentar (valgfri)</label>
            <textarea
              className="sb-textarea"
              placeholder="Skriv inn eventuelle merknader ved demontering..."
              value={removedNote}
              onChange={(e) => setRemovedNote(e.target.value)}
              disabled={swapMutation.isPending}
            />
          </div>
        </div>

        <div className="sb-footer">
          <div className="sb-hint">
            {newBladeId ? (
              <>
                Klar til å montere{" "}
                <b>
                  {
                    filteredBladeOptions.find((b) => b.id === newBladeId)
                      ?.IdNummer
                  }
                </b>
              </>
            ) : (
              <>Velg et nytt blad ovenfor for å fortsette</>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="sb-btn" onClick={() => setOpen(false)}>
              Avbryt
            </button>
            <button
              className="sb-btn sb-btn-primary"
              disabled={!canSubmit}
              onClick={() => {
                if (!saw?.id) return;
                swapMutation.mutate({
                  sawId: saw.id,
                  newBladeId,
                  removedReason,
                  removedNote: removedNote.trim() ?? undefined,
                });
              }}
            >
              {swapMutation.isPending ? "Behandler..." : "Bekreft bytte"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapBladeModal;
