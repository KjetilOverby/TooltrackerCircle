"use client";

import React from "react";

function formatDuration(ms: number) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes} min`;
  return `${hours} t ${minutes} min`;
}

// MINSTE felles shape UnmountList trenger.
// Dette matcher både recentQuery og andre lister så lenge de har disse feltene.
export type UnmountRow = {
  id: string;
  saw: { name: string };
  blade: { IdNummer: string };
  installedAt: Date;
  removedAt: Date | null;
  removedReason: string | null;
  removedNote: string | null;
  _count: { runLogs: number };
};

type Props<T extends UnmountRow> = {
  rows: T[];
  isFetching: boolean;
  onRunLog: (row: T) => void; // én callback, ikke to
};

const EtterregistreringList = <T extends UnmountRow>({
  rows,
  isFetching,
  onRunLog,
}: Props<T>) => {
  if (!rows.length) return null;

  return (
    <section className="card">
      <style>{`
        .card{
          background:#fff;
          border:1px solid #e6e7ea;
          border-radius:18px;
          padding:16px;
          margin: 2rem 0 0 0;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }

        .header{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:12px;
          margin-bottom:14px;
        }
        .titleWrap{
          display:flex;
          flex-direction:column;
          gap:2px;
        }
        .title{
          font-size:15px;
          font-weight:800;
          color:#111827;
          letter-spacing:-0.01em;
        }
        .subtitle{
          font-size:12px;
          color:#6b7280;
        }

        .badge{
          display:inline-flex;
          align-items:center;
          gap:6px;
          padding:6px 10px;
          border-radius:999px;
          border:1px solid #eef0f3;
          background:#f7f8fb;
          font-size:12px;
          color:#374151;
          white-space:nowrap;
        }
        .dot{
          width:8px;height:8px;border-radius:999px;
          background: #9ca3af;
        }
        .dotLive{ background:#10b981; }
        .dotFetching{ background:#f59e0b; }

        .list{
          display:flex;
          flex-direction:column;
          gap:10px;
        }

        .row{
          display:flex;
          flex-direction:column;
          gap:10px;
          border:1px solid #eef0f3;
          background: linear-gradient(180deg, #ffffff 0%, #fbfbfd 100%);
          border-radius:16px;
          padding:12px;
        }

        .top{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:12px;
        }

        .main{
          min-width:0;
          display:flex;
          flex-direction:column;
          gap:6px;
        }

        .headline{
          font-size:14px;
          color:#111827;
          line-height:1.2;
        }
        .headline b{ font-weight:800; }

        .meta{
          font-size:12px;
          color:#6b7280;
          line-height:1.35;
        }

        .pills{
          display:flex;
          flex-wrap:wrap;
          gap:6px;
          margin-top:2px;
        }
        .pill{
          display:inline-flex;
          align-items:center;
          padding:4px 10px;
          border-radius:999px;
          font-size:12px;
          font-weight:600;
          border:1px solid transparent;
          white-space:nowrap;
        }

        .pillReason{
          background:#eef2ff;
          color:#3730a3;
          border-color:#e0e7ff;
        }
        .pillWarn{
          background:#FEF3C7;
          color:#92400E;
          border-color:#FDE68A;
        }
        .pillOk{
          background:#D1FAE5;
          color:#065F46;
          border-color:#6EE7B7;
        }

        .actions{
          display:flex;
          gap:8px;
          flex-wrap:wrap;
          justify-content:flex-end;
          align-items:center;
        }

        .btn{
          appearance:none;
          border:none;
          border-radius:12px;
          padding:8px 10px;
          font-size:12px;
          font-weight:700;
          cursor:pointer;
          transition: transform 0.02s ease, filter 0.15s ease;
          display:inline-flex;
          align-items:center;
          gap:8px;
          white-space:nowrap;
        }
        .btn:active{ transform: translateY(1px); }

        .btnPrimary{
          background:#111827;
          color:#fff;
        }
        .btnPrimary:hover{ filter: brightness(1.07); }

        .btnGhost{
          background:#f3f4f6;
          color:#111827;
          border:1px solid #e5e7eb;
        }
        .btnGhost:hover{ filter: brightness(0.98); }

        .icon{
          width:16px;
          height:16px;
          display:inline-block;
        }

        @media (min-width: 780px){
          .row{
            flex-direction:row;
            align-items:flex-start;
            justify-content:space-between;
          }
          .main{ max-width: 70%; }
          .actions{ min-width: 260px; }
        }
      `}</style>

      <div className="header">
        <div className="titleWrap">
          <div className="title">Siste demonteringer</div>
          <div className="subtitle">
            Klikk på knappen for å etterregistrere driftsdata.
          </div>
        </div>

        <div className="badge">
          <span
            className={`dot ${isFetching ? "dotFetching" : "dotLive"}`}
            aria-hidden="true"
          />
          {isFetching ? "Oppdaterer…" : "Oppdatert nå"}
        </div>
      </div>

      <div className="list">
        {rows.map((row) => {
          const manglerDriftsdata = row._count.runLogs === 0;

          const duration =
            row.removedAt != null
              ? formatDuration(
                  row.removedAt.getTime() - row.installedAt.getTime(),
                )
              : "";

          return (
            <div key={row.id} className="row">
              <div className="main">
                <div className="headline">
                  Demontering: <b>{row.blade.IdNummer}</b> fra{" "}
                  <b>{row.saw.name}</b>
                </div>

                <div className="pills">
                  {row.removedReason ? (
                    <span className="pill pillReason">{row.removedReason}</span>
                  ) : null}

                  <span
                    className={`pill ${
                      manglerDriftsdata ? "pillWarn" : "pillOk"
                    }`}
                  >
                    {manglerDriftsdata
                      ? "Driftsdata mangler"
                      : "Har driftsdata"}
                  </span>

                  {duration ? (
                    <span
                      className="pill btnGhost"
                      style={{ cursor: "default" }}
                    >
                      Varighet: {duration}
                    </span>
                  ) : null}
                </div>

                <div className="meta">
                  {row.installedAt.toLocaleString()} →{" "}
                  {row.removedAt?.toLocaleString()}
                  {row.removedNote ? ` · ${row.removedNote}` : ""}
                </div>
              </div>

              <div className="actions">
                <button
                  type="button"
                  className="btn btnPrimary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRunLog(row);
                  }}
                >
                  <svg className="icon" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 6v12M6 12h12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Etterregistrer driftsdata
                </button>

                <button
                  type="button"
                  className="btn btnGhost"
                  onClick={() => {
                    console.log("Rediger demonterdata for install", row.id);
                  }}
                >
                  <svg className="icon" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0 0-3L16.5 4.5a2.12 2.12 0 0 0-3 0L3 15v5z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Rediger demonterdata
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default EtterregistreringList;
