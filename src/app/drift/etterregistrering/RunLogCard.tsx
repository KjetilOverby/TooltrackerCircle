import React from "react";

function fmtDateTime(d: Date) {
  return `${d.toLocaleDateString("nb-NO")} kl. ${d.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

type RunLog = {
  id: string;
  loggedAt: Date;
  sagtid: number | null;
  feilkode: string | null;
  temperatur: number | null;
  stokkAnt: number | null;
  ampere: number | null;
  alt: string | null;
};

type Props = {
  log: RunLog;
  onEdit: () => void;
};

const RunLogCard: React.FC<Props> = ({ onEdit, log }) => {
  const metrics = [
    { label: "Sagtid", value: log.sagtid, unit: "t", emoji: "⏱️" },
    { label: "Temp", value: log.temperatur, unit: "°C", emoji: "🌡️" },
    { label: "Stokk", value: log.stokkAnt, unit: "stk", emoji: "🪵" },
    { label: "Strøm", value: log.ampere, unit: "A", emoji: "⚡" },
  ].filter((m) => typeof m.value === "number");

  return (
    <div className="rl-card">
      <div className="rl-header">
        <div className="rl-title-group">
          <span className="rl-dot-indicator"></span>
          <span className="rl-time">{fmtDateTime(log.loggedAt)}</span>
        </div>
        <button
          type="button"
          className="rl-edit-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          Rediger data
        </button>
      </div>

      <div className="rl-grid">
        {metrics.map((m, i) => (
          <div key={i} className="rl-chip">
            <span className="rl-chip-label">{m.label}</span>
            <div className="rl-chip-content">
              <span className="rl-emoji">{m.emoji}</span>
              <span className="rl-value">
                {Math.round(m.value!)}
                <small className="rl-unit">{m.unit}</small>
              </span>
            </div>
          </div>
        ))}

        {log.feilkode && (
          <div className="rl-chip rl-error">
            <span className="rl-chip-label">Status</span>
            <div className="rl-chip-content">
              <span className="rl-emoji">⚠️</span>
              <span className="rl-value">{log.feilkode}</span>
            </div>
          </div>
        )}
      </div>

      {log.alt && (
        <div className="rl-note">
          <div className="rl-note-header">
            <span className="rl-note-icon">💬</span>
            <span className="rl-note-label">Kommentar</span>
          </div>
          <p>{log.alt}</p>
        </div>
      )}

      <style>{`
        .rl-card {
          background: #ffffff;
          border: 1px dashed #cbd5e1;
          border-radius: 12px;
          padding: 16px;
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .rl-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .rl-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rl-dot-indicator {
          width: 6px;
          height: 6px;
          background: #3b82f6;
          border-radius: 50%;
        }

        .rl-time {
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
        }

        .rl-edit-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #1e293b;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .rl-edit-btn:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
        }

        .rl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 10px;
        }

        .rl-chip {
          background: #f8fafc;
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .rl-chip-label {
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .rl-chip-content {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .rl-error {
          background: #fef2f2;
          border-color: #fee2e2;
        }

        .rl-error .rl-value {
          color: #b91c1c;
        }

        .rl-emoji {
          font-size: 14px;
        }

        .rl-value {
          font-size: 15px;
          font-weight: 800;
          color: #1e293b;
        }

        .rl-unit {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          margin-left: 2px;
        }

        .rl-note {
          background: #fdfcfb;
          border-left: 3px solid #e2e8f0;
          padding: 12px;
          border-radius: 4px 8px 8px 4px;
        }

        .rl-note-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .rl-note-label {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .rl-note p {
          margin: 0;
          font-size: 13px;
          color: #475569;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default RunLogCard;
