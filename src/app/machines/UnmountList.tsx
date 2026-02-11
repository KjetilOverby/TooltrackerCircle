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
  rows: RecentInstall[]; // Bruk den automatiske typen
  isFetching: boolean;
  onEdit?: (row: RecentInstall) => void; // Bruk den automatiske typen
};

const UnmountList: React.FC<Props> = ({ rows, isFetching, onEdit }) => {
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
          /* Justert grid for å gi plass til knapper på høyre side */
          grid-template-columns: 1fr auto auto; 
          gap: 16px;
          align-items: center;
          transition: all 0.2s ease;
        }
        .logItem:hover {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(59, 130, 246, 0.3);
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
        .pillReason { background: rgba(255, 255, 255, 0.1); color: #e2e8f0; border: 1px solid rgba(255, 255, 255, 0.1); }
        .pillWarn { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
        .pillOk { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
        
        .statusSide {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          min-width: 100px;
        }
        .durationBox {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 8px;
          border-radius: 6px;
        }

        /* --- NYE KNAPP-STILER --- */
        .actionButtons {
          display: flex;
          gap: 8px;
          padding-left: 12px;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }
        .btnAction {
          cursor: pointer;
          border: none;
          border-radius: 8px;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: #cbd5e1;
          background: rgba(255, 255, 255, 0.05);
        }
        .btnEdit:hover {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }
        .btnDelete:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }
        /* ----------------------- */

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
          const installedDate = new Date(row.installedAt);
          const removedDate = row.removedAt ? new Date(row.removedAt) : null;
          const manglerDriftsdata = !row.runLog;
          const duration = removedDate
            ? formatDuration(removedDate.getTime() - installedDate.getTime())
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
                      📅{" "}
                      {installedDate.toLocaleString("nb-NO", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                    <span>→</span>
                    <span>
                      {removedDate
                        ? removedDate.toLocaleString("nb-NO", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "—"}
                    </span>
                  </div>
                  <div
                    className="metaItem"
                    style={{ color: row.removedNote ? "#d9dbdb" : "#9ca3af" }}
                  >
                    {row.removedNote ?? "Demontert"}
                  </div>
                </div>
              </div>

              <div className="statusSide">
                <div className="durationBox">⏱ {duration}</div>
                <span
                  className={`pill ${manglerDriftsdata ? "pillWarn" : "pillOk"}`}
                >
                  {manglerDriftsdata
                    ? "⚠️ Ingen logg"
                    : `✅ ${row.runLog?.stokkAnt ?? 0} stk`}
                </span>
              </div>

              {/* HANDLINGS-KNAPPER */}
              <div className="actionButtons">
                <button
                  onClick={() => onEdit && onEdit(row)}
                  title="Rediger"
                  className="btnAction btnEdit"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </button>
                <button title="Slett" className="btnAction btnDelete">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
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
