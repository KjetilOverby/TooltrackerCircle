"use client";
import React from "react";
import { type RouterOutputs } from "~/trpc/react";

type RecentInstall = RouterOutputs["bladeInstall"]["recent"][number];

function formatDuration(ms: number) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}t ${minutes}m`;
}

type Props = {
  rows: RecentInstall[];
  isFetching: boolean;
  onEdit?: (row: RecentInstall) => void;
  onDelete?: (row: RecentInstall) => void;
};

const UnmountList: React.FC<Props> = ({
  rows,
  isFetching,
  onEdit,
  onDelete,
}) => {
  if (!rows.length) return null;

  return (
    <div className="logWrap">
      <style>{`
        .logWrap {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px;
          margin-top: 2rem;
          color: #1e293b;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        .logHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .logTitle {
          font-size: 19px;
          font-weight: 800;
          color: #0f172a;
        }
        .logList {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .logItem {
          position: relative;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 16px 16px 20px; /* Mer padding til venstre for fargestripe */
          display: grid;
          grid-template-columns: 1fr auto auto; 
          gap: 20px;
          align-items: center;
          transition: all 0.2s ease;
          overflow: hidden;
        }

        /* VENSTRE FARGEKANT */
        .logItem::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 6px;
          transition: width 0.2s ease;
        }

        /* VARIANT: MANGLER DATA */
        .logItem.mangler {
          border-color: #fed7aa;
          background: #fffcf9;
        }
        .logItem.mangler::before {
          background: #f59e0b;
        }

        /* VARIANT: OK */
        .logItem.ok {
          border-color: #e2e8f0;
        }
        .logItem.ok::before {
          background: #10b981;
        }

        .logItem:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .logMain {
          font-size: 15px;
          line-height: 1.4;
        }
        .bladeId {
          color: #2563eb;
          font-weight: 800;
          background: #eff6ff;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .sawName {
          color: #1e293b;
          font-weight: 700;
        }
        .logMeta {
          margin-top: 10px;
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .metaTime {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .statusSide {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }
        .durationBadge {
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          background: #f1f5f9;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .pillStatus {
          font-size: 11px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
        }
        .pillStatus.warn { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
        .pillStatus.ok { background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }

        .actionButtons {
          display: flex;
          gap: 6px;
          padding-left: 16px;
          border-left: 1px solid #e2e8f0;
        }
        .btnSmall {
          cursor: pointer;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px;
          background: white;
          color: #94a3b8;
          transition: all 0.2s;
        }
        .btnSmall:hover { background: #f8fafc; color: #1e293b; }
        .btnDelete:hover { border-color: #fecaca; color: #dc2626; background: #fef2f2; }

        .isFetching {
          font-size: 13px;
          font-weight: 700;
          color: #2563eb;
          background: #eff6ff;
          padding: 4px 12px;
          border-radius: 20px;
        }
      `}</style>

      <div className="logHeader">
        <div className="logTitle">Siste demonteringer</div>
        {isFetching && <div className="isFetching">🔄 Oppdaterer...</div>}
      </div>

      <div className="logList">
        {rows.map((row) => {
          const hasLog = !!row.runLog;
          const installedDate = new Date(row.installedAt);
          const removedDate = row.removedAt ? new Date(row.removedAt) : null;
          const duration = removedDate
            ? formatDuration(removedDate.getTime() - installedDate.getTime())
            : "—";

          return (
            <div
              key={row.id}
              className={`logItem ${hasLog ? "ok" : "mangler"}`}
            >
              <div className="logInfo">
                <div className="logMain">
                  <span className="sawName">{row.saw.name}</span>
                  <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
                  <span className="bladeId">#{row.blade.IdNummer}</span>
                  {row.removedReason && (
                    <span
                      style={{
                        marginLeft: "12px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#64748b",
                        background: "#f1f5f9",
                        padding: "2px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      {row.removedReason}
                    </span>
                  )}
                </div>

                <div className="logMeta">
                  <div className="metaTime">
                    <span>
                      {installedDate.toLocaleDateString("nb-NO", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                    <span style={{ color: "#cbd5e1" }}>→</span>
                    <span>
                      {removedDate?.toLocaleDateString("nb-NO", {
                        day: "2-digit",
                        month: "short",
                      }) ?? "Aktiv"}
                    </span>
                  </div>
                  {row.removedNote && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                        fontStyle: "italic",
                      }}
                    >
                      {row.removedNote}
                    </div>
                  )}
                </div>
              </div>

              <div className="statusSide">
                <div className="durationBadge">⏱ {duration}</div>
                <div className={`pillStatus ${hasLog ? "ok" : "warn"}`}>
                  {hasLog
                    ? `✅ ${row.runLog?.stokkAnt ?? 0} stk`
                    : "⚠️ Mangler data"}
                </div>
              </div>

              <div className="actionButtons">
                <button className="btnSmall" onClick={() => onEdit?.(row)}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </button>
                <button
                  className="btnSmall btnDelete"
                  onClick={() => onDelete?.(row)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UnmountList;
