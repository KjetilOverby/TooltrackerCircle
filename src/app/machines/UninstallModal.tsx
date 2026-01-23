import React from "react";

interface UninstallModalProps {
  uninstallOpen: boolean;
  uninstallSaw: { id: string; name: string } | null; // Adjust the type as necessary
  setUninstallOpen: (open: boolean) => void;
  removedReason: string;
  setRemovedReason: (reason: string) => void;
  removedNote: string;
  setRemovedNote: (note: string) => void;
  uninstallMutation: { isPending: boolean; mutate: (data: any) => void }; // Adjust the type as necessary
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
  return (
    <div>
      {uninstallOpen && uninstallSaw && (
        <div
          className="overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setUninstallOpen(false);
          }}
        >
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modalHeader">
              <div>
                <div className="modalTitle">Demonter blad</div>
                <div className="modalSub">
                  Maskin: <b>{uninstallSaw.name}</b>
                </div>
              </div>
              <button onClick={() => setUninstallOpen(false)}>Lukk</button>
            </div>

            <div className="modalBody">
              <div className="row">
                <label className="label">
                  Årsak
                  <select
                    className="select"
                    value={removedReason}
                    onChange={(e) => setRemovedReason(e.target.value)}
                  >
                    <option value="Sagbladet går bra">Sagbladet går bra</option>
                    <option value="Merker etter sagblad på skuroverflaten">
                      Merker etter sagblad på skuroverflaten
                    </option>
                    <option value="Kast i sagbladet, dårlig skur">
                      Kast i sagbladet, dårlig skur
                    </option>
                    <option value="Kast i sagbladet med en gang">
                      Kast i sagbladet med en gang
                    </option>
                    <option value="Kast i sagbladet etter  en stund">
                      Kast i sagbladet etter en stund
                    </option>
                    <option value="Feil mål">Feil mål</option>
                    <option value="Feil mål etter en stund">
                      Feil mål etter en stund
                    </option>
                    <option value="Varmegang">Varmegang</option>
                    <option value="Sagbladet gått i metall/stein">
                      Sagbladet gått i metall/stein
                    </option>
                    <option value="Annet">Annet</option>
                  </select>
                </label>
              </div>

              <div className="row">
                <label className="label" style={{ width: "100%" }}>
                  Notat (valgfritt)
                  <textarea
                    className="textarea"
                    placeholder="F.eks. ujevn gange, brudd i tann, osv."
                    value={removedNote}
                    onChange={(e) => setRemovedNote(e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="footer">
              <div className="hint">
                Dette lagres på historikken for installasjonen.
              </div>

              <button
                className="danger"
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
                {uninstallMutation.isPending ? "Demonterer…" : "Demonter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UninstallModal;
