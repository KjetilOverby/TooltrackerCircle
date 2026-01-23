import React from "react";

interface MachineListProps {
  saws: Array<{
    id: string;
    name: string;
    sawType?: string;
    active?: boolean;
    installs?: Array<{ blade?: { IdNummer: string } }>;
  }>;
  openMountModal: (saw: any) => void;
  openUninstallModal: (saw: any) => void;
}

const MachineList: React.FC<MachineListProps> = ({
  saws,
  openMountModal,
  openUninstallModal,
}) => {
  return (
    <div>
      <style>{`
        .page { max-width: 1100px; margin: 0 auto; padding: 32px 20px; font-family: system-ui, -apple-system, Segoe UI, sans-serif; background:#f6f7f9; min-height:100vh; }
        h1 { font-size: 30px; font-weight: 650; margin: 0 0 6px; }
        .subtitle { color:#555; margin: 0 0 28px; }

        .grid { display:grid; grid-template-columns: 1fr; gap: 20px; }
        .card { background:#fff; border:1px solid #e6e7ea; border-radius:14px; padding:20px 22px; box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 10px 28px rgba(0,0,0,0.06); }
        .cardHeader { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
        .title { font-size:20px; font-weight:650; }
        .meta { font-size:13px; color:#666; margin-top:2px; }
        .badge { font-size:12px; padding:6px 10px; border-radius:999px; background:#eef0f3; font-weight:600; }
        .badgeActive { background:#e6f6ec; color:#166534; }
        .badgeInactive { background:#fdecec; color:#991b1b; }

        /* Status-rad med lampe + blad */
        .statusRow {
          margin-top: 14px;
          background: #f1f3f6;
          border: 1px solid #e6e7ea;
          border-radius: 12px;
          padding: 12px 14px;
          display:flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .statusLeft {
          display:flex;
          align-items:center;
          gap: 10px;
          min-width: 0;
        }
        .lamp {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #9ca3af;
          flex: 0 0 auto;
        }
        .lamp.on {
          background: #22c55e;
          animation: pulse 1.15s infinite;
        }
        @keyframes pulse {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.45); }
          70%  { box-shadow: 0 0 0 10px rgba(34,197,94,0.00); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.00); }
        }
        .bladeText {
          font-size: 14px;
          color: #111827;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .bladeText b { font-weight: 700; }
        .tiny {
          font-size: 12px;
          color: #6b7280;
          white-space: nowrap;
        }

.pill{
  display:inline-block;
  font-size:12px;
  padding:2px 8px;
  border-radius:999px;
  background:#eef0f3;
  border:1px solid #e6e7ea;
}
  .label{
  display:flex;
  flex-direction:column;
  gap:6px;
  font-size:13px;
  color:#374151;
  font-weight:600;
}

.select{
  border:1px solid #d8dbe2;
  border-radius:10px;
  padding:10px 12px;
  font-size:14px;
  background:#fff;
}

.textarea{
  width:100%;
  min-height:90px;
  resize:vertical;
  border:1px solid #d8dbe2;
  border-radius:10px;
  padding:10px 12px;
  font-size:14px;
  font-family: inherit;
  background:#fff;
}



        .actions { display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; margin-top:14px; }
        button { border:0; border-radius:10px; padding:12px 14px; font-size:14px; font-weight:600; cursor:pointer; background:#eef0f3; transition: transform .1s ease, background .15s ease; }
        button:hover:not(:disabled){ transform: translateY(-1px); }
        button:disabled { opacity: .45; cursor:not-allowed; transform:none; }
        .primary { background:#2563eb; color:#fff; }
        .primary:hover { background:#1d4ed8; }
        .warning { background:#fbbf24; color:#111827; }
        .warning:hover { background:#f59e0b; }
        .danger { background:#dc2626; color:#fff; }
        .danger:hover { background:#b91c1c; }

      

        @media (max-width: 680px) {
          .actions { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
      <div className="grid">
        {saws.map((saw) => {
          const isActive = saw.active !== false;

          const activeInstall = saw.installs?.[0] ?? null;
          const activeBladeIdNummer = activeInstall?.blade?.IdNummer ?? null;
          const hasBlade = Boolean(activeBladeIdNummer);

          return (
            <div key={saw.id} className="card">
              <div className="cardHeader">
                <div>
                  <div className="title">{saw.name}</div>
                  <div className="meta">{saw.sawType ?? "—"}</div>
                </div>
                <div
                  className={`badge ${isActive ? "badgeActive" : "badgeInactive"}`}
                >
                  {isActive ? "Aktiv" : "Inaktiv"}
                </div>
              </div>

              {/* Status: lampe + blad */}
              <div className="statusRow">
                <div className="statusLeft">
                  <div className={`lamp ${hasBlade ? "on" : ""}`} />
                  <div className="bladeText">
                    {hasBlade ? (
                      <>
                        Montert blad: <b>{activeBladeIdNummer}</b>
                      </>
                    ) : (
                      <>Ingen blad montert</>
                    )}
                  </div>
                </div>

                <div className="tiny">{hasBlade ? "I drift" : "Tom"}</div>
              </div>

              <div className="actions">
                <button className="primary" onClick={() => openMountModal(saw)}>
                  Monter
                </button>

                <button
                  className="warning"
                  disabled={!hasBlade}
                  onClick={() => openUninstallModal(saw)}
                >
                  Demontering
                </button>

                <button className="danger" disabled={!hasBlade}>
                  Bytt blad
                </button>

                <button disabled>Detaljer</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MachineList;
