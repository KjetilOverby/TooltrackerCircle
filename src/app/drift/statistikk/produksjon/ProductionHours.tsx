"use client";

import React, { useMemo, useState } from "react";
import { api } from "~/trpc/react";

interface BladeTypeStat {
  bladeTypeId: string;
  bladeTypeName: string;
  stokkerPerTime: number;
  totalStokker: number;
  totalHours: number;
  installs: number;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
function dateToYMD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function ymdToDate(ymd: string) {
  // Vi pakker ut verdiene og setter 0 som fallback hvis map(Number) feiler
  const [y, m, d] = ymd.split("-").map(Number);

  // Ved å bruke (y ?? 0) osv., garanterer vi at typen er 'number' og ikke 'number | undefined'
  // Vi bruker 2024 (eller nåværende år) som fallback for år, og 1 for måned/dag
  return new Date(
    y ?? new Date().getFullYear(),
    (m ?? 1) - 1,
    d ?? 1,
    0,
    0,
    0,
    0,
  );
}
function formatNum(n: number | null | undefined, digits = 1) {
  if (n === null || n === undefined || Number.isNaN(n)) return "–";
  return n.toFixed(digits);
}
function formatInt(n: number | null | undefined) {
  if (n === null || n === undefined || Number.isNaN(n)) return "–";
  return Math.round(n).toString();
}

export default function ProductionHour() {
  const defaultFrom = useMemo(() => startOfDay(addDays(new Date(), -30)), []);
  const defaultTo = useMemo(() => startOfDay(new Date()), []);

  const [fromYmd, setFromYmd] = useState<string>(dateToYMD(defaultFrom));
  const [toYmd, setToYmd] = useState<string>(dateToYMD(defaultTo));

  const [queryRange, setQueryRange] = useState(() => ({
    from: defaultFrom,
    toExclusive: addDays(defaultTo, 1),
  }));

  const q = api.driftstatistikk.getProductionEfficiency.useQuery(
    { from: queryRange.from, to: queryRange.toExclusive },
    { staleTime: 30_000, refetchOnWindowFocus: false },
  );

  const data = q.data;

  function applyRange() {
    const from = startOfDay(ymdToDate(fromYmd));
    const to = startOfDay(ymdToDate(toYmd));
    const safeTo = to < from ? from : to;

    setQueryRange({
      from,
      toExclusive: addDays(safeTo, 1),
    });
  }

  function setLast30() {
    const f = startOfDay(addDays(new Date(), -30));
    const t = startOfDay(new Date());
    setFromYmd(dateToYMD(f));
    setToYmd(dateToYMD(t));
    setQueryRange({ from: f, toExclusive: addDays(t, 1) });
  }

  function setLast90() {
    const f = startOfDay(addDays(new Date(), -90));
    const t = startOfDay(new Date());
    setFromYmd(dateToYMD(f));
    setToYmd(dateToYMD(t));
    setQueryRange({ from: f, toExclusive: addDays(t, 1) });
  }

  return (
    <div className="ps-wrap">
      <style>{`
  .ps-wrap {
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    color: #334155; /* Mørk grå tekst for god lesbarhet */
    max-width: 1200px;
    margin: 0 auto;
    font-family: 'Inter', -apple-system, sans-serif;
    background-color: #f8fafc; /* Svakt grå bakgrunn for hele siden */
    min-height: 100vh;
  }

  /* Header */
  .ps-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 16px;
    border-bottom: 2px solid #e2e8f0;
  }

  .ps-title {
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #0f172a;
  }

  /* Buttons */
  .ps-btn {
    padding: 8px 16px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .ps-btn:hover {
    background: #f1f5f9;
    color: #0f172a;
    border-color: #cbd5e1;
  }

  .ps-btnPrimary {
    background: #2563eb;
    color: white;
    border: none;
  }

  .ps-btnPrimary:hover {
    background: #1d4ed8;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  }

  /* Cards - Hvite bokser på grå bakgrunn */
  .ps-card {
    border-radius: 12px;
    padding: 24px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  /* KPI Section */
  .ps-overallGrid {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr 1fr;
    gap: 32px;
  }

  .ps-kpiLabel {
    color: #64748b;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
  }

  .ps-kpiValueBig {
    font-size: 32px;
    font-weight: 800;
    color: #2563eb; /* Blått fremhever hovedtallet */
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .ps-kpiUnit {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }

  .ps-kpiValue {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
  }

  /* Best/Worst - Fargekoding på tallene */
  .ps-bestWorstGrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .ps-bwName {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
  }

  .ps-bwSub {
    font-size: 15px;
    font-weight: 700;
    margin-top: 4px;
  }

  /* Grønn for best, rød for worst - men i en proff tone */
  .ps-best { color: #16a34a; }
  .ps-worst { color: #dc2626; }

  /* List/Table */
  .ps-sectionTitle {
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #94a3b8;
    margin-bottom: 16px;
  }

  .ps-row {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr 1fr 0.8fr;
    padding: 12px 16px;
    border-bottom: 1px solid #f1f5f9;
    align-items: center;
  }

  .ps-row:hover {
    background-color: #f8fafc;
    border-radius: 8px;
  }

  .ps-name {
    font-weight: 600;
    color: #334155;
  }

  .ps-right {
    text-align: right;
  }

  .ps-main {
    font-weight: 700;
    color: #1e293b;
  }

  .ps-sub {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 600;
  }

  /* Inputs */
  .ps-input {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    padding: 8px 12px;
    border-radius: 6px;
    color: #1e293b;
    font-size: 14px;
  }
  
  .ps-input:focus {
    outline: none;
    border-color: #2563eb;
    ring: 2px solid #dbeafe;
  }

  @media (max-width: 860px) {
    .ps-overallGrid { grid-template-columns: 1fr 1fr; }
    .ps-row { grid-template-columns: 1fr 1fr 1fr; }
  }
`}</style>

      <div className="ps-top">
        <h1 className="ps-title">Produksjonsstatistikk</h1>

        <div className="ps-actions">
          <button className="ps-btn" onClick={setLast30}>
            30 dager
          </button>
          <button className="ps-btn" onClick={setLast90}>
            90 dager
          </button>
        </div>
      </div>

      <div className="ps-card ps-period">
        <div className="ps-field">
          <label className="ps-label">Fra</label>
          <input
            className="ps-input"
            type="date"
            value={fromYmd}
            onChange={(e) => setFromYmd(e.target.value)}
          />
        </div>

        <div className="ps-field">
          <label className="ps-label">Til</label>
          <input
            className="ps-input"
            type="date"
            value={toYmd}
            onChange={(e) => setToYmd(e.target.value)}
          />
        </div>

        <button className="ps-btn ps-btnPrimary" onClick={applyRange}>
          Bruk periode
        </button>

        <div className="ps-rangeText">
          Viser {fromYmd} → {toYmd}
        </div>
      </div>

      {q.isLoading && <div>Laster…</div>}

      {q.isError && (
        <div className="ps-error">
          Klarte ikke å hente produksjonsstatistikk.
        </div>
      )}

      {data && (
        <div className="ps-card ps-overallGrid">
          <div>
            <div className="ps-kpiLabel">Produksjonseffektivitet</div>
            <div className="ps-kpiValueBig">
              {formatNum(data.overall.stokkerPerTime, 1)}{" "}
              <span className="ps-kpiUnit">stokker/time</span>
            </div>
          </div>

          <div>
            <div className="ps-kpiLabel">Installeringer</div>
            <div className="ps-kpiValue">
              {formatInt(data.overall.installs)}
            </div>
          </div>

          <div>
            <div className="ps-kpiLabel">Sum stokker</div>
            <div className="ps-kpiValue">
              {formatInt(data.overall.totalStokker)}
            </div>
          </div>

          <div>
            <div className="ps-kpiLabel">Sum timer</div>
            <div className="ps-kpiValue">
              {formatNum(data.overall.totalHours, 1)}
            </div>
          </div>
        </div>
      )}

      {data && (
        <div className="ps-bestWorstGrid">
          <div className="ps-card">
            <div className="ps-bwTitle">Mest effektiv sag</div>
            <div className="ps-bwName">{data.bestSaw?.sawName ?? "–"}</div>
            <div className="ps-bwSub">
              {formatNum(data.bestSaw?.stokkerPerTime, 1)} stokker/time
            </div>
            <div className="ps-bwMeta">
              {formatInt(data.bestSaw?.installs)} installs ·{" "}
              {formatNum(data.bestSaw?.totalHours, 1)} timer
            </div>
          </div>

          <div className="ps-card">
            <div className="ps-bwTitle">Minst effektiv sag</div>
            <div className="ps-bwName">{data.worstSaw?.sawName ?? "–"}</div>
            <div className="ps-bwSub">
              {formatNum(data.worstSaw?.stokkerPerTime, 1)} stokker/time
            </div>
            <div className="ps-bwMeta">
              {formatInt(data.worstSaw?.installs)} installs ·{" "}
              {formatNum(data.worstSaw?.totalHours, 1)} timer
            </div>
          </div>
        </div>
      )}

      {data && (
        <div className="ps-card">
          <h2 className="ps-sectionTitle">Effektivitet per sag</h2>

          <div className="ps-list">
            {data.perSaw.map((s) => (
              <div className="ps-row" key={s.sawId}>
                <div className="ps-name">{s.sawName}</div>

                <div className="ps-right">
                  <div className="ps-main">
                    {formatNum(s.stokkerPerTime, 1)}
                  </div>
                  <div className="ps-sub">stokker/time</div>
                </div>

                <div className="ps-right">
                  <div className="ps-main">{formatInt(s.totalStokker)}</div>
                  <div className="ps-sub">stokker</div>
                </div>

                <div className="ps-right">
                  <div className="ps-main">{formatNum(s.totalHours, 1)}</div>
                  <div className="ps-sub">timer</div>
                </div>

                <div className="ps-right ps-hideOnSmall">
                  <div className="ps-main">{formatInt(s.installs)}</div>
                  <div className="ps-sub">installs</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data && (
        <div className="ps-card">
          <h2 className="ps-sectionTitle">Effektivitet per bladtype</h2>

          <div className="ps-list">
            {data.perBladeType.map((b) => (
              <div className="ps-row" key={b.bladeTypeId}>
                <div className="ps-name">{b.bladeTypeName}</div>

                <div className="ps-right">
                  <div className="ps-main">
                    {formatNum(b.stokkerPerTime, 1)}
                  </div>
                  <div className="ps-sub">stokker/time</div>
                </div>

                <div className="ps-right">
                  <div className="ps-main">{formatInt(b.totalStokker)}</div>
                  <div className="ps-sub">stokker</div>
                </div>

                <div className="ps-right">
                  <div className="ps-main">{formatNum(b.totalHours, 1)}</div>
                  <div className="ps-sub">timer</div>
                </div>

                <div className="ps-right ps-hideOnSmall">
                  <div className="ps-main">{formatInt(b.installs)}</div>
                  <div className="ps-sub">installs</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
