"use client";
import React from "react";

function formatDuration(ms: number) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}t ${minutes}m`;
}

type RecentRow = {
  id: string;
  saw: { id: string; name: string };
  blade: { id: string; IdNummer: string };
  installedAt: Date;
  removedAt: Date | null;
  removedReason: string | null;
  removedNote: string | null;
  _count: {
    runLogs: number;
  };
};

type Props = {
  rows: RecentRow[];
  isFetching: boolean;
};

const UnmountList: React.FC<Props> = ({ rows, isFetching }) => {
  if (!rows.length) return null;

  return (
    <div className="logWrap">
      <style>{`
        .logWrap {
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 24px;
          margin-top: 3rem;
          color: #f8fafc;
        }

        .logHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding: 0 4px;
        }

        .logTitle {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logTitle::before {
          content: "";
          width: 4px;
          height: 18px;
          background: #3b82f6;
          border-radius: 4px;
        }

        .logList {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .logItem {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 16px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          transition: all 0.2s ease;
        }

        .logItem:hover {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(59, 130, 246, 0.3);
          transform: translateX(4px);
        }

        .logMain {
          font-size: 15px;
          line-height: 1.4;
        }

        .bladeId {
          color: #2e665c;
          font-weight: 800;
          background: #5fcfbb;
          padding: 2px 6px;
          border-radius: 6px;
        }

        .sawName {
          color: #f1f5f9;
          font-weight: 600;
        }

        .logMeta {
          margin-top: 8px;
          font-size: 12px;
          color: #d9dbdb;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }

        .metaItem {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* 🔖 Pills */
        .pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .pillReason {
          background: rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .pillWarn {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .pillOk {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .statusSide {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          gap: 8px;
        }

        .durationBox {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 8px;
          border-radius: 6px;
        }

        .isFetching {
          animation: pulse 1.5s infinite;
          font-size: 12px;
          color: #3b82f6;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <div className="logHeader">
        <div className="logTitle">Siste demonteringer</div>
        {isFetching && <div className="isFetching">Oppdaterer logg...</div>}
      </div>

      <div className="logList">
        {rows.map((row) => {
          const manglerDriftsdata = row._count.runLogs === 0;
          const duration = row.removedAt
            ? formatDuration(
                row.removedAt.getTime() - row.installedAt.getTime(),
              )
            : "—";

          return (
            <div key={row.id} className="logItem">
              <div className="logInfo">
                <div className="logMain">
                  Blad <span className="bladeId">{row.blade.IdNummer}</span> fra{" "}
                  <span className="sawName">{row.saw.name}</span>
                  {row.removedReason && (
                    <span
                      style={{ marginLeft: "8px" }}
                      className="pill pillReason"
                    >
                      {row.removedReason}
                    </span>
                  )}
                </div>

                <div className="logMeta">
                  <div className="metaItem">
                    <span>
                      📅 {row.installedAt.toLocaleDateString("nb-NO")}
                    </span>
                    <span>→</span>
                    <span>{row.removedAt?.toLocaleDateString("nb-NO")}</span>
                  </div>
                  {row.removedNote ? (
                    <div className="metaItem" style={{ color: "#d9dbdb" }}>
                      {row.removedNote}
                    </div>
                  ) : (
                    "Demontert"
                  )}
                </div>
              </div>

              <div className="statusSide">
                <div className="durationBox">⏱ {duration}</div>
                <span
                  className={`pill ${manglerDriftsdata ? "pillWarn" : "pillOk"}`}
                >
                  {manglerDriftsdata
                    ? "⚠️ Mangler driftsdata"
                    : "✅ Driftsdata OK"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UnmountList;
