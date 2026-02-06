"use client";
import React from "react";

interface MachineListProps {
  saws: Array<{
    id: string;
    name: string;
    sawType?: string | null;
    active?: boolean;
    side?: string | null;
    installs?: Array<{
      id: string;
      installedAt: Date;
      blade: {
        id: string;
        IdNummer: string;
        bladeType?: { name: string };
        side?: string | null;
      } | null;
    }>;
  }>;

  openMountModal: (saw: MachineListProps["saws"][number]) => void;
  openUninstallModal: (saw: MachineListProps["saws"][number]) => void;
  openChangeBladeModal: (saw: MachineListProps["saws"][number]) => void;
  openMoveBladeModal: (saw: MachineListProps["saws"][number]) => void;
}

function formatDateTimeNo(d: Date) {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function timeAgoFrom(date: Date, now = new Date()) {
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const totalMinutes = Math.floor(diffMs / 60000);

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
  const minutes = totalMinutes - days * 60 * 24 - hours * 60;

  if (days <= 0 && hours <= 0) return `${minutes}m`;
  if (days <= 0) return `${hours}t ${minutes}m`;
  return `${days}d ${hours}t`;
}

const MachineList: React.FC<MachineListProps> = ({
  saws,
  openMountModal,
  openUninstallModal,
  openChangeBladeModal,
  openMoveBladeModal,
}) => {
  const now = new Date();

  return (
    <div className="wrap">
      <style>{`
        :root {
          --bg-main: #0f172a;
          --panel: rgba(30, 41, 59, 0.7);
          --accent-glow: rgba(59, 130, 246, 0.5);
          --status-ok: #10b981;
          --status-bad: #ef4444;
          --text-main: #f8fafc;
          --text-muted: #94a3b8;
          --glass-border: rgba(255, 255, 255, 0.1);
        }

        .wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
          gap: 20px;
        }

        .card {
          background: var(--panel);
          backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }

        .card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-glow);
          box-shadow: 0 20px 40px -15px rgba(0,0,0,0.6);
        }

        .inner {
          padding: 24px;
        }

        .top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .name {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }
          .bladeTypeText {
          
          font-size: 12px;
          font-weight: 300;
          }

        .sub {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        /* Blinkende status-pille */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid var(--glass-border);
        }

        .dot-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
        }
        
        .dot-pulse.ok { background: var(--status-ok); }
        .dot-pulse.bad { background: var(--status-bad); }

        .dot-pulse.ok::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: var(--status-ok);
          animation: ripple 2s infinite ease-out;
        }

        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(3.5); opacity: 0; }
        }

        .bladeBox {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .bladeIcon {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bladeValue {
          font-size: 15px;
          font-weight: 700;
          color: #fff;
        }

        .bladeExtra {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 400;
        }

        .footer {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 10px;
          margin-top: auto;
        }

        .btn {
          background: #1e293b;
          border: 1px solid var(--glass-border);
          color: #cbd5e1;
          padding: 10px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .btn:hover:not(:disabled) {
          background: #334155;
          border-color: #475569;
          color: #fff;
        }

        .btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
          border: none;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
        }

        @media (max-width: 600px) {
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="grid">
        {saws.map((saw) => {
          const isActive = saw.active !== false;
          const activeInstall = saw.installs?.[0] ?? null;
          const bladeId = activeInstall?.blade?.IdNummer ?? null;
          const bladeSide = activeInstall?.blade?.side ?? null;
          const bladeType = activeInstall?.blade?.bladeType?.name ?? null;
          const hasBlade = Boolean(bladeId);

          const installedAt = activeInstall?.installedAt
            ? new Date(activeInstall.installedAt)
            : null;
          const sinceText = installedAt ? timeAgoFrom(installedAt, now) : null;
          console.log(activeInstall);

          return (
            <div key={saw.id} className="card">
              <div className="inner">
                <div className="top">
                  <div>
                    <div className="name">{saw.name}</div>
                    <div className="sub">{!isActive && "• Deaktivert"}</div>
                  </div>

                  <div className="status-badge">
                    <div className={`dot-pulse ${hasBlade ? "ok" : "bad"}`} />
                    <span
                      style={{
                        color: hasBlade
                          ? "var(--status-ok)"
                          : "var(--text-muted)",
                      }}
                    >
                      {hasBlade ? "I DRIFT" : "LEDIG"}
                    </span>
                  </div>
                </div>

                <div className="bladeBox">
                  <div className="bladeIcon">🛠️</div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      Montert verktøy
                    </div>
                    <div className="bladeValue">
                      {hasBlade ? (
                        <>
                          ID: {bladeId}
                          <p className="bladeTypeText">
                            {bladeType} {bladeSide && bladeSide}
                          </p>
                          {installedAt ? (
                            <div className="bladeExtra text-sm leading-tight">
                              <div>
                                {installedAt.toLocaleString("nb-NO", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              <div className="text-muted-foreground">
                                {sinceText} siden
                              </div>
                            </div>
                          ) : (
                            "—"
                          )}
                        </>
                      ) : (
                        "Ingen aktive blad"
                      )}
                    </div>
                  </div>
                </div>
                <hr />
                <div className="footer">
                  <button
                    className="btn btn-primary"
                    onClick={() => openMountModal(saw)}
                    disabled={hasBlade}
                  >
                    🚀 Monter
                  </button>

                  <button
                    className="btn"
                    disabled={!hasBlade}
                    onClick={() => openUninstallModal(saw)}
                  >
                    🛑 Demonter
                  </button>

                  <button
                    className="btn"
                    onClick={() => openChangeBladeModal(saw)}
                    disabled={!hasBlade}
                  >
                    🔄 Bytte
                  </button>

                  <button
                    className="btn"
                    onClick={() => openMoveBladeModal(saw)}
                    disabled={!hasBlade}
                  >
                    🚛 Flytt
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MachineList;
