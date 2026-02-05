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
      // (valgfritt, men anbefalt hvis du har det i data)
      // removedAt?: Date | null;
    }>;
  }>;

  openMountModal: (saw: MachineListProps["saws"][number]) => void;
  openUninstallModal: (saw: MachineListProps["saws"][number]) => void;

  // ✅ legg til denne:
  openChangeBladeModal: (saw: MachineListProps["saws"][number]) => void;
  openMoveBladeModal: (saw: MachineListProps["saws"][number]) => void;
}

function formatDateTimeNo(d: Date) {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

  if (days <= 0 && hours <= 0) return `${minutes} min siden`;
  if (days <= 0) return `${hours} t ${minutes} min siden`;
  return `${days} d ${hours} t ${minutes} min siden`;
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
      <style jsx>{`
        :root {
          --bg: #f6f7f9;
          --card: #ffffffcc;
          --border: #778899;
          --text: #0f172a;
          --muted: #64748b;
          --muted2: #94a3b8;
          --soft: #f1f3f6;
          --shadow:
            0 1px 2px rgba(0, 0, 0, 0.04), 0 12px 34px rgba(0, 0, 0, 0.08);
          --shadow2:
            0 1px 2px rgba(0, 0, 0, 0.04), 0 18px 50px rgba(0, 0, 0, 0.12);
          --radius: 18px;
          --ring: 0 0 0 4px rgba(59, 91, 122, 0.14);

          --accent: #3b5b7a;
          --accent2: #2f475f;
          --ok: #16a34a;
          --okBg: #e9f8ef;
          --bad: #b91c1c;
          --badBg: #fdecec;
          --chip: #eef2f7;
        }

        .wrap {
          max-width: 1120px;
          margin: 0 auto;
          border-radius: 14px;
          border: 1px solid var(--border);
          padding: 30px;
          font-family:
            system-ui,
            -apple-system,
            Segoe UI,
            sans-serif;
          background: #ffffff;
          min-height: auto !important;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 16px;
        }

        .card {
          grid-column: span 6;
          position: relative;
          border-radius: 10px;
          border: 1px solid grey;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.9),
            rgba(255, 255, 255, 0.7)
          );
          backdrop-filter: blur(10px);
          box-shadow: var(--shadow);
          overflow: hidden;
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            border-color 0.18s ease;
        }

        .card:before {
          content: "";
          position: absolute;
          inset: -2px;
          background: radial-gradient(
            600px 180px at 30% -10%,
            rgba(59, 91, 122, 0.18),
            transparent 65%
          );
          pointer-events: none;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow2);
          border-color: #dde0e7;
        }

        .inner {
          position: relative;
          padding: 18px 18px 14px;
        }

        .top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .name {
          font-size: 18px;
          font-weight: 760;
          letter-spacing: 0.2px;
          color: var(--text);
          line-height: 1.2;
        }

        .sub {
          margin-top: 4px;
          font-size: 13px;
          color: var(--muted);
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          background: var(--chip);
          border: 1px solid #e3e7ee;
          color: #334155;
          font-weight: 650;
          white-space: nowrap;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #9ca3af;
          box-shadow: 0 0 0 3px rgba(156, 163, 175, 0.18);
        }
        .dot.ok {
          background: var(--ok);
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.16);
        }
        .dot.bad {
          background: var(--bad);
          box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.14);
        }

        .pillStatus {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          font-weight: 750;
          border: 1px solid transparent;
        }
        .pillStatus.ok {
          background: var(--okBg);
          color: #14532d;
          border-color: rgba(22, 163, 74, 0.18);
        }
        .pillStatus.bad {
          background: var(--badBg);
          color: #7f1d1d;
          border-color: rgba(185, 28, 28, 0.18);
        }

        .bladeBox {
          margin-top: 14px;
          border-radius: 14px;
          border: 1px solid #e6e7ea;
          background: linear-gradient(180deg, #f7f9fc, #f1f4f8);
          padding: 12px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .bladeLeft {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .bladeIcon {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          background: rgba(59, 91, 122, 0.12);
          border: 1px solid rgba(59, 91, 122, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
        }
        .bladeIcon svg {
          width: 18px;
          height: 18px;
          opacity: 0.9;
        }

        .bladeText {
          min-width: 0;
        }
        .bladeTitle {
          font-size: 13px;
          color: var(--muted);
          font-weight: 650;
          margin-bottom: 2px;
        }
        .bladeValue {
          font-size: 15px;
          color: var(--text);
          font-weight: 800;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 460px;
        }

        .bladeMeta {
          text-align: right;
          flex: 0 0 auto;
          font-size: 12px;
          color: var(--muted);
          white-space: nowrap;
          line-height: 1.25;
        }
        .bladeMeta b {
          color: #334155;
          font-weight: 800;
        }

        .footer {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(230, 231, 234, 0.8);
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .btn {
          border-radius: 12px;
          padding: 9px 10px;
          font-size: 13px;
          font-weight: 750;
          border: 1px solid #e3e7ee;
          background: rgba(255, 255, 255, 0.65);
          color: #334155;
          cursor: pointer;
          transition:
            background 0.15s ease,
            transform 0.12s ease,
            box-shadow 0.15s ease,
            border-color 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.92);
          border-color: #d8dfe9;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
        }
        .btn:focus-visible {
          outline: none;
          box-shadow: var(--ring);
        }
        .btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btnPrimary {
          background: rgba(59, 91, 122, 0.1);
          border-color: rgba(59, 91, 122, 0.22);
          color: #1f2f40;
        }
        .btnPrimary:hover:not(:disabled) {
          background: rgba(59, 91, 122, 0.16);
          border-color: rgba(59, 91, 122, 0.28);
        }

        .btnWarn {
          background: rgba(214, 179, 106, 0.14);
          border-color: rgba(214, 179, 106, 0.28);
          color: #3b2a07;
        }
        .btnWarn:hover:not(:disabled) {
          background: rgba(214, 179, 106, 0.2);
          border-color: rgba(214, 179, 106, 0.36);
        }

        @keyframes softPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.45);
            opacity: 1;
          }
          70% {
            box-shadow: 0 0 0 8px rgba(22, 163, 74, 0);
            opacity: 0.9;
          }
          100% {
            box-shadow: 0 0 0 0 rgba(22, 163, 74, 0);
            opacity: 1;
          }
        }

        .dot.ok {
          background: #16a34a;
          animation: softPulse 1.6s ease-out infinite;
        }
        .bladeExtra {
          font-size: 12px;
          color: var(--muted2);
          font-weight: 200;
        }

        @media (max-width: 980px) {
          .card {
            grid-column: span 12;
          }
          .bladeValue {
            max-width: 320px;
          }
        }
      `}</style>

      <div className="grid">
        {saws.map((saw) => {
          const isActive = saw.active !== false;

          const activeInstall = saw.installs?.[0] ?? null;
          const bladeTypeName = activeInstall?.blade?.bladeType?.name ?? null;
          const bladeSide = activeInstall?.blade?.side ?? null;

          const bladeExtra =
            [bladeTypeName, bladeSide].filter(Boolean).join(" • ") || null;

          const bladeId = activeInstall?.blade?.IdNummer ?? null;
          const hasBlade = Boolean(bladeId);

          const installedAt = activeInstall?.installedAt
            ? new Date(activeInstall.installedAt)
            : null;

          const installedAtText = installedAt
            ? formatDateTimeNo(installedAt)
            : null;
          const sinceText = installedAt ? timeAgoFrom(installedAt, now) : null;

          return (
            <div key={saw.id} className="card">
              <div className="inner">
                <div className="top">
                  <div>
                    <div className="name">{saw.name}</div>
                    <div className="sub">
                      {saw.sawType ?? "—"}
                      {!isActive ? " • deaktivert" : ""}
                    </div>

                    <div className="chips">
                      <span className={`pillStatus ${hasBlade ? "ok" : "bad"}`}>
                        <span className={`dot ${hasBlade ? "ok" : "bad"}`} />
                        {hasBlade ? "I drift" : "Tom"}
                      </span>

                      {installedAtText && hasBlade ? (
                        <span className="chip">Montert {installedAtText}</span>
                      ) : (
                        <span className="chip">Ingen montering registrert</span>
                      )}

                      {sinceText && hasBlade ? (
                        <span className="chip">{sinceText}</span>
                      ) : (
                        <span className="chip">—</span>
                      )}
                    </div>
                  </div>

                  {/* Høyresiden kan brukes til senere "hurtiginfo" */}
                </div>

                <div className="bladeBox">
                  <div className="bladeLeft">
                    <div className="bladeIcon" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M7 7h10M7 12h10M7 17h10"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    <div className="bladeText">
                      <div className="bladeTitle">Montert blad</div>
                      <div className="bladeValue">
                        {hasBlade ? (
                          <>
                            {bladeId}
                            {bladeExtra ? (
                              <span className="bladeExtra">
                                {" "}
                                • {bladeExtra}
                              </span>
                            ) : null}
                          </>
                        ) : (
                          "Ingen blad montert"
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bladeMeta">
                    {hasBlade && installedAtText ? (
                      <>
                        <b>{installedAtText}</b>
                        <br />
                        {sinceText}
                      </>
                    ) : (
                      <>
                        <b>—</b>
                        <br />
                        Ikke i drift
                      </>
                    )}
                  </div>
                </div>

                {/* Diskrete knapper */}
                <div className="footer">
                  <button
                    className="btn btnPrimary"
                    onClick={() => openMountModal(saw)}
                    disabled={hasBlade}
                  >
                    Monter
                  </button>

                  <button
                    className="btn btnWarn"
                    disabled={!hasBlade}
                    onClick={() => openUninstallModal(saw)}
                  >
                    Demontering
                  </button>

                  <button
                    onClick={() => openChangeBladeModal(saw)}
                    className="btn"
                    disabled={!hasBlade}
                  >
                    Bytt blad
                  </button>

                  <button
                    onClick={() => openMoveBladeModal(saw)}
                    className="btn"
                  >
                    Flytt blad
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
