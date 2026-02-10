import React, { useState } from "react";
import RunLogCard from "./RunLogCard";

// --- TYPER ---
export type RunLog = {
  id: string;
  loggedAt: Date;
  sagtid: number | null;
  feilkode: string | null;
  temperatur: number | null;
  stokkAnt: number | null;
  ampere: number | null;
  alt: string | null;
  createdById?: string | null;
};

export type UnmountRow = {
  id: string;
  saw: { name: string };
  blade: {
    IdNummer: string;
    bladeType?: { name: string };
    side: string | null;
  };
  installedAt: Date;
  removedAt: Date | null;
  removedReason: string | null;
  removedNote: string | null;
  runLog: RunLog | null;
};

type Props<T extends UnmountRow> = {
  rows: T[];
  isFetching: boolean;
  onRunLog: (row: T) => void;
};

// --- HJELPEFUNKSJONER ---
function formatDuration(ms: number) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}t ${minutes}m`;
}

// --- KOMPONENT ---
const EtterregistreringList = <T extends UnmountRow>({
  rows,
  isFetching,
  onRunLog,
}: Props<T>) => {
  const [openId, setOpenId] = useState<string | null>(null);

  if (rows.length === 0) return null;

  return (
    <section className="et-container">
      <header className="et-header">
        <div>
          <h2 className="et-title">Etterregistrering</h2>
          <p className="et-subtitle">Venter på driftsdata fra saglinjen</p>
        </div>
        <div className={`et-status-badge ${isFetching ? "is-fetching" : ""}`}>
          <span className="et-dot" />
          {isFetching ? "Oppdaterer..." : "Alt er synkronisert"}
        </div>
      </header>

      <div className="et-list">
        {rows.map((row) => {
          const isOpen = openId === row.id;
          const hasRunLog = Boolean(row.runLog);
          const duration = row.removedAt
            ? formatDuration(
                row.removedAt.getTime() - row.installedAt.getTime(),
              )
            : null;

          return (
            <div key={row.id} className={`et-row ${isOpen ? "is-open" : ""}`}>
              <div className="et-row-content">
                <div className="et-row-header">
                  <div className="et-identity">
                    <span className="et-saw-name">{row.saw.name}</span>
                    <span className="et-separator">/</span>
                    <span className="et-blade-id">{row.blade.IdNummer}</span>
                    <span className="et-blade-type">
                      {row.blade.bladeType?.name ?? "Standard"}{" "}
                      {row.blade.side ?? ""}
                    </span>
                  </div>

                  <div className="et-status-group">
                    {duration && (
                      <span className="et-stat-pill">⏱️ {duration}</span>
                    )}
                    <span
                      className={`et-status-pill ${hasRunLog ? "is-ok" : "is-warn"}`}
                    >
                      {hasRunLog ? "✓ Registrert" : "⚠️ Mangler data"}
                    </span>
                  </div>
                </div>

                <div className="et-row-body">
                  <div className="et-time-info">
                    <div className="et-time-block">
                      <span className="et-label">Montert</span>
                      <span className="et-val">
                        {row.installedAt.toLocaleDateString("nb-NO")}{" "}
                        {row.installedAt.toLocaleTimeString("nb-NO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="et-time-arrow">→</div>
                    <div className="et-time-block">
                      <span className="et-label">Tatt ut</span>
                      <span className="et-val">
                        {row.removedAt
                          ? `${row.removedAt.toLocaleDateString("nb-NO")} ${row.removedAt.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`
                          : "I drift"}
                      </span>
                    </div>
                  </div>

                  <div className="et-actions">
                    {!hasRunLog ? (
                      <button
                        className="et-main-btn"
                        onClick={() => onRunLog(row)}
                      >
                        Legg til driftsdata
                      </button>
                    ) : (
                      <button
                        className="et-ghost-btn"
                        onClick={() => setOpenId(isOpen ? null : row.id)}
                      >
                        {isOpen ? "Skjul detaljer" : "Vis detaljer"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isOpen && row.runLog && (
                <div className="et-expand-panel">
                  <RunLogCard log={row.runLog} onEdit={() => onRunLog(row)} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        /* ... (Samme CSS som i forrige svar) ... */
        .et-container {
          margin: 2rem 0;
        }
        .et-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 20px;
        }
        .et-title {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
          color: rgba(30, 41, 59, 0.8);;
        }
        .et-subtitle {
          margin: 4px 0 0;
          font-size: 14px;
          color: #64748b;
        }
        .et-status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          padding: 6px 12px;
          border-radius: 99px;
        }
        .et-status-badge.is-fetching {
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
        }
        .et-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }
        .et-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .et-row {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          transition: all 0.2s ease;
        }
        .et-row:hover {
          border-color: rgba(59, 130, 246, 0.4);
          background: rgba(30, 41, 59, 0.8);
        }
        .et-row-content {
          padding: 16px;
        }
        .et-row-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .et-identity {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .et-saw-name {
          color: #fff;
          font-weight: 700;
          font-size: 15px;
        }
        .et-separator {
          color: #475569;
        }
        .et-blade-id {
          color: #93c5fd;
          font-weight: 600;
          background: rgba(59, 130, 246, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .et-blade-type {
          color: #94a3b8;
          font-size: 13px;
        }
        .et-status-group {
          display: flex;
          gap: 8px;
        }
        .et-stat-pill {
          font-size: 11px;
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 8px;
          border-radius: 6px;
        }
        .et-status-pill {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .et-status-pill.is-warn {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
        }
        .et-status-pill.is-ok {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
        }
        .et-row-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0, 0, 0, 0.2);
          padding: 12px;
          border-radius: 12px;
        }
        .et-time-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .et-time-block {
          display: flex;
          flex-direction: column;
        }
        .et-label {
          font-size: 10px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 700;
        }
        .et-val {
          font-size: 13px;
          color: #cbd5e1;
        }
        .et-time-arrow {
          color: #475569;
          font-weight: bold;
        }
        .et-main-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
        }
        .et-ghost-btn {
          background: transparent;
          color: #94a3b8;
          border: 1px solid #475569;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
        }
        .et-expand-panel {
          padding: 0 16px 16px;
        }
      `}</style>
    </section>
  );
};

export default EtterregistreringList;
