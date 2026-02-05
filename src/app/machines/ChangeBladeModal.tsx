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

  // 🔎 søk + resultater (hentes utenfor modalen via query med enabled: open)
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
  // (kun UI) debounce for litt mindre “støy” i søkefeltet
  const debouncedSearch = useDebouncedValue(bladeSearch, 250);

  // Blokker å velge samme blad som allerede står i maskinen
  const filteredBladeOptions = useMemo(() => {
    const base = currentBlade?.id
      ? bladeOptions.filter((b) => b.id !== currentBlade.id)
      : bladeOptions;

    // Hvis du vil ha lokal filtrering i tillegg (selv om query allerede filtrerer):
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
      className="sbOverlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <style>{`
        .sbOverlay{
          position:fixed;
          inset:0;
          z-index:9999;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:18px;
          background:
            radial-gradient(900px 420px at 20% 0%, rgba(59,130,246,.18) 0%, transparent 55%),
            radial-gradient(900px 420px at 100% 0%, rgba(16,185,129,.14) 0%, transparent 55%),
            rgba(2,6,23,.55);
          backdrop-filter: blur(6px);
        }
        .sbModal{
          width:min(860px, 100%);
          background: rgba(255,255,255,.95);
          border:1px solid rgba(148,163,184,.35);
          border-radius:18px;
          box-shadow: 0 30px 90px rgba(0,0,0,.35);
          overflow:hidden;
        }
        .sbHeader{
          padding:18px 20px;
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:14px;
          border-bottom:1px solid rgba(148,163,184,.25);
          background:
            linear-gradient(180deg, rgba(255,255,255,.85), rgba(255,255,255,.65));
        }
        .sbTitle{
          font-size:18px;
          font-weight:800;
          letter-spacing:-.02em;
          margin:0;
          color:#0f172a;
        }
        .sbSub{
          margin-top:6px;
          font-size:13px;
          color:#475569;
          display:flex;
          flex-wrap:wrap;
          gap:8px;
          align-items:center;
        }
        .sbPill{
          display:inline-flex;
          gap:8px;
          align-items:center;
          padding:6px 10px;
          border-radius:999px;
          border:1px solid rgba(148,163,184,.25);
          background: rgba(248,250,252,.75);
          color:#0f172a;
          font-size:12px;
          font-weight:700;
        }
        .sbClose{
          border:1px solid rgba(148,163,184,.35);
          background: rgba(248,250,252,.85);
          color:#0f172a;
          border-radius:12px;
          padding:10px 12px;
          font-weight:700;
          cursor:pointer;
        }
        .sbClose:hover{ background: rgba(255,255,255,.95); }

        .sbBody{
          padding:18px 20px 6px;
          display:grid;
          gap:14px;
        }
        .sbGrid{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap:12px;
        }
        @media (max-width: 760px){
          .sbGrid{ grid-template-columns: 1fr; }
        }
        .sbField{
          display:grid;
          gap:8px;
        }
        .sbLabel{
          font-size:12px;
          font-weight:800;
          color:#334155;
          letter-spacing:.02em;
          text-transform:uppercase;
        }
        .sbInput, .sbSelect, .sbTextarea{
          width:80%;
          border:1px solid rgba(148,163,184,.45);
          background: rgba(255,255,255,.9);
          border-radius:14px;
          padding:12px 12px;
          font-size:14px;
          outline:none;
          box-shadow: 0 1px 0 rgba(15,23,42,.02);
        }
        .sbInput:focus, .sbSelect:focus, .sbTextarea:focus{
          border-color: rgba(59,130,246,.75);
          box-shadow: 0 0 0 4px rgba(59,130,246,.15);
        }
        .sbTextarea{
          min-height: 110px;
          resize: vertical;
          line-height: 1.4;
        }
        .sbHelp{
          font-size:12px;
          color:#64748b;
          margin-top:-2px;
        }
        .sbDivider{
          height:1px;
          background: rgba(148,163,184,.25);
          margin: 2px 0 0;
        }

        .sbList{
          margin-top:10px;
          border:1px solid rgba(148,163,184,.25);
          border-radius:14px;
          overflow:hidden;
          background: rgba(248,250,252,.7);
        }
        .sbListItem{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          padding:12px 12px;
          border-bottom:1px solid rgba(148,163,184,.18);
          cursor:pointer;
          background: rgba(255,255,255,.85);
        }
        .sbListItem:hover{ background: rgba(241,245,249,.95); }
        .sbListItem:last-child{ border-bottom:none; }
        .sbListLeft{ display:grid; gap:3px; }
        .sbId{ font-weight:900; color:#0f172a; letter-spacing:-.01em; }
        .sbMeta{ font-size:12px; color:#64748b; }
        .sbPick{
          font-size:12px;
          font-weight:800;
          color:#2563eb;
          background: rgba(37,99,235,.10);
          border:1px solid rgba(37,99,235,.18);
          padding:6px 10px;
          border-radius:999px;
        }
        .sbSelectedRow{
          outline: 2px solid rgba(37,99,235,.55);
          outline-offset: -2px;
          background: rgba(37,99,235,.08);
        }
        .sbMutedRow{
          padding:12px;
          font-size:13px;
          color:#64748b;
          background: rgba(255,255,255,.75);
        }

        .sbFooter{
          padding:16px 20px 18px;
          display:flex;
          justify-content:space-between;
          gap:12px;
          align-items:center;
        }
        .sbHint{
          font-size:12px;
          color:#64748b;
          line-height:1.35;
        }
        .sbActions{
          display:flex;
          gap:10px;
          align-items:center;
        }
        .sbBtn{
          border-radius:14px;
          padding:12px 16px;
          font-weight:800;
          font-size:14px;
          cursor:pointer;
          border:1px solid rgba(148,163,184,.35);
          background: rgba(248,250,252,.9);
          color:#0f172a;
          min-height: 46px;
        }
        .sbBtn:hover{ background: rgba(255,255,255,.98); }
        .sbPrimary{
          border:1px solid rgba(37,99,235,.35);
          background: linear-gradient(180deg, rgba(37,99,235,.95), rgba(29,78,216,.95));
          color:#fff;
          box-shadow: 0 12px 28px rgba(37,99,235,.25);
        }
        .sbPrimary:hover{ filter: brightness(1.02); }
        .sbPrimary:disabled{ opacity:.55; cursor:not-allowed; box-shadow:none; }
        .sbBtn:disabled{ opacity:.55; cursor:not-allowed; }
      `}</style>

      <div className="sbModal" role="dialog" aria-modal="true">
        <div className="sbHeader">
          <div>
            <div className="sbTitle">Bytt blad</div>
            <div className="sbSub">
              <span className="sbPill">Maskin: {saw.name}</span>
              {currentBlade?.IdNummer ? (
                <span className="sbPill">
                  Nåværende: {currentBlade.IdNummer}
                </span>
              ) : (
                <span className="sbPill">Ingen aktivt blad</span>
              )}
            </div>
          </div>

          <button className="sbClose" onClick={() => setOpen(false)}>
            Lukk
          </button>
        </div>

        <div className="sbBody">
          {/* 🔎 Søke + listevalg for nytt blad */}
          <div className="sbField">
            <div className="sbLabel">Finn nytt blad</div>
            <input
              className="sbInput"
              placeholder="Søk IdNummer (f.eks. B-001)…"
              value={bladeSearch}
              onChange={(e) => setBladeSearch(e.target.value)}
              autoFocus
              disabled={swapMutation.isPending}
            />
            <div className="sbHelp">
              Søk og velg bladet som skal monteres. (Viser maks 20 treff)
            </div>

            <div className="sbList">
              {isLoadingBlades ? (
                <div className="sbMutedRow">Laster blader…</div>
              ) : filteredBladeOptions.length === 0 ? (
                <div className="sbMutedRow">
                  Ingen treff. Prøv et annet søk.
                </div>
              ) : (
                filteredBladeOptions.slice(0, 20).map((b) => (
                  <div
                    key={b.id}
                    className={`sbListItem ${newBladeId === b.id ? "sbSelectedRow" : ""}`}
                    onClick={() => setNewBladeId(b.id)}
                  >
                    <div className="sbListLeft">
                      <div className="sbId">{b.IdNummer}</div>
                      <div className="sbMeta">{b.bladeTypeName ?? ""}</div>
                    </div>
                    <div className="sbPick">
                      {newBladeId === b.id ? "Valgt" : "Velg"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="sbField">
            <div className="sbLabel">Årsak (bladet som tas ut)</div>
            <select
              className="sbSelect"
              value={removedReason}
              onChange={(e) => setRemovedReason(e.target.value)}
              disabled={swapMutation.isPending}
            >
              <option value="" disabled>
                --- Velg en årsak ---
              </option>
              {REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            <div className="sbHelp">
              Lagres på installasjonen som avsluttes.
            </div>
          </div>

          <div className="sbDivider" />
        </div>

        <div className="sbFooter">
          <div className="sbHint">
            {newBladeId ? (
              <>
                Valgt nytt blad: <b>{newBladeId}</b> (ID)
              </>
            ) : (
              <>Velg nytt blad før du bytter.</>
            )}
            <br />
            Dette gjør demontering (med årsak/notat) + montering i én operasjon.
          </div>

          <div className="sbActions">
            <button
              className="sbBtn"
              onClick={() => setOpen(false)}
              disabled={swapMutation.isPending}
            >
              Avbryt
            </button>

            <button
              className="sbBtn sbPrimary"
              disabled={!canSubmit}
              onClick={() => {
                if (!saw?.id) return;
                swapMutation.mutate({
                  sawId: saw.id,
                  newBladeId,
                  removedReason,
                  removedNote: removedNote.trim()
                    ? removedNote.trim()
                    : undefined,
                });
              }}
            >
              {swapMutation.isPending ? "Bytter…" : "Bytt blad"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapBladeModal;
