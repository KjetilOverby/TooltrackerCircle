import React, { useState } from "react";
import RunLogCard from "./RunLogCard";
// import RunLogCard from "./RunLogCard"; // Antas tilgjengelig

// --- TYPER (uendret) ---
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
    services?: {
      id: string;
      serviceType: string | null;
      datoUt?: Date | null; // Legg til denne i typen
    }[];
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
  return hours <= 0 ? `${minutes}m` : `${hours}t ${minutes}m`;
}

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
        <div
          className={`et-status-badge ${isFetching ? "is-fetching" : "is-synced"}`}
        >
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
            <div
              key={row.id}
              className={`et-card ${isOpen ? "is-open" : ""} ${hasRunLog ? "has-data" : "needs-data"}`}
            >
              <div className="et-card-content">
                {/* Øverste del: Identitet og Status */}
                <div className="et-card-top">
                  <div className="et-blade-info">
                    <span className="et-saw-tag">{row.saw.name}</span>
                    <h3 className="et-blade-id">#{row.blade.IdNummer}</h3>
                    <span className="et-blade-meta">
                      {row.blade.bladeType?.name ?? "Standard"} •{" "}
                      {row.blade.side ?? "Senter"}
                    </span>
                  </div>

                  <div className="et-status-pills">
                    {duration && (
                      <span className="pill pill-time">⏱ {duration}</span>
                    )}
                    {/* 👇 NY SERVICE-BADGE */}
                    {row.blade.services && row.blade.services.length > 0 && (
                      <span className="pill pill-service">
                        🔧 {row.blade.services[0]?.serviceType}
                      </span>
                    )}
                    <span
                      className={`pill ${hasRunLog ? "pill-success" : "pill-warning"}`}
                    >
                      {hasRunLog ? "● Fullført" : "● Mangler data"}
                    </span>
                  </div>
                </div>

                {/* Midtre del: Tidslinje og Årsak */}
                <div className="et-card-mid">
                  <div className="et-timeline">
                    <div className="time-point">
                      <span className="time-label">Montert</span>
                      <span className="time-val">
                        {row.installedAt.toLocaleString("nb-NO", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="time-connector">
                      <div className="connector-line"></div>
                      {row.removedReason && (
                        <span className="reason-tag">{row.removedReason}</span>
                      )}
                    </div>
                    <div className="time-point">
                      <span className="time-label">Tatt ut</span>
                      <span className="time-val">
                        {row.removedAt
                          ? row.removedAt.toLocaleString("nb-NO", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "I drift"}
                      </span>
                    </div>
                  </div>

                  <div className="et-card-actions">
                    {!hasRunLog ? (
                      <button
                        className="btn-primary"
                        onClick={() => onRunLog(row)}
                      >
                        Registrer data
                      </button>
                    ) : (
                      <button
                        className="btn-outline"
                        onClick={() => setOpenId(isOpen ? null : row.id)}
                      >
                        {isOpen ? "Lukk" : "Se detaljer"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isOpen && row.runLog && (
                <div className="et-expand-area">
                  {/* Fjern kommentarene rundt RunLogCard under for at data skal vises: */}
                  <RunLogCard log={row.runLog} onEdit={() => onRunLog(row)} />

                  {/* Du kan fjerne denne div-en når RunLogCard er aktiv */}
                  <div
                    className="debug-placeholder"
                    style={{ marginTop: "10px", fontSize: "11px" }}
                  >
                    Viser nå detaljert logg for {row.blade.IdNummer}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .pill-service {
          background: #fdf2f8; /* Lys rosa/lilla */
          color: #9d174d; /* Mørk lilla tekst */
          border: 1px solid #fbcfe8;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Gjør suksess-pillen litt mer diskret hvis det er mange piller */
        .pill-success {
          background: #f0fdf4;
          color: #15803d;
          border: 1px solid #dcfce7;
        }
        :root {
          --primary: #2563eb;
          --primary-hover: #1d4ed8;
          --bg-main: #f8fafc;
          --card-bg: #ffffff;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --border-color: #e2e8f0;
          --success: #10b981;
          --warning: #f59e0b;
        }

        .et-container {
          font-family:
            system-ui,
            -apple-system,
            sans-serif;
          max-width: 900px;
          margin: 2rem auto;
          padding: 0 1rem;
        }

        .et-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .et-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
          letter-spacing: -0.02em;
        }

        .et-subtitle {
          color: var(--text-muted);
          font-size: 14px;
          margin: 4px 0 0;
        }

        .et-status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 600;
        }

        .is-synced {
          background: #ecfdf5;
          color: var(--success);
        }
        .is-fetching {
          background: #fffbeb;
          color: var(--warning);
        }

        .et-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
        }

        .et-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Card Styling */
        .et-card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
          overflow: hidden;
        }

        .et-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border-color: #cbd5e1;
        }

        .et-card.needs-data {
          border-left: 4px solid var(--warning);
        }
        .et-card.has-data {
          border-left: 4px solid var(--success);
        }

        .et-card-content {
          padding: 20px;
        }

        .et-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .et-saw-tag {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--primary);
          background: #eff6ff;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .et-blade-id {
          margin: 4px 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
        }

        .et-blade-meta {
          font-size: 13px;
          color: var(--text-muted);
        }

        .et-status-pills {
          display: flex;
          gap: 8px;
        }

        .pill {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }
        .pill-time {
          background: #f1f5f9;
          color: var(--text-main);
        }
        .pill-warning {
          background: #fff7ed;
          color: #c2410c;
        }
        .pill-success {
          background: #f0fdf4;
          color: #15803d;
        }

        /* Timeline Section */
        .et-card-mid {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
        }

        .et-timeline {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
        }

        .time-point {
          display: flex;
          flex-direction: column;
        }
        .time-label {
          font-size: 10px;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 700;
        }
        .time-val {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
        }

        .time-connector {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 100px;
          position: relative;
        }

        .connector-line {
          height: 2px;
          background: #e2e8f0;
          width: 100%;
          position: absolute;
          top: 50%;
          z-index: 1;
        }

        .reason-tag {
          position: relative;
          z-index: 2;
          background: white;
          border: 1px solid var(--border-color);
          padding: 2px 10px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        /* Buttons */
        .btn-primary {
          background: var(--primary);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-primary:hover {
          background: var(--primary-hover);
        }

        .btn-outline {
          background: white;
          color: var(--text-main);
          border: 1px solid var(--border-color);
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
        }
        .btn-outline:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .et-expand-area {
          padding: 20px;
          border-top: 1px solid var(--border-color);
          background: #ffffff;
        }

        .debug-placeholder {
          color: var(--text-muted);
          font-style: italic;
          font-size: 13px;
        }
      `}</style>
    </section>
  );
};

export default EtterregistreringList;
