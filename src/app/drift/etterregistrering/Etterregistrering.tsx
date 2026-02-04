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
        /* Card */
        .card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 18px;
          margin: 2rem 0 0 0;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        }

        /* Header */
        .cardheader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 16px;
        }

        .titleWrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .title {
          font-size: 15px;
          font-weight: 700;
          color: #1f2937;
          letter-spacing: -0.01em;
        }

        .subtitle {
          font-size: 12px;
          color: #6b7280;
        }

        /* Badge */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          font-size: 12px;
          color: #374151;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #9ca3af;
        }
        .dotLive {
          background: #22c55e;
        }
        .dotFetching {
          background: #fbbf24;
        }

        /* List */
        .list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .row {
          display: flex;
          flex-direction: column;
          gap: 12px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          border-radius: 16px;
          padding: 14px;
        }

        .top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .main {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .headline {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          line-height: 1.25;
        }
        .headline b {
          font-weight: 700;
        }

        .meta {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
        }

        /* Pills */
        .pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          border: 1px solid transparent;
          white-space: nowrap;
        }

        .pillReason {
          background: #eef2ff;
          color: #3730a3;
          border-color: #e0e7ff;
        }

        .pillWarn {
          background: #fffbeb;
          color: #92400e;
          border-color: #fde68a;
        }

        .pillOk {
          background: #ecfdf5;
          color: #065f46;
          border-color: #bbf7d0;
        }

        /* Actions */
        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
          align-items: center;
        }

        /* Buttons – rolige */
        .btn {
          appearance: none;
          border: none;
          border-radius: 12px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          transition:
            background 0.15s ease,
            box-shadow 0.15s ease;
        }

        .btnPrimary {
          background: #79b3a9;
          color: #ffffff;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
        }
        .btnPrimary:hover {
          background: #99b3a9;
        }

        .btnGhost {
          background: #f9fafb;
          color: #1f2937;
          border: 1px solid #e5e7eb;
        }
        .btnGhost:hover {
          background: #f3f4f6;
        }

        .icon {
          width: 16px;
          height: 16px;
          display: inline-block;
          opacity: 0.85;
        }

        @media (min-width: 780px) {
          .row {
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
          }
          .main {
            max-width: 70%;
          }
          .actions {
            min-width: 260px;
          }
        }
      `}</style>

      <div className="cardheader">
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
                  disabled={!manglerDriftsdata}
                  type="button"
                  className={`btn ${!manglerDriftsdata ? "btnGhost" : "btnPrimary"}`}
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
