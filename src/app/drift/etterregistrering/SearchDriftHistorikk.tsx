"use client";

import React from "react";
import UnmountList from "../../machines/UnmountList";

export type Mode = "BLADE" | "SAW";

export type RecentRow = {
  id: string;
  saw: { id: string; name: string };
  blade: { id: string; IdNummer: string };
  installedAt: Date;
  removedAt: Date | null;
  removedReason: string | null;
  removedNote: string | null;
  _count: { runLogs: number };
};

type SawOption = { id: string; name: string };

type QueryFlags = {
  isFetched: boolean;
  isFetching: boolean;
};

type BladeQueryData = {
  blade: { id: string; IdNummer: string } | null;
  rows: RecentRow[];
};

type BladeQueryShape = {
  isFetching: boolean;
  isFetched: boolean;
  refetch: () => Promise<unknown>;
  data?: BladeQueryData;
};

interface UnmountLookupCardProps {
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;

  idNummer: string;
  setIdNummer: React.Dispatch<React.SetStateAction<string>>;

  sawId: string;
  setSawId: React.Dispatch<React.SetStateAction<string>>;

  saws: SawOption[];
  sawsLoading: boolean;

  bladeQuery: BladeQueryShape;
  sawUnmountsQuery: QueryFlags;

  rows: RecentRow[];
  isFetching: boolean;
  headerText: string;
}

const UnmountLookupCard: React.FC<UnmountLookupCardProps> = ({
  mode,
  setMode,
  idNummer,
  setIdNummer,
  sawId,
  setSawId,
  saws,
  bladeQuery,
  sawUnmountsQuery,
  rows,
  isFetching,
  headerText,
  sawsLoading,
}) => {
  return (
    <section className="wrap">
      <style>{`
        .wrap{
          background:#fff;
          border:1px solid #e6e7ea;
          border-radius:18px;
          padding:16px;
          margin: 2rem 0 0 0;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .top{
          display:flex;
          flex-direction:column;
          gap:12px;
          margin-bottom:14px;
        }
        .title{
          font-size:15px;
          font-weight:800;
          color:#111827;
        }
        .sub{
          font-size:12px;
          color:#6b7280;
          margin-top:2px;
        }
        .modeRow{
          display:flex;
          gap:8px;
          flex-wrap:wrap;
        }
        .modeBtn{
          appearance:none;
          border:1px solid #e5e7eb;
          background:#f3f4f6;
          color:#111827;
          padding:8px 10px;
          border-radius:12px;
          font-size:12px;
          font-weight:800;
          cursor:pointer;
        }
        .modeBtnActive{
          background:#111827;
          color:#fff;
          border-color:#111827;
        }
        .formRow{
          display:flex;
          gap:10px;
          align-items:center;
          flex-wrap:wrap;
        }
        .input{
          flex: 1 1 280px;
          border:1px solid #e5e7eb;
          background:#fff;
          padding:10px 12px;
          border-radius:12px;
          font-size:14px;
          outline:none;
        }
        .select{
          flex: 1 1 280px;
          border:1px solid #e5e7eb;
          background:#fff;
          padding:10px 12px;
          border-radius:12px;
          font-size:14px;
          outline:none;
        }
        .btn{
          appearance:none;
          border:none;
          border-radius:12px;
          padding:10px 12px;
          font-size:12px;
          font-weight:800;
          cursor:pointer;
          background:#111827;
          color:#fff;
        }
        .btn:disabled{
          opacity:0.6;
          cursor:not-allowed;
        }
        .hint{
          font-size:12px;
          color:#6b7280;
          margin-top:6px;
        }
        .empty{
          margin-top:12px;
          padding:12px;
          border:1px dashed #e5e7eb;
          background:#fafafa;
          border-radius:14px;
          color:#6b7280;
          font-size:12px;
        }
      `}</style>

      <div className="top">
        <div>
          <div className="title">{headerText}</div>
          <div className="sub">
            Velg søkemodus og hent data fra hele databasen for én maskin eller
            ett blad.
          </div>
        </div>

        <div className="modeRow">
          <button
            type="button"
            className={`modeBtn ${mode === "BLADE" ? "modeBtnActive" : ""}`}
            onClick={() => {
              setMode("BLADE");
              setSawId("");
            }}
          >
            Søk på blad
          </button>
          <button
            type="button"
            className={`modeBtn ${mode === "SAW" ? "modeBtnActive" : ""}`}
            onClick={() => {
              setMode("SAW");
              setIdNummer("");
            }}
          >
            Søk på maskin
          </button>
        </div>

        {mode === "BLADE" ? (
          <>
            <div className="formRow">
              <input
                className="input"
                value={idNummer}
                onChange={(e) => setIdNummer(e.target.value)}
                placeholder="Skriv hele IdNummer (eksakt)…"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void bladeQuery.refetch();
                  }
                }}
              />
              <button
                type="button"
                className="btn"
                disabled={!idNummer.trim() || bladeQuery.isFetching}
                onClick={() => void bladeQuery.refetch()}
              >
                {bladeQuery.isFetching ? "Søker…" : "Søk"}
              </button>
            </div>

            <div className="hint">
              Tips: dette er eksakt søk. Skriv hele bladnummeret og trykk Enter.
            </div>

            {bladeQuery.isFetched &&
            (bladeQuery.data?.blade == null ||
              (bladeQuery.data?.rows?.length ?? 0) === 0) ? (
              <div className="empty">
                Fant ingen demonteringer for dette bladet (eller bladet finnes
                ikke).
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="formRow">
              <select
                className="select"
                value={sawId}
                onChange={(e) => setSawId(e.target.value)}
              >
                <option value="">
                  {sawsLoading ? "Laster maskiner…" : "Velg maskin…"}
                </option>

                {saws.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {sawId && sawUnmountsQuery.isFetched && rows.length === 0 ? (
              <div className="empty">
                Fant ingen demonteringer på valgt maskin.
              </div>
            ) : null}
          </>
        )}
      </div>

      {rows.length ? <UnmountList rows={rows} isFetching={isFetching} /> : null}
    </section>
  );
};

export default UnmountLookupCard;
