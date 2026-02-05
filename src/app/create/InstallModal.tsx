"use client";
import React, { useMemo } from "react";

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
    side?: string;
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
  // --- DETTE ER LØSNINGEN ---
  // Vi filtrerer "blades" basert på det brukeren skriver i "search"
  const filteredBlades = useMemo(() => {
    if (!search) return blades;
    const q = search.toLowerCase().trim();
    return blades.filter(
      (b) =>
        b.IdNummer.toLowerCase().includes(q) ||
        b.bladeType?.name?.toLowerCase().includes(q),
    );
  }, [blades, search]);

  return (
    <div className="im-wrapper">
      <style>{`
        /* ... dine stiler her (behold de som de var) ... */
        .im-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 1000; }
        .im-modal { width: min(650px, 100%); background: #ffffff !important; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column; max-height: 90vh; border: 1px solid #f1f5f9; color: #0f172a; }
        .im-header { padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start; }
        .im-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; }
        .im-sub { font-size: 14px; color: #64748b; margin-top: 4px; }
        .im-closeBtn { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; transition: 0.2s; }
        .im-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; overflow: hidden; }
        .im-input { width: 100%; border: 2px solid #f1f5f9; border-radius: 12px; padding: 12px 16px; font-size: 15px; background: #f8fafc; color: #0f172a; box-sizing: border-box; outline: none; transition: 0.2s; }
        .im-input:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        .im-list { border: 1px solid #f1f5f9; border-radius: 14px; overflow-y: auto; max-height: 350px; background: #fff; }
        .im-listItem { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 1px solid #f8fafc; cursor: pointer; transition: 0.2s; }
        .im-listItem:hover { background: #f8fafc; }
        .im-listItem.im-selected { background: #eff6ff; border-color: #3b82f6; }
        .im-bladeInfo b { font-size: 15px; color: #1e293b; display: block; }
        .im-small { font-size: 13px; color: #64748b; }
        .im-sidePill { font-size: 11px; font-weight: 700; padding: 2px 8px; background: #e2e8f0; color: #475569; border-radius: 6px; margin-left: 8px; }
        .im-footer { padding: 20px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; border-radius: 0 0 20px 20px; display: flex; justify-content: space-between; align-items: center; }
        .im-primaryBtn { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .im-primaryBtn:disabled { background: #cbd5e1; cursor: not-allowed; }
      `}</style>

      {open && selectedSaw && (
        <div
          className="im-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="im-modal" role="dialog">
            <div className="im-header">
              <div>
                <div className="im-title">Monter blad</div>
                <div className="im-sub">
                  Maskin: <b>{selectedSaw.name}</b>
                </div>
              </div>
              <button className="im-closeBtn" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>

            <div className="im-body">
              <input
                className="im-input"
                placeholder="Søk IdNummer (f.eks. B-001)…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />

              <div className="im-list">
                {bladesQuery.isLoading ? (
                  <div
                    className="im-listItem im-small"
                    style={{ justifyContent: "center" }}
                  >
                    Laster blader…
                  </div>
                ) : filteredBlades.length === 0 ? (
                  <div
                    className="im-listItem"
                    style={{ flexDirection: "column", textAlign: "center" }}
                  >
                    <div style={{ fontWeight: 600 }}>Ingen treff</div>
                    <div className="im-small">Prøv et annet IdNummer</div>
                  </div>
                ) : (
                  // Bruker filteredBlades i stedet for blades
                  filteredBlades.slice(0, 20).map((b) => (
                    <div
                      key={b.id}
                      className={`im-listItem ${selectedBlade?.id === b.id ? "im-selected" : ""}`}
                      onClick={() => setSelectedBlade(b)}
                    >
                      <div className="im-bladeInfo">
                        <b>{b.IdNummer}</b>
                        <div className="im-small">
                          {b.bladeType?.name ?? "Standard blad"}
                          {b.side && (
                            <span className="im-sidePill">{b.side}</span>
                          )}
                        </div>
                      </div>
                      <div
                        className="im-small"
                        style={{
                          fontWeight: 700,
                          color:
                            selectedBlade?.id === b.id ? "#3b82f6" : "#cbd5e1",
                        }}
                      >
                        {selectedBlade?.id === b.id ? "VALGT" : "VELG"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="im-footer">
              <div className="im-small">
                {selectedBlade ? (
                  <>
                    Valgt: <b>{selectedBlade.IdNummer}</b>
                  </>
                ) : (
                  "Velg et blad"
                )}
              </div>
              <button
                className="im-primaryBtn"
                disabled={!selectedBlade || installMutation.isPending}
                onClick={() =>
                  installMutation.mutate({
                    sawId: selectedSaw.id,
                    bladeId: selectedBlade!.id,
                  })
                }
              >
                {installMutation.isPending ? "Monterer…" : "Fullfør montering"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallModal;
