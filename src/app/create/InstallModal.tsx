import React from "react";

interface InstallModalProps {
  open: boolean;
  selectedSaw: { id: string; name: string; sawType?: string | null } | null;
  setOpen: (open: boolean) => void;
  search: string;
  setSearch: (search: string) => void;
  bladesQuery: { isLoading: boolean };
  blades: Array<{
    id: string;
    IdNummer: string;
    bladeType?: { name: string } | null;
  }>;

  selectedBlade: { id: string; IdNummer: string } | null;

  setSelectedBlade: (blade: { id: string; IdNummer: string }) => void;
  installMutation: {
    isPending: boolean;
    mutate: (data: { sawId: string; bladeId: string }) => void;
  };
}

const InstallModal: React.FC<InstallModalProps> = ({
  open,
  selectedSaw,
  setOpen,
  search,
  setSearch,
  bladesQuery,
  blades,
  selectedBlade,
  setSelectedBlade,
  installMutation,
}) => {
  return (
    <div>
      <style>{`
              /* Modal */
        .overlay { position:fixed; inset:0; background: rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; padding: 18px; }
        .modal { width:min(760px, 100%); background:#fff; border-radius:14px; border:1px solid #e6e7ea; box-shadow: 0 10px 40px rgba(0,0,0,0.25); overflow:hidden; }
        .modalHeader { padding:16px 18px; display:flex; justify-content:space-between; gap:12px; align-items:flex-start; border-bottom:1px solid #eee; }
        .modalTitle { font-size:16px; font-weight:700; margin:0; }
        .modalSub { font-size:13px; color:#666; margin-top:4px; }
        .modalBody { padding: 16px 18px; display:flex; flex-direction:column; gap: 12px; }
        .row { display:flex; gap:12px; flex-wrap:wrap; }
        .input { flex: 1; min-width: 220px; border:1px solid #d8dbe2; border-radius:10px; padding:10px 12px; font-size:14px; }
        .list { border:1px solid #e6e7ea; border-radius:12px; overflow:hidden; }
        .listItem { display:flex; justify-content:space-between; gap:12px; padding:12px 12px; background:#fff; border-bottom:1px solid #f0f1f3; cursor:pointer; }
        .listItem:hover { background:#f7f8fb; }
        .listItem:last-child { border-bottom:none; }
        .small { font-size:12px; color:#666; }
        .selected { outline: 2px solid #2563eb; outline-offset:-2px; background:#f3f6ff; }
        .footer { padding: 14px 18px; border-top:1px solid #eee; display:flex; justify-content:space-between; align-items:center; gap:12px; }
        .hint { font-size:12px; color:#666; }
            `}</style>
      {open && selectedSaw && (
        <div
          className="overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modalHeader">
              <div>
                <div className="modalTitle">Monter blad</div>
                <div className="modalSub">
                  Maskin: <b>{selectedSaw.name}</b>
                  {selectedSaw.sawType ? ` · ${selectedSaw.sawType}` : ""}
                </div>
              </div>
              <button onClick={() => setOpen(false)}>Lukk</button>
            </div>

            <div className="modalBody">
              <div className="row">
                <input
                  className="input"
                  placeholder="Søk IdNummer (f.eks. B-001)…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="list">
                {bladesQuery.isLoading ? (
                  <div className="listItem">
                    <div>Laster blader…</div>
                  </div>
                ) : blades.length === 0 ? (
                  <div className="listItem">
                    <div>Ingen treff</div>
                    <div className="small">Prøv et annet søk</div>
                  </div>
                ) : (
                  blades.slice(0, 20).map((b) => (
                    <div
                      key={b.id}
                      className={`listItem ${selectedBlade?.id === b.id ? "selected" : ""}`}
                      onClick={() => setSelectedBlade(b)}
                    >
                      <div>
                        <div>
                          <b>{b.IdNummer}</b>
                        </div>
                        <div className="small">{b.bladeType?.name ?? ""}</div>
                      </div>
                      <div className="small">Velg</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="footer">
              <div className="hint">
                {selectedBlade ? (
                  <>
                    Valgt blad: <b>{selectedBlade.IdNummer}</b>
                  </>
                ) : (
                  <>Velg et blad før du monterer.</>
                )}
              </div>

              <button
                className="primary"
                disabled={!selectedBlade || installMutation.isPending}
                onClick={() => {
                  if (!selectedBlade) return;
                  installMutation.mutate({
                    sawId: selectedSaw.id,
                    bladeId: selectedBlade.id,
                    // replaceReason: "Sløvt", // neste steg når vi håndterer bytteårsaker
                  });
                }}
              >
                {installMutation.isPending ? "Monterer…" : "Monter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallModal;
