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
        .wrap {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 24px;
        }

        .card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.1);
          border-color: #cbd5e1;
        }

        /* Status-striper på venstre side */
        .card::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 8px;
        }

        .card.is-active::before { background: #10b981; }
        .card.is-empty::before { background: #FA8072; border-right: 1px dashed #cbd5e1; }
        .card.is-disabled::before { background: #ef4444; }

        .inner {
          padding: 24px;
          padding-left: 32px; /* Plass til stripen */
        }

        .top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .name {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .sub {
          font-size: 13px;
          color: #64748b;
          font-weight: 600;
          margin-top: 2px;
        }

        /* Status-pille */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .dot.ok { 
          background: #10b981; 
          box-shadow: 0 0 8px #10b981;
          animation: pulse-green 2s infinite;
        }
        .dot.bad { background: #94a3b8; }

        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .bladeBox {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
          min-height: 100px;
        }

        .bladeIcon {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #1e293b;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .bladeLabel {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .bladeValue {
          font-size: 16px;
          font-weight: 800;
          color: #1e293b;
        }

        .bladeMeta {
          font-size: 12px;
          color: #64748b;
          margin-top: 6px;
          line-height: 1.5;
        }

        .time-pill {
          display: inline-block;
          background: #eff6ff;
          color: #2563eb;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 700;
          margin-top: 4px;
        }

        .footer {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          padding: 16px 24px 24px 32px;
          background: #fafafa;
          border-top: 1px solid #f1f5f9;
        }

        .btn {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #475569;
          height: 40px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
        }

        .btn:hover:not(:disabled) {
          border-color: #cbd5e1;
          background: #f8fafc;
          color: #0f172a;
        }

        .btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          filter: grayscale(1);
        }

        .btn-primary {
          background: #2563eb;
          color: white;
          border: none;
        }

        .btn-primary:hover:not(:disabled) {
          background: #1d4ed8;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .empty-text {
          color: #94a3b8;
          font-style: italic;
          font-size: 14px;
        }

        @media (max-width: 500px) {
          .grid { grid-template-columns: 1fr; }
          .footer { grid-template-columns: 1fr 1fr; }
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

          // Bestem CSS klasse for kortet
          let statusClass = "is-empty";
          if (!isActive) statusClass = "is-disabled";
          else if (hasBlade) statusClass = "is-active";

          return (
            <div key={saw.id} className={`card ${statusClass}`}>
              <div className="inner">
                <div className="top">
                  <div>
                    <div className="name">{saw.name}</div>
                    <div className="sub">{saw.sawType ?? "Sagemaskin"}</div>
                  </div>

                  <div className="status-badge">
                    <div className={`dot ${hasBlade ? "ok" : "bad"}`} />
                    <span>{hasBlade ? "I drift" : "Ledig"}</span>
                  </div>
                </div>

                <div className="bladeBox">
                  <div className="bladeIcon">{hasBlade ? "⚙️" : "⚪"}</div>
                  <div style={{ flex: 1 }}>
                    <div className="bladeLabel">Montert verktøy</div>
                    {hasBlade ? (
                      <div>
                        <div className="bladeValue">#{bladeId}</div>
                        <div className="bladeMeta">
                          <strong>{bladeType}</strong>{" "}
                          {bladeSide ? `(${bladeSide})` : ""}
                          {installedAt && (
                            <div className="time-info">
                              Satt inn:{" "}
                              {installedAt.toLocaleDateString("nb-NO", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              <br />
                              <span className="time-pill">
                                ⏳ {timeAgoFrom(installedAt, now)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="empty-text">Klar for montering...</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="footer">
                <button
                  className="btn btn-primary"
                  onClick={() => openMountModal(saw)}
                  disabled={hasBlade || !isActive}
                >
                  <span>🚀</span>
                  Monter
                </button>

                <button
                  className="btn"
                  disabled={!hasBlade}
                  onClick={() => openUninstallModal(saw)}
                >
                  <span>🛑</span>
                  Ta ut
                </button>

                <button
                  className="btn"
                  onClick={() => openChangeBladeModal(saw)}
                  disabled={!hasBlade}
                >
                  <span>🔄</span>
                  Bytte
                </button>

                <button
                  className="btn"
                  onClick={() => openMoveBladeModal(saw)}
                  disabled={!hasBlade}
                >
                  <span>🚛</span>
                  Flytt
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MachineList;
