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
    { label: "Temp", value: log.temperatur, unit: "°", emoji: "🌡️" },
    { label: "Stokk", value: log.stokkAnt, unit: "", emoji: "🪵" },
    { label: "Strøm", value: log.ampere, unit: "A", emoji: "⚡" },
  ].filter((m) => typeof m.value === "number");

  return (
    <div className="rl-card">
      <div className="rl-header">
        <span className="rl-time">{fmtDateTime(log.loggedAt)}</span>
        <button
          type="button"
          className="rl-edit-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          Rediger
        </button>
      </div>

      <div className="rl-grid">
        {metrics.map((m, i) => (
          <div key={i} className="rl-chip">
            <span className="rl-emoji">{m.emoji}</span>
            <span className="rl-value">
              {Math.round(m.value!)}
              {m.unit}
            </span>
          </div>
        ))}

        {log.feilkode && (
          <div className="rl-chip rl-error">
            <span className="rl-emoji">⚠️</span>
            <span className="rl-value">{log.feilkode}</span>
          </div>
        )}
      </div>

      {log.alt && (
        <div className="rl-note">
          <span className="rl-note-icon">💬</span>
          <p>{log.alt}</p>
        </div>
      )}

      <style>{`
        .rl-card {
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6));
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 16px;
          color: #f8fafc;
          transition: transform 0.2s ease, border-color 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .rl-card:hover {
          border-color: rgba(147, 197, 253, 0.3);
          transform: translateY(-2px);
        }

        .rl-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 8px;
        }

        .rl-time {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .rl-edit-btn {
          background: rgba(148, 163, 184, 0.1);
          border: none;
          color: #93c5fd;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .rl-edit-btn:hover {
          background: rgba(147, 197, 253, 0.2);
        }

        .rl-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .rl-chip {
          background: rgba(255, 255, 255, 0.05);
          padding: 6px 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(255, 255, 255, 0.03);
        }

        .rl-error {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .rl-emoji {
          font-size: 14px;
        }

        .rl-value {
          font-size: 13px;
          font-weight: 600;
          color: #e2e8f0;
        }

        .rl-note {
          background: rgba(0, 0, 0, 0.2);
          padding: 10px;
          border-radius: 10px;
          font-size: 13px;
          color: #cbd5e1;
          display: flex;
          gap: 8px;
          line-height: 1.4;
        }

        .rl-note p {
          margin: 0;
          font-style: italic;
        }

        .rl-note-icon {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default RunLogCard;
