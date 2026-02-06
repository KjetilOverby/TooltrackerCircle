"use client";
import Link from "next/link";
import React from "react";
import { api } from "~/trpc/react";
import ActiveMachines from "./ActiveMachines";

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

type SawForMachines = {
  id: string;
  name: string;
  sawType?: string | null;
  active?: boolean;
  installs?: Array<{
    id: string;
    installedAt: Date;
    blade: { id: string; IdNummer: string } | null;
  }>;
};

export default function HjemPage() {
  const sawsQuery = api.settings.saw.listForMachines.useQuery();
  const utils = api.useUtils();

  const saws = (sawsQuery.data ?? []).map((s) => ({
    ...s,
    sawType: s.sawType ?? undefined,
  })) as SawForMachines[];
  // TODO: erstatt med ekte data senere
  const kpis = [
    { label: "Maskiner i drift", value: "6", hint: "nå" },
    { label: "Blader i omløp", value: "18", hint: "inkl. lager/repair" },
    { label: "Til omlodding", value: "2", hint: "sendt i dag" },
    { label: "Åpne hendelser", value: "4", hint: "siste 24t" },
  ];

  function timeAgoFrom(date: Date, now = new Date()) {
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 60) return `${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} t`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} d`;
  }

  const now = new Date();

  const machinesNow = saws.map((saw) => {
    const activeInstall = saw.installs?.[0] ?? null;
    const bladeId = activeInstall?.blade?.IdNummer ?? "—";

    const since = activeInstall?.installedAt
      ? timeAgoFrom(new Date(activeInstall.installedAt), now)
      : "—";

    return {
      name: saw.name,
      blade: bladeId,
      since,
      state: activeInstall ? ("ok" as const) : ("idle" as const),
    };
  });

  const events: EventItem[] = [
    {
      kind: "REPAIR_SENT",
      title: "Blad sendt til omlodding",
      meta: "B-0721 • Kappsag 2 • Årsak: tannskade",
      time: "13:12",
    },
    {
      kind: "INSTALL",
      title: "Blad satt i maskin",
      meta: "B-1102 • Båndsag 2",
      time: "10:22",
    },
    {
      kind: "UNINSTALL",
      title: "Blad demontert",
      meta: "B-1048 • Kappsag 1 • Sløvt",
      time: "09:41",
    },
    {
      kind: "REPAIR_RETURNED",
      title: "Blad tilbake fra omlodding",
      meta: "B-0654 • Klar til montering",
      time: "i går",
    },
    {
      kind: "AFTERREG",
      title: "Etterregistrering lagt inn",
      meta: "B-0981 • Justert driftstid",
      time: "i går",
    },
  ];

  const kindLabel: Record<EventKind, string> = {
    INSTALL: "Montert",
    UNINSTALL: "Demontert",
    REPAIR_SENT: "Omlodding",
    REPAIR_RETURNED: "Tilbake",
    AFTERREG: "Etterreg",
    SERVICE: "Service",
  };

  return (
    <main className="page">
      <div className="container">
        {/* HERO */}
        <section className="hero">
          <div className="heroLeft">
            <div className="eyebrow">
              <span className="spark" aria-hidden />
              Oversikt
            </div>

            <h1 className="h1">
              Tooltracker <span className="accent">Sirkelsag</span>
            </h1>

            <p className="lead">
              En rolig kontrollflate for drift. Etter hvert kan du se maskiner
              som går nå, blader som er i omlodding, og siste hendelser – uten å
              måtte grave i detaljer.
            </p>

            <div className="quickActions">
              <Link className="btn btnPrimary" href="/machines">
                Monter / demonter
              </Link>
              <Link className="btn btnSoft" href="/drift/etterregistrering">
                Etterregistrering
              </Link>
              <Link className="btn btnSoft" href="/service">
                Service
              </Link>
              <Link className="btn btnSoft" href="/create">
                Legg til sagblad
              </Link>
            </div>
          </div>

          {/* KPI card */}
          <div className="heroRight">
            <div className="statusCard">
              <div className="statusTop">
                <span className="pill ok">
                  <span className="dot ok" />
                  Status
                </span>
              </div>

              <div className="statusGrid">
                {kpis.map((k) => (
                  <div key={k.label} className="kpi">
                    <div className="kpiLabel">{k.label}</div>
                    <div className="kpiValue">{k.value}</div>
                    <div className="kpiHint">{k.hint}</div>
                  </div>
                ))}
              </div>

              <div className="statusFooter">
                <div className="mini">
                  <span className="miniLabel">Neste planlagte</span>
                  <span className="miniValue">Service • tirsdag</span>
                </div>
                <div className="mini">
                  <span className="miniLabel">Oppdatert</span>
                  <span className="miniValue">akkurat nå</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid">
          <ActiveMachines
            machinesNow={machinesNow}
            events={events}
            kindLabel={kindLabel}
          />
        </section>
      </div>

      <style>{`
        :root{
          --bg: #f6f7f9;
          --card: #ffffff;
          --border: rgba(15, 23, 42, .08);
          --text: #0f172a;
          --muted: #64748b;

          /* Litt nydelig, men rolig */
          --accent: #2e5d89;       /* stødig blå */
          --accent2: #2a4a66;
          --mint: #16a34a;         /* drift */
          --mintBg: rgba(22,163,74,.10);
          --amber: #b45309;        /* obs */
          --amberBg: rgba(180,83,9,.12);
          --sky: #0ea5e9;          /* info */
          --skyBg: rgba(14,165,233,.10);
          --plum: #7c3aed;         /* “repair” vibe */
          --plumBg: rgba(124,58,237,.10);

          --shadow: 0 1px 2px rgba(0,0,0,.04), 0 12px 34px rgba(0,0,0,.08);
          --shadow2: 0 1px 2px rgba(0,0,0,.04), 0 18px 50px rgba(0,0,0,.12);
          --r: 22px;
        }

        .page{
          min-height: calc(100vh - 64px);
          background:
            radial-gradient(1000px 420px at 10% -10%, rgba(46,93,137,.16) 0%, transparent 60%),
            radial-gradient(900px 380px at 95% 0%, rgba(22,163,74,.12) 0%, transparent 55%),
            radial-gradient(800px 340px at 50% 120%, rgba(124,58,237,.10) 0%, transparent 55%),
            var(--bg);
          padding: 18px 0 46px;
        }

        .container{
          max-width: 1180px;
          margin: 0 auto;
          padding: clamp(14px, 3vw, 26px);
        }

        .hero{
          display:grid;
          grid-template-columns: 1.25fr .9fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .heroLeft{
          border: 1px solid var(--border);
          border-radius: var(--r);
          background: rgba(255,255,255,.72);
          box-shadow: var(--shadow);
          padding: 22px;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }
        .heroLeft:before{
          content:"";
          position:absolute;
          inset:-2px;
          background:
            radial-gradient(520px 160px at 20% 0%, rgba(46,93,137,.16), transparent 60%),
            radial-gradient(520px 160px at 65% 20%, rgba(22,163,74,.12), transparent 60%);
          pointer-events:none;
        }

        .eyebrow{
          position: relative;
          display:inline-flex;
          align-items:center;
          gap: 10px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #1f2937;
          border: 1px solid rgba(46,93,137,.18);
          background: rgba(46,93,137,.10);
          padding: 7px 11px;
          border-radius: 999px;
        }
        .spark{
          width: 9px; height: 9px; border-radius: 999px;
          background: var(--accent);
          box-shadow: 0 0 0 4px rgba(46,93,137,.14);
        }

        .h1{
          position: relative;
          margin: 10px 0 6px;
          font-size: clamp(28px, 3.2vw, 42px);
          font-weight: 950;
          letter-spacing: -.03em;
          color: var(--text);
        }
        .accent{
          color: var(--accent);
        }

        .lead{
          position: relative;
          margin: 0;
          color: var(--muted);
          font-size: 15px;
          line-height: 1.55;
          max-width: 66ch;
        }

        .quickActions{
          position: relative;
          display:flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }

        .btn{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          border-radius: 14px;
          padding: 10px 12px;
          font-size: 13px;
          font-weight: 900;
          text-decoration:none;
          border: 1px solid rgba(15,23,42,.10);
          background: rgba(255,255,255,.70);
          color: #0f172a;
          transition: transform .12s ease, box-shadow .15s ease, background .15s ease;
        }
        .btn:hover{
          transform: translateY(-1px);
          box-shadow: 0 12px 26px rgba(0,0,0,.10);
          background: rgba(255,255,255,.92);
        }
        .btnPrimary{
          background: rgba(46,93,137,.14);
          border-color: rgba(46,93,137,.22);
          color: #122235;
        }
        .btnPrimary:hover{
          background: rgba(46,93,137,.20);
        }
        .btnSoft{
          background: rgba(255,255,255,.65);
        }

        .softNote{
          position: relative;
          margin-top: 14px;
          display:flex;
          align-items:center;
          gap: 10px;
          font-size: 13px;
          color: #334155;
          font-weight: 750;
          border: 1px solid rgba(15,23,42,.08);
          background: rgba(255,255,255,.55);
          border-radius: 16px;
          padding: 10px 12px;
        }
        .softDot{
          width: 10px; height: 10px; border-radius: 999px;
          background: rgba(22,163,74,.92);
          box-shadow: 0 0 0 4px rgba(22,163,74,.14);
          flex: 0 0 auto;
        }

        .heroRight{
          display:flex;
        }

        .statusCard{
          width: 100%;
          border: 1px solid var(--border);
          border-radius: var(--r);
          background: rgba(255,255,255,.72);
          box-shadow: var(--shadow);
          padding: 18px;
          backdrop-filter: blur(10px);
        }

        .statusTop{
          display:flex;
          align-items:center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }
        .statusTitle{
          font-size: 14px;
          font-weight: 950;
          color: var(--text);
        }
        .pill{
          display:inline-flex;
          align-items:center;
          gap:8px;
          font-size: 12px;
          font-weight: 950;
          padding: 7px 10px;
          border-radius: 999px;
          border: 1px solid transparent;
          white-space: nowrap;
        }
        .pill.ok{ background: var(--mintBg); color: #14532d; border-color: rgba(22,163,74,.18); }

        .dot{
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #9ca3af;
        }
        .dot.ok{ background: var(--mint); }

        .statusGrid{
          display:grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
        .kpi{
          background: rgba(255,255,255,.68);
          border: 1px solid rgba(15,23,42,.08);
          border-radius: 18px;
          padding: 12px;
        }
        .kpiLabel{
          font-size: 12px;
          color: var(--muted);
          font-weight: 900;
        }
        .kpiValue{
          font-size: 26px;
          font-weight: 980;
          margin-top: 4px;
          color: var(--text);
          letter-spacing: -.02em;
        }
        .kpiHint{
          font-size: 12px;
          color: #94a3b8;
          margin-top: 2px;
          font-weight: 800;
        }

        .statusFooter{
          display:flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(15,23,42,.08);
        }
        .mini{ display:flex; flex-direction: column; gap: 2px; }
        .miniLabel{ font-size: 11px; color: #94a3b8; font-weight: 900; text-transform: uppercase; letter-spacing:.08em; }
        .miniValue{ font-size: 13px; color: #334155; font-weight: 950; }

        .grid{
          display:grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .panel{
          grid-column: span 6;
          border: 1px solid var(--border);
          border-radius: var(--r);
          background: rgba(255,255,255,.72);
          box-shadow: var(--shadow);
          padding: 16px;
          backdrop-filter: blur(10px);
        }
        .panel.wide{ grid-column: span 12; }

        .panelHeader{
          display:flex;
          align-items:flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }
        .panelTitle{
          font-size: 14px;
          font-weight: 980;
          color: var(--text);
        }
        .panelSub{
          font-size: 12px;
          color: var(--muted);
          margin-top: 2px;
          font-weight: 800;
        }
        .panelLink{
          font-size: 13px;
          font-weight: 950;
          text-decoration:none;
          color: #122235;
          padding: 8px 10px;
          border-radius: 12px;
          border: 1px solid rgba(46,93,137,.20);
          background: rgba(46,93,137,.10);
          white-space: nowrap;
        }
        .panelLink:hover{ background: rgba(46,93,137,.14); }

        .list{
          display:flex;
          flex-direction: column;
          gap: 10px;
        }
        .row{
          display:flex;
          align-items:center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px;
          border-radius: 20px;
          border: 1px solid rgba(15,23,42,.08);
          background: rgba(255,255,255,.74);
        }
        .rowLeft{
          display:flex;
          align-items:center;
          gap: 10px;
          min-width: 0;
        }
        .rowMain{ min-width: 0; }
        .rowTitle{
          font-weight: 980;
          color: var(--text);
          font-size: 13px;
        }
        .rowMeta{
          font-size: 12px;
          color: var(--muted);
          font-weight: 800;
          margin-top: 2px;
          overflow:hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 44ch;
        }
        .rowMeta b{ color: #0f172a; font-weight: 980; }
        .rowRight{ text-align:right; flex: 0 0 auto; }
        .rowState{
          font-size: 12px;
          font-weight: 950;
          color: #334155;
        }
        .rowTime{
          font-size: 12px;
          font-weight: 980;
          color: #0f172a;
          margin-top: 2px;
        }

        .lamp{
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #9ca3af;
          box-shadow: 0 0 0 3px rgba(156,163,175,.16);
          flex: 0 0 auto;
        }
        .lamp.on{
          background: var(--mint);
          box-shadow: 0 0 0 3px rgba(22,163,74,.16);
          animation: pulseRing 1.8s ease-out infinite;
        }
        @keyframes pulseRing{
          0% { box-shadow: 0 0 0 0 rgba(22,163,74,.34); }
          70% { box-shadow: 0 0 0 10px rgba(22,163,74,0); }
          100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); }
        }

        .feed{
          display:flex;
          flex-direction: column;
          gap: 10px;
        }
        .event{
          display:flex;
          align-items:flex-start;
          gap: 10px;
          padding: 12px;
          border-radius: 20px;
          border: 1px solid rgba(15,23,42,.08);
          background: rgba(255,255,255,.74);
        }
        .eventText{ min-width: 0; }
        .eventTitle{
          font-weight: 980;
          color: var(--text);
          font-size: 13px;
        }
        .eventMeta{
          margin-top: 2px;
          font-size: 12px;
          color: var(--muted);
          font-weight: 800;
          overflow:hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 60ch;
        }
        .eventTime{
          margin-left: auto;
          font-size: 12px;
          color: #475569;
          font-weight: 900;
          white-space: nowrap;
        }

        .badge{
          font-size: 11px;
          font-weight: 980;
          padding: 6px 9px;
          border-radius: 999px;
          border: 1px solid transparent;
          flex: 0 0 auto;
          white-space: nowrap;
        }
        .badge.INSTALL{ background: var(--mintBg); color:#14532d; border-color: rgba(22,163,74,.18); }
        .badge.UNINSTALL{ background: var(--amberBg); color:#7c2d12; border-color: rgba(180,83,9,.18); }
        .badge.REPAIR_SENT{ background: var(--plumBg); color:#3b1a7b; border-color: rgba(124,58,237,.18); }
        .badge.REPAIR_RETURNED{ background: rgba(14,165,233,.10); color:#0b3a52; border-color: rgba(14,165,233,.18); }
        .badge.AFTERREG{ background: rgba(51,65,85,.08); color:#0f172a; border-color: rgba(51,65,85,.14); }
        .badge.SERVICE{ background: rgba(46,93,137,.10); color:#122235; border-color: rgba(46,93,137,.18); }

        .panelFooter{
          display:flex;
          gap: 10px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(15,23,42,.08);
          flex-wrap: wrap;
        }

        .tiles{
          display:grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .tile{
          position: relative;
          display:block;
          padding: 14px;
          border-radius: 22px;
          border: 1px solid rgba(15,23,42,.08);
          background: rgba(255,255,255,.74);
          text-decoration:none;
          transition: transform .12s ease, box-shadow .15s ease, background .15s ease;
          min-height: 104px;
          overflow: hidden;
        }
        .tile:before{
          content:"";
          position:absolute;
          inset:-2px;
          background: radial-gradient(360px 120px at 20% 0%, rgba(46,93,137,.12), transparent 62%);
          pointer-events:none;
        }
        .tile:hover{
          transform: translateY(-2px);
          box-shadow: var(--shadow2);
          background: rgba(255,255,255,.92);
        }
        .tileTop{
          position: relative;
          display:flex;
          align-items:center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }
        .tileIcon{
          font-size: 16px;
          opacity: .9;
        }
        .tilePill{
          font-size: 11px;
          font-weight: 980;
          color:#122235;
          border: 1px solid rgba(46,93,137,.18);
          background: rgba(46,93,137,.08);
          padding: 6px 9px;
          border-radius: 999px;
        }
        .tileTitle{
          position: relative;
          font-weight: 980;
          color: var(--text);
          font-size: 13px;
        }
        .tileSub{
          position: relative;
          margin-top: 4px;
          font-size: 12px;
          color: var(--muted);
          font-weight: 800;
          max-width: 30ch;
        }
        .tileArrow{
          position:absolute;
          right: 12px;
          bottom: 10px;
          font-weight: 980;
          color: #334155;
          opacity: .8;
        }

        @media (max-width: 980px){
          .hero{ grid-template-columns: 1fr; }
          .panel{ grid-column: span 12; }
          .tiles{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 560px){
          .tiles{ grid-template-columns: 1fr; }
          .rowMeta{ max-width: 28ch; }
          .eventMeta{ max-width: 34ch; }
        }

        @media (prefers-reduced-motion: reduce){
          .lamp.on{ animation: none; }
          .btn, .tile{ transition: none; }
        }
      `}</style>
    </main>
  );
}
