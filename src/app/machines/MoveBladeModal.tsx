"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";

type SimpleBlade = { id: string; IdNummer: string };
type SimpleSaw = { id: string; name: string };

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;

  blade: { id: string; IdNummer: string } | null;
  fromSaw: { id: string; name: string } | null;

  saws: { id: string; name: string }[];

  sawSearch: string;
  setSawSearch: (v: string) => void;

  toSawId: string;
  setToSawId: (v: string) => void;

  destIsLoading: boolean;
  destBladeIdNummer: string | null;

  replaceReason: string;
  setReplaceReason: (v: string) => void;

  replaceNote: string;
  setReplaceNote: (v: string) => void;

  isSubmitting: boolean;
  errorMessage: string | null;

  onSubmit: () => void;
};

const REASONS = [
  "Sløvt",
  "Tannbrudd",
  "Sporing",
  "Produksjonsskifte",
  "Flyttet",
  "Annet",
] as const;

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

  // 2) status for valgt målsag
  const currentOnSawQuery = api.bladeInstall.currentOnSaw.useQuery(
    { sawId: toSawId },
    { enabled: open && !!toSawId },
  );

  const destCurrent = currentOnSawQuery.data?.current ?? null;
  const destHasBlade = !!destCurrent?.blade?.id;

  // 3) flytt via install-mutasjonen du allerede har
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ikke la deg velge samme som fromSaw hvis det finnes
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

  //   async function onMove() {
  //     if (!blade?.id || !toSawId) return;

  //     await installMutation.mutateAsync({
  //       sawId: toSawId,
  //       bladeId: blade.id,
  //       replaceReason: destHasBlade ? replaceReason || undefined : undefined,
  //       replaceNote: destHasBlade ? replaceNote || undefined : undefined,
  //     });
  //   }
  async function onMove() {
    console.log("onMove start", {
      bladeId: blade?.id,
      toSawId,
      replaceReason,
      destHasBlade,
    });

    if (!blade?.id) {
      console.warn("STOP: mangler blade.id");
      return;
    }
    if (!toSawId) {
      console.warn("STOP: mangler toSawId (du har ikke valgt målsag)");
      return;
    }
    if (destHasBlade && !replaceReason) {
      console.warn("STOP: målsag har blad, men replaceReason er tom");
      return;
    }

    try {
      const res = await installMutation.mutateAsync({
        sawId: toSawId,
        bladeId: blade.id,
        replaceReason: destHasBlade ? replaceReason : undefined,
        replaceNote: destHasBlade ? replaceNote : undefined,
      });
      console.log("onMove done", res);
    } catch (e) {
      console.error("onMove error", e);
    }
  }

  function close() {
    if (isSubmitting) return;
    setOpen(false);
  }

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isSubmitting]);

  if (!open) return null;

  return (
    <>
      <div className="mbOverlay" onMouseDown={close} />

      <div
        className="mbWrap"
        role="dialog"
        aria-modal="true"
        aria-label="Flytt blad"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mbHeader">
          <div className="mbTitle">Flytt blad</div>
          <button className="mbX" onClick={close} aria-label="Lukk">
            ×
          </button>
        </div>

        <div className="mbSub">
          {blade ? (
            <>
              Flytter blad <span className="mbStrong">{blade.IdNummer}</span>
              {fromSaw?.name ? (
                <>
                  {" "}
                  fra <span className="mbStrong">{fromSaw.name}</span>
                </>
              ) : null}
              .
            </>
          ) : (
            "Velg et blad først."
          )}
        </div>

        <div className="mbBody">
          <div className="mbGrid">
            <div className="mbField">
              <label className="mbLabel" htmlFor="sawSearch">
                Søk i maskiner
              </label>
              <input
                id="sawSearch"
                className="mbInput"
                value={sawSearch}
                onChange={(e) => setSawSearch(e.target.value)}
                placeholder="Skriv for å filtrere..."
              />
            </div>

            <div className="mbField">
              <label className="mbLabel">Velg målsag</label>

              <div className="mbList" role="listbox" aria-label="Maskinliste">
                {filteredSaws.length === 0 ? (
                  <div className="mbEmpty">Ingen treff</div>
                ) : (
                  filteredSaws.map((s) => {
                    const selected = s.id === toSawId;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`mbRow ${selected ? "isSelected" : ""}`}
                        onClick={() => setToSawId(s.id)}
                      >
                        <span className="mbRowName">{s.name}</span>
                        {selected ? (
                          <span className="mbChip">Valgt</span>
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>

              {toSawId ? (
                <div className="mbHint">
                  {currentOnSawQuery.isLoading ? (
                    <>Laster status for {toSaw?.name ?? "målsag"}…</>
                  ) : destHasBlade ? (
                    <>
                      Målsag{" "}
                      <span className="mbStrong">{toSaw?.name ?? ""}</span> har
                      allerede blad{" "}
                      <span className="mbStrong">
                        {destCurrent?.blade?.IdNummer}
                      </span>
                      . Du må angi bytteårsak.
                    </>
                  ) : (
                    <>
                      Målsag{" "}
                      <span className="mbStrong">{toSaw?.name ?? ""}</span> er
                      tom.
                    </>
                  )}
                </div>
              ) : null}
            </div>

            {toSawId && destHasBlade ? (
              <div className="mbBox">
                <div className="mbField">
                  <label className="mbLabel" htmlFor="reason">
                    Bytteårsak <span className="mbReq">*</span>
                  </label>
                  <select
                    id="reason"
                    className="mbSelect"
                    value={replaceReason}
                    onChange={(e) => setReplaceReason(e.target.value)}
                  >
                    <option value="">Velg årsak</option>
                    {REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {!replaceReason ? (
                    <div className="mbTiny">
                      Målsagen har blad, så årsak er påkrevd for å logge det ut.
                    </div>
                  ) : null}
                </div>

                <div className="mbField">
                  <label className="mbLabel" htmlFor="note">
                    Notat (valgfritt)
                  </label>
                  <input
                    id="note"
                    className="mbInput"
                    value={replaceNote}
                    onChange={(e) => setReplaceNote(e.target.value)}
                    placeholder="Ekstra info…"
                  />
                </div>
              </div>
            ) : null}

            {installMutation.error ? (
              <div className="mbError" role="alert">
                {installMutation.error.message}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mbFooter">
          <button
            className="mbBtn ghost"
            onClick={close}
            disabled={isSubmitting}
          >
            Avbryt
          </button>

          <button
            className="mbBtn primary"
            type="button"
            onClick={() => {
              void onMove();
            }}
          >
            {isSubmitting ? "Flytter…" : "Flytt blad"}
          </button>
        </div>
      </div>

      <style>{`
        .mbOverlay{
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.45);
          z-index: 40;
        }

        .mbWrap{
          position: fixed;
          z-index: 50;
          left: 50%;
          top: 50%;
          transform: translate(-50%,-50%);
          width: min(720px, calc(100vw - 24px));
          max-height: calc(100vh - 24px);
          overflow: auto;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 20px 60px rgba(0,0,0,.25);
          border: 1px solid rgba(0,0,0,.08);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Apple Color Emoji","Segoe UI Emoji";
        }

        .mbHeader{
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(0,0,0,.08);
        }

        .mbTitle{
          font-size: 16px;
          font-weight: 700;
        }

        .mbX{
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,.10);
          background: #fff;
          cursor: pointer;
          font-size: 22px;
          line-height: 0;
        }
        .mbX:hover{ background: rgba(0,0,0,.04); }

        .mbSub{
          padding: 10px 16px 0 16px;
          font-size: 13px;
          color: rgba(0,0,0,.70);
        }

        .mbBody{
          padding: 14px 16px 8px 16px;
        }

        .mbGrid{
          display: grid;
          gap: 14px;
        }

        .mbField{
          display: grid;
          gap: 6px;
        }

        .mbLabel{
          font-size: 12px;
          font-weight: 600;
          color: rgba(0,0,0,.75);
        }

        .mbReq{
          color: #b42318;
          font-weight: 700;
        }

        .mbInput, .mbSelect{
          width: 100%;
          height: 38px;
          padding: 0 12px;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,.14);
          outline: none;
          font-size: 14px;
          background: #fff;
        }
        .mbInput:focus, .mbSelect:focus{
          border-color: rgba(0,0,0,.35);
          box-shadow: 0 0 0 3px rgba(0,0,0,.08);
        }

        .mbList{
          border: 1px solid rgba(0,0,0,.12);
          border-radius: 12px;
          overflow: hidden;
          max-height: 260px;
          overflow-y: auto;
          background: #fff;
        }

        .mbRow{
          width: 100%;
          text-align: left;
          padding: 10px 12px;
          border: 0;
          border-bottom: 1px solid rgba(0,0,0,.08);
          background: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .mbRow:last-child{ border-bottom: 0; }
        .mbRow:hover{ background: rgba(0,0,0,.03); }
        .mbRow.isSelected{
          background: rgba(0,0,0,.06);
        }

        .mbRowName{
          font-size: 14px;
          font-weight: 600;
          color: rgba(0,0,0,.85);
        }

        .mbChip{
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 999px;
          border: 1px solid rgba(0,0,0,.14);
          background: rgba(0,0,0,.04);
          color: rgba(0,0,0,.75);
          white-space: nowrap;
        }

        .mbEmpty{
          padding: 12px;
          font-size: 13px;
          color: rgba(0,0,0,.60);
        }

        .mbHint{
          font-size: 12px;
          color: rgba(0,0,0,.65);
          padding-top: 6px;
        }

        .mbStrong{
          font-weight: 700;
          color: rgba(0,0,0,.85);
        }

        .mbBox{
          border: 1px solid rgba(0,0,0,.12);
          background: rgba(0,0,0,.02);
          border-radius: 12px;
          padding: 12px;
          display: grid;
          gap: 12px;
        }

        .mbTiny{
          font-size: 12px;
          color: rgba(0,0,0,.60);
        }

        .mbError{
          border: 1px solid rgba(180,35,24,.35);
          background: rgba(180,35,24,.06);
          color: rgba(180,35,24,.95);
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 13px;
        }

        .mbFooter{
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 12px 16px 16px 16px;
          border-top: 1px solid rgba(0,0,0,.08);
        }

        .mbBtn{
          height: 38px;
          padding: 0 14px;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,.14);
          background: #fff;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
        }
        .mbBtn:hover{ background: rgba(0,0,0,.04); }
        .mbBtn:disabled{
          opacity: .55;
          cursor: not-allowed;
        }

        .mbBtn.primary{
          background: #111;
          border-color: #111;
          color: #fff;
        }
        .mbBtn.primary:hover{
          background: #000;
        }

        .mbBtn.ghost{
          background: #fff;
        }

        @media (max-width: 520px){
          .mbFooter{
            flex-direction: column;
          }
          .mbBtn{
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
