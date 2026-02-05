import React from "react";
import REASONS from "../../appdata/changereasons";

interface UninstallPayload {
  sawId: string;
  removedReason: string;
  removedNote?: string;
}

interface UninstallModalProps {
  uninstallOpen: boolean;
  uninstallSaw: { id: string; name: string } | null;
  setUninstallOpen: (open: boolean) => void;
  removedReason: string;
  setRemovedReason: (reason: string) => void;
  removedNote: string;
  setRemovedNote: (note: string) => void;
  uninstallMutation: {
    isPending: boolean;
    mutate: (data: UninstallPayload) => void;
  };
}

const UninstallModal: React.FC<UninstallModalProps> = ({
  uninstallOpen,
  uninstallSaw,
  setUninstallOpen,
  removedReason,
  setRemovedReason,
  removedNote,
  setRemovedNote,
  uninstallMutation,
}) => {
  const open = uninstallOpen && uninstallSaw;

  if (!open) return null;

  return (
    <>
      <div
        className="overlay"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setUninstallOpen(false);
        }}
      >
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modalHeader">
            <div className="headerLeft">
              <div className="modalTitle">Demonter blad</div>
              <div className="modalSub">
                Maskin: <b>{uninstallSaw.name}</b>
              </div>
            </div>

            <button
              className="iconBtn"
              type="button"
              aria-label="Lukk"
              onClick={() => setUninstallOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="modalBody">
            <div className="field">
              <label className="label">Årsak</label>
              <div className="control">
                <select
                  className="select"
                  value={removedReason}
                  onChange={(e) => setRemovedReason(e.target.value)}
                >
                  <option value="" disabled>
                    Velg en årsak…
                  </option>
                  {REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>
              <div className="help">
                Velg årsaken som blir lagret på installasjonshistorikken.
              </div>
            </div>

            <div className="field">
              <label className="label">Notat (valgfritt)</label>
              <textarea
                className="textarea"
                placeholder="F.eks. ujevn gange, brudd i tann, osv."
                value={removedNote}
                onChange={(e) => setRemovedNote(e.target.value)}
              />
            </div>
          </div>

          <div className="footer">
            <div className="hint">
              Dette lagres på historikken for installasjonen.
            </div>

            <div className="actions">
              <button
                className="ghost"
                type="button"
                onClick={() => setUninstallOpen(false)}
                disabled={uninstallMutation.isPending}
              >
                Avbryt
              </button>

              <button
                className="danger"
                type="button"
                disabled={uninstallMutation.isPending || !removedReason}
                onClick={() => {
                  uninstallMutation.mutate({
                    sawId: uninstallSaw.id,
                    removedReason,
                    removedNote: removedNote.trim()
                      ? removedNote.trim()
                      : undefined,
                  });
                }}
              >
                {uninstallMutation.isPending ? (
                  <span className="btnRow">
                    <span className="spinner" aria-hidden />
                    Demonterer…
                  </span>
                ) : (
                  "Demonter"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
  /* Viktig for at select/textarea aldri "blør" utenfor pga padding/border */
  .overlay, .overlay * {
    box-sizing: border-box;
  }

  .overlay {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 16px;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: 50;
    animation: fadeIn 140ms ease-out;
  }

  .modal {
    /* Bredere på store skjermer, men fortsatt trygg på mobil */
    width: min(760px, calc(100vw - 32px));
    max-width: 760px;

    border-radius: 18px;
    background: rgba(255, 255, 255, 0.94);
    border: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.30);
    overflow: hidden;
    transform-origin: center;
    animation: popIn 160ms ease-out;
  }

  /* Litt mer "luft" på store skjermer */
  @media (min-width: 1024px) {
    .overlay {
      padding: 24px;
    }
    .modalHeader {
      padding: 20px 22px 16px 22px;
    }
    .modalBody {
      padding: 18px 22px;
    }
    .footer {
      padding: 16px 22px 20px 22px;
    }
  }

  .modalHeader {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 18px 18px 14px 18px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    background: linear-gradient(
      to bottom,
      rgba(248, 250, 252, 0.98),
      rgba(255, 255, 255, 0.88)
    );
  }

  .headerLeft {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .modalTitle {
    font-size: 18px;
    font-weight: 750;
    letter-spacing: -0.01em;
    color: #0f172a;
  }

  .modalSub {
    font-size: 13px;
    color: rgba(15, 23, 42, 0.7);
  }

  .iconBtn {
    appearance: none;
    border: 1px solid rgba(15, 23, 42, 0.12);
    background: rgba(255, 255, 255, 0.9);
    color: rgba(15, 23, 42, 0.75);
    width: 38px;
    height: 38px;
    border-radius: 12px;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
    flex: 0 0 auto;
  }
  .iconBtn:hover {
    background: rgba(248, 250, 252, 1);
    border-color: rgba(15, 23, 42, 0.18);
    transform: translateY(-1px);
  }

  .modalBody {
    padding: 16px 18px;
    display: grid;
    gap: 14px;
  }

  .field {
    display: grid;
    gap: 8px;
  }

  .label {
    font-size: 13px;
    font-weight: 650;
    color: rgba(15, 23, 42, 0.86);
  }

  .control {
    position: relative;
  }

  .select,
  .textarea {
    /* Dette er ofte det som fikser "ligger utenfor" */
    display: block;
    width: 100%;
    max-width: 100%;

    border-radius: 12px;
    border: 1px solid rgba(15, 23, 42, 0.14);
    background: rgba(255, 255, 255, 0.92);
    color: #0f172a;
    outline: none;
    transition: border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease;
  }

  .select {
    height: 44px;
    padding: 0 12px;
    cursor: pointer;
  }

  .textarea {
    min-height: 110px;
    padding: 10px 12px;
    resize: vertical;
    line-height: 1.35;
  }

  .select:focus,
  .textarea:focus {
    border-color: rgba(37, 99, 235, 0.45);
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.16);
  }

  .help {
    font-size: 12px;
    color: rgba(15, 23, 42, 0.6);
  }

  .footer {
    padding: 14px 18px 18px 18px;
    border-top: 1px solid rgba(15, 23, 42, 0.08);
    background: rgba(248, 250, 252, 0.78);
    display: grid;
    gap: 12px;
  }

  /* Liten redesign: hint til venstre, actions til høyre (desktop) */
  .footerGrid {
    display: grid;
    gap: 12px;
    align-items: center;
  }
  @media (min-width: 720px) {
    .footerGrid {
      grid-template-columns: 1fr auto;
    }
  }

  .hint {
    font-size: 12px;
    color: rgba(15, 23, 42, 0.62);
  }

  .actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
  }

  .ghost,
  .danger {
    height: 42px;
    padding: 0 14px;
    border-radius: 12px;
    border: 1px solid rgba(15, 23, 42, 0.14);
    cursor: pointer;
    font-weight: 650;
    transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease,
      border-color 120ms ease, opacity 120ms ease;
    white-space: nowrap;
  }

  .ghost {
    background: rgba(255, 255, 255, 0.92);
    color: rgba(15, 23, 42, 0.82);
  }
  .ghost:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-1px);
  }

  .danger {
    border-color: rgba(220, 38, 38, 0.22);
    background: rgba(220, 38, 38, 0.92);
    color: white;
    box-shadow: 0 10px 20px rgba(220, 38, 38, 0.18);
  }
  .danger:hover {
    transform: translateY(-1px);
    background: rgba(220, 38, 38, 1);
    box-shadow: 0 14px 26px rgba(220, 38, 38, 0.22);
  }

  .ghost:disabled,
  .danger:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
    box-shadow: none;
  }

  .btnRow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border-radius: 999px;
    border: 2px solid rgba(255, 255, 255, 0.45);
    border-top-color: rgba(255, 255, 255, 1);
    animation: spin 800ms linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes popIn {
    from { opacity: 0; transform: translateY(8px) scale(0.98); }
    to { opacity: 1; transform: translateY(0px) scale(1); }
  }
`}</style>
    </>
  );
};

export default UninstallModal;
