"use client";
import React from "react";

function formatDuration(ms: number) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}t ${minutes}m`;
}

export type UnmountRow = {
  id: string;
  saw: { name: string };

  blade: {
    IdNummer: string;
    bladeType?: { name: string };
    side: string | null; // ENDRET HER: Tillater null
  };
  installedAt: Date;
  removedAt: Date | null;
  removedReason: string | null;
  removedNote: string | null;
  _count: { runLogs: number };
};

type Props<T extends UnmountRow> = {
  rows: T[];
  isFetching: boolean;
  onRunLog: (row: T) => void;
};

const EtterregistreringList = <T extends UnmountRow>({
  rows,
  isFetching,
  onRunLog,
}: Props<T>) => {
  if (!rows.length) return null;

  return (
    <section className="et-card">
      <style jsx>{`
        .et-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 24px;
          margin: 2rem 0;
          color: #f8fafc;
        }

        .et-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .et-title {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .et-subtitle {
          font-size: 13px;
          color: #94a3b8;
          margin-top: 4px;
        }

        .et-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 99px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .et-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
        }
        .et-dot.fetching {
          background: #f59e0b;
          animation: et-pulse 1.5s infinite;
        }

        @keyframes et-pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }

        /* Ny layout for info-linjen */
        .et-info-line {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
        }

        .et-main-id {
          font-size: 15px;
          font-weight: 600;
          color: #9dc9f5;
          background: rgba(59, 130, 246, 0.1);
          padding: 4px 10px;
          border-radius: 8px;
          border: 1px solid rgba(59, 130, 246, 0.2);
          min-width: 70px;
          text-align: center;
          gap: 4px;
        }

        .et-type-tag {
          font-size: 15px;
          font-weight: 400;
          color: #9dc9f5;
          background: rgba(59, 130, 246, 0.1);
          padding: 4px 10px;
          border-radius: 8px;
          border: 1px solid rgba(59, 130, 246, 0.2);
          min-width: 70px;
          text-align: center;
          gap: 4px;
        }

        .et-saw-tag {
          font-size: 15px;
          font-weight: 600;
          color: #9dc9f5;
          background: rgba(59, 130, 246, 0.1);
          padding: 4px 10px;
          border-radius: 8px;
          border: 1px solid rgba(59, 130, 246, 0.2);
          min-width: 70px;
          text-align: center;
          gap: 4px;
        }

        .et-row {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.2s ease;
          margin-bottom: 12px;
        }

        .et-row:hover {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .et-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 8px;
        }

        .et-pill {
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          border: 1px solid transparent;
        }

        .et-pill-reason {
          background: rgba(255, 255, 255, 0.05);
          color: #cbd5e1;
          border-color: rgba(255, 255, 255, 0.1);
        }
        .et-pill-warn {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border-color: rgba(245, 158, 11, 0.2);
        }
        .et-pill-ok {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border-color: rgba(16, 185, 129, 0.2);
        }
        .et-pill-time {
          background: rgba(59, 130, 246, 0.1);
          color: #60a5fa;
          border-color: rgba(59, 130, 246, 0.2);
        }

        .et-meta {
          font-size: 12px;
          color: #9dc9f5;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .et-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .et-btn {
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: 0.2s;
          border: 1px solid transparent;
        }

        .et-btn-primary {
          background: #3b82f6;
          color: white;
        }
        .et-btn-primary:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
        }
        .et-btn-ghost {
          background: rgba(255, 255, 255, 0.05);
          color: #94a3b8;
          border-color: rgba(255, 255, 255, 0.1);
        }
        .et-btn-ghost:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        .et-btn:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }

        @media (min-width: 780px) {
          .et-row {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          .et-actions {
            min-width: 280px;
          }
        }
      `}</style>

      <div className="et-header">
        <div className="et-title-wrap">
          <div className="et-title">Etterregistrering</div>
          <div className="et-subtitle">
            Mangler driftsdata bør legges inn fortløpende.
          </div>
        </div>

        <div className="et-badge">
          <span className={`et-dot ${isFetching ? "fetching" : ""}`} />
          {isFetching ? "Synkroniserer" : "Klar"}
        </div>
      </div>

      <div className="et-list">
        {rows.map((row) => {
          const manglerDriftsdata = row._count.runLogs === 0;
          const duration = row.removedAt
            ? formatDuration(
                row.removedAt.getTime() - row.installedAt.getTime(),
              )
            : null;

          return (
            <div key={row.id} className="et-row">
              <div className="et-main">
                <div className="et-info-line">
                  <div className="et-main-id">
                    <span style={{ fontSize: "9px", opacity: 0.6 }}>ID: </span>
                    {row.blade.IdNummer}
                  </div>
                  <div className="et-type-tag">
                    <span style={{ fontSize: "9px", opacity: 0.6 }}>
                      TYPE:{" "}
                    </span>
                    {row.blade.bladeType?.name ?? "Standard blad"}{" "}
                    {row.blade.side}
                  </div>
                  <div className="et-saw-tag">
                    <span style={{ fontSize: "9px", opacity: 0.6 }}>SAG:</span>
                    {row.saw.name}
                  </div>
                </div>

                <div className="et-pills">
                  {row.removedReason && (
                    <span className="et-pill et-pill-reason">
                      {row.removedReason}
                    </span>
                  )}

                  {duration && (
                    <span className="et-pill et-pill-time">⏱ {duration}</span>
                  )}
                  <span
                    className={`et-pill ${manglerDriftsdata ? "et-pill-warn" : "et-pill-ok"}`}
                  >
                    {manglerDriftsdata
                      ? "⚠️ Mangler driftsdata"
                      : "✅ Driftsdata OK"}
                  </span>
                </div>

                <div className="et-meta">
                  <span>{row.installedAt.toLocaleDateString("nb-NO")}</span>
                  <span>→</span>
                  <span>
                    {row.removedAt?.toLocaleDateString("nb-NO") ?? "Nå"}
                  </span>
                  {row.removedNote && (
                    <span style={{ fontStyle: "italic", opacity: 0.7 }}>
                      · {row.removedNote}
                    </span>
                  )}
                </div>
              </div>

              <div className="et-actions">
                <button
                  disabled={!manglerDriftsdata}
                  className="et-btn et-btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRunLog(row);
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Legg til data
                </button>

                <button
                  className="et-btn et-btn-ghost"
                  onClick={() => console.log("Rediger", row.id)}
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  Rediger
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
