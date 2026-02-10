import React from "react";

function fmtDateTime(d: Date) {
  return `${d.toLocaleDateString("nb-NO")} ${d.toLocaleTimeString("nb-NO", {
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
  const parts: string[] = [];

  if (typeof log.sagtid === "number")
    parts.push(`⏱ ${Math.round(log.sagtid)}t`);
  if (typeof log.temperatur === "number") parts.push(`🌡 ${log.temperatur}°`);
  if (typeof log.stokkAnt === "number") parts.push(`🪵 ${log.stokkAnt}`);
  if (typeof log.ampere === "number") parts.push(`⚡ ${log.ampere}`);
  if (log.feilkode) parts.push(`⚠️ ${log.feilkode}`);

  return (
    <div className="rl-item">
      <div className="rl-top">
        <div className="rl-time">{fmtDateTime(log.loggedAt)}</div>
        <div className="rl-metrics">
          {parts.length ? parts.join(" · ") : "—"}
        </div>
      </div>

      {log.alt ? <div className="rl-note">{log.alt}</div> : null}

      <button
        type="button"
        className="rl-edit"
        onClick={(e) => {
          e.stopPropagation(); // viktig hvis kortet ligger i klikkbar rad/foldout
          onEdit();
        }}
      >
        Rediger
      </button>
    </div>
  );
};

export default RunLogCard;
