"use client";
import React from "react";
import Link from "next/link";

type MachineNow = {
  name: string;
  blade: string;
  since: string;
  state: "ok" | "idle";
};

type EventKind =
  | "INSTALL"
  | "UNINSTALL"
  | "REPAIR_SENT"
  | "REPAIR_RETURNED"
  | "AFTERREG"
  | "SERVICE";

type EventItem = {
  kind: EventKind;
  title: string;
  meta: string;
  time: string;
};

const ActiveMachines = ({
  machinesNow,
  events,
  kindLabel,
}: {
  machinesNow: MachineNow[];
  events: EventItem[];
  kindLabel: Record<EventKind, string>;
}) => {
  return (
    <div className="am-wrapper">
      <style>{`
    .am-wrapper{
      display:flex;
      flex-direction:column;
      gap: 22px;
      padding: 16px 0;
      color: #0f172a; /* mørk tekst for kontrast */
    }

    /* Kort / panel - lys glass */
    .am-card{
      position:relative;
      border-radius: 24px;
      padding: 26px;
      border: 1px solid rgba(15,23,42,.10);
      background:
        radial-gradient(900px 340px at 10% -10%, rgba(59,130,246,.14), transparent 60%),
        radial-gradient(700px 320px at 95% 0%, rgba(16,185,129,.10), transparent 55%),
        rgba(255,255,255,.78);
      backdrop-filter: blur(16px);
      box-shadow:
        0 1px 2px rgba(15,23,42,.06),
        0 24px 70px rgba(15,23,42,.10);
      overflow:hidden;
    }

    .am-card:before{
      content:"";
      position:absolute;
      inset:-2px;
      background: linear-gradient(120deg, rgba(255,255,255,.85), transparent 35%, rgba(255,255,255,.55));
      opacity:.55;
      pointer-events:none;
    }

    .am-head{
      position:relative;
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap: 12px;
      margin-bottom: 16px;
    }

    .am-title{
      font-size: 15px;
      font-weight: 950;
      letter-spacing: -.01em;
      color: #0f172a;
    }

    .am-sub{
      font-size: 12px;
      font-weight: 750;
      margin-top: 4px;
      color: rgba(15,23,42,.62);
    }

    .am-link-btn{
      position:relative;
      display:inline-flex;
      align-items:center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 12px;
      font-weight: 950;
      color: #0f172a;
      text-decoration:none;
      background: rgba(255,255,255,.85);
      border: 1px solid rgba(15,23,42,.12);
      box-shadow: 0 1px 2px rgba(15,23,42,.05);
      transition: transform .12s ease, box-shadow .12s ease, background .12s ease, border-color .12s ease;
      white-space:nowrap;
    }

    .am-link-btn:hover{
      transform: translateY(-1px);
      box-shadow: 0 10px 24px rgba(15,23,42,.10);
      border-color: rgba(59,130,246,.28);
      background: rgba(255,255,255,.95);
    }

    /* Maskinliste */
    .am-list{
      position:relative;
      display:flex;
      flex-direction:column;
      gap: 10px;
    }

    .am-row{
      position:relative;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap: 12px;
      padding: 14px 14px;
      border-radius: 18px;
      background: rgba(255,255,255,.90);
      border: 1px solid rgba(15,23,42,.10);
      box-shadow: 0 1px 2px rgba(15,23,42,.05);
      transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease, background .12s ease;
    }

    .am-row:hover{
      transform: translateY(-1px);
      background: rgba(255,255,255,.98);
      border-color: rgba(59,130,246,.22);
      box-shadow: 0 14px 34px rgba(15,23,42,.10);
    }

    .am-rowLeft{ display:flex; align-items:center; gap: 12px; min-width:0; }
    .am-rowMain{ min-width:0; }

    .am-lamp{
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: rgba(148,163,184,.9);
      box-shadow: 0 0 0 4px rgba(148,163,184,.25);
      flex: 0 0 auto;
    }
    .am-lamp.on{
      background: rgba(16,185,129,.95);
      box-shadow: 0 0 0 4px rgba(16,185,129,.18), 0 0 14px rgba(16,185,129,.22);
    }

    .am-name{
      font-size: 13px;
      font-weight: 950;
      color: #0f172a;
      letter-spacing: -.01em;
    }
    .am-meta{
      font-size: 12px;
      font-weight: 800;
      margin-top: 2px;
      color: rgba(15,23,42,.62);
      overflow:hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 56ch;
    }
    .am-meta b{
      color: rgba(37,99,235,.95);
      font-weight: 950;
    }

    .am-rowRight{
      flex: 0 0 auto;
      display:flex;
      flex-direction:column;
      align-items:flex-end;
      gap: 6px;
      text-align:right;
    }

    .am-state-chip{
      font-size: 10px;
      font-weight: 950;
      padding: 6px 10px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: .08em;
      border: 1px solid rgba(15,23,42,.10);
      background: rgba(15,23,42,.03);
      color: rgba(15,23,42,.70);
    }
    .am-state-chip.ok{
      border-color: rgba(16,185,129,.18);
      background: rgba(16,185,129,.12);
      color: rgba(5,150,105,.98);
    }
    .am-state-chip.idle{
      border-color: rgba(148,163,184,.24);
      background: rgba(148,163,184,.16);
      color: rgba(15,23,42,.72);
    }

    .am-rowTime{
      font-size: 11px;
      font-weight: 850;
      color: rgba(15,23,42,.55);
    }

    /* Events */
    .am-feed{
      position:relative;
      display:flex;
      flex-direction:column;
      gap: 10px;
    }

    .am-event{
      display:flex;
      align-items:flex-start;
      gap: 12px;
      padding: 12px;
      border-radius: 18px;
      background: rgba(255,255,255,.88);
      border: 1px solid rgba(15,23,42,.10);
      box-shadow: 0 1px 2px rgba(15,23,42,.05);
      transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease, background .12s ease;
    }
    .am-event:hover{
      transform: translateY(-1px);
      border-color: rgba(124,58,237,.18);
      box-shadow: 0 14px 34px rgba(15,23,42,.10);
      background: rgba(255,255,255,.98);
    }

    .am-badge{
      font-size: 10px;
      font-weight: 950;
      padding: 6px 10px;
      border-radius: 999px;
      min-width: 92px;
      text-align:center;
      border: 1px solid rgba(15,23,42,.10);
      background: rgba(15,23,42,.03);
      color: rgba(15,23,42,.70);
      white-space: nowrap;
      flex: 0 0 auto;
    }

    .am-badge.INSTALL{
      border-color: rgba(16,185,129,.20);
      background: rgba(16,185,129,.14);
      color: rgba(5,150,105,.98);
    }
    .am-badge.UNINSTALL{
      border-color: rgba(245,158,11,.22);
      background: rgba(245,158,11,.16);
      color: rgba(180,83,9,.98);
    }
    .am-badge.SERVICE{
      border-color: rgba(59,130,246,.22);
      background: rgba(59,130,246,.14);
      color: rgba(37,99,235,.98);
    }
    .am-badge.REPAIR_SENT{
      border-color: rgba(124,58,237,.20);
      background: rgba(124,58,237,.14);
      color: rgba(91,33,182,.98);
    }
    .am-badge.REPAIR_RETURNED{
      border-color: rgba(14,165,233,.22);
      background: rgba(14,165,233,.14);
      color: rgba(2,132,199,.98);
    }
    .am-badge.AFTERREG{
      border-color: rgba(100,116,139,.22);
      background: rgba(100,116,139,.14);
      color: rgba(15,23,42,.80);
    }

    .am-eventText{ min-width:0; flex:1; }
    .am-event-title{
      font-size: 13px;
      font-weight: 950;
      color: #0f172a;
      letter-spacing: -.01em;
    }
    .am-event-meta{
      margin-top: 2px;
      font-size: 12px;
      font-weight: 800;
      color: rgba(15,23,42,.62);
      overflow:hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 64ch;
    }
    .am-event-time{
      margin-left:auto;
      font-size: 11px;
      font-weight: 900;
      color: rgba(15,23,42,.55);
      white-space:nowrap;
      flex: 0 0 auto;
    }

    /* Snarveier / tiles */
    .am-tiles{
      display:grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }

    .am-tile{
      position:relative;
      display:block;
      text-decoration:none;
      border-radius: 20px;
      padding: 14px;
      border: 1px solid rgba(15,23,42,.10);
      background: rgba(255,255,255,.86);
      box-shadow: 0 1px 2px rgba(15,23,42,.05);
      transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease, background .12s ease;
      overflow:hidden;
      color: #0f172a;
    }

    .am-tile:hover{
      transform: translateY(-2px);
      background: rgba(255,255,255,.98);
      border-color: rgba(59,130,246,.22);
      box-shadow: 0 18px 44px rgba(15,23,42,.12);
    }

    .am-pill{
      display:inline-flex;
      align-items:center;
      gap: 8px;
      font-size: 10px;
      font-weight: 950;
      letter-spacing: .08em;
      text-transform: uppercase;
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid rgba(59,130,246,.20);
      background: rgba(59,130,246,.12);
      color: rgba(37,99,235,.98);
      width: fit-content;
      margin-bottom: 10px;
    }

    .am-tileTitle{
      font-size: 14px;
      font-weight: 980;
      letter-spacing: -.01em;
      color: #0f172a;
    }
    .am-tileSub{
      margin-top: 4px;
      font-size: 12px;
      font-weight: 800;
      color: rgba(15,23,42,.62);
      line-height: 1.45;
      max-width: 42ch;
    }

    @media (max-width: 640px){
      .am-card{ padding: 18px; }
      .am-row{ padding: 12px; }
      .am-event{ padding: 12px; }
      .am-meta{ max-width: 34ch; }
      .am-event-meta{ max-width: 40ch; }
    }
  `}</style>

      {/* Maskin Seksjon */}
      <section className="am-card">
        <div className="am-head">
          <div>
            <div className="am-title">Maskiner</div>
            <div className="am-sub">Sanntidsoversikt over produksjon</div>
          </div>
          <Link className="am-link-btn" href="/machines">
            Se alle
          </Link>
        </div>

        <div className="am-list">
          {machinesNow.map((m) => (
            <div key={m.name} className="am-row">
              <div
                style={{ display: "flex", alignItems: "center", gap: "20px" }}
              >
                <span className={`am-lamp ${m.state === "ok" ? "on" : ""}`} />
                <div>
                  <div className="am-name">{m.name}</div>
                  <div className="am-meta">
                    Blad: <b>{m.blade}</b>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={`am-state-chip ${m.state}`}>
                  {m.state === "ok" ? "I drift" : "Klar"}
                </span>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#475569",
                    marginTop: "4px",
                  }}
                >
                  {m.since}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hendelses Seksjon */}
      <section className="am-card">
        <div className="am-head">
          <div>
            <div className="am-title">Siste logg</div>
            <div className="am-sub">Bevegelser i systemet</div>
          </div>
          <Link className="am-link-btn" href="/drift/historikk">
            Historikk
          </Link>
        </div>

        <div className="am-feed">
          {events.map((e, idx) => (
            <div key={idx} className="am-event">
              <span className={`am-badge ${e.kind}`}>{kindLabel[e.kind]}</span>
              <div>
                <div className="am-event-title">{e.title}</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  {e.meta}
                </div>
              </div>
              <div className="am-event-time">{e.time}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ActiveMachines;
