"use client";

import React, { useMemo, useState } from "react";
import { api } from "~/trpc/react";
import { dateToYMD, startOfDay, endOfDay } from "~/utils/dateUtils";
import { DatePickerComponent } from "../../../_components/common/DatePickerComponent";

// Hjelpefunksjoner for formatering
function formatNum(n: number | null | undefined, digits = 1) {
  if (n === null || n === undefined || Number.isNaN(n)) return "–";
  return n.toFixed(digits);
}

function formatInt(n: number | null | undefined) {
  if (n === null || n === undefined || Number.isNaN(n)) return "–";
  return Math.round(n).toString();
}

export default function ProductionHour() {
  const [fromYmd, setFromYmd] = useState(
    dateToYMD(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
  );
  const [toYmd, setToYmd] = useState(dateToYMD(new Date()));

  const filter = useMemo(
    () => ({
      from: startOfDay(fromYmd),
      to: endOfDay(toYmd),
    }),
    [fromYmd, toYmd],
  );

  const q = api.driftstatistikk.getProductionEfficiency.useQuery(filter, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const data = q.data;

  const setRange = (days: number) => {
    setFromYmd(dateToYMD(new Date(Date.now() - days * 24 * 60 * 60 * 1000)));
    setToYmd(dateToYMD(new Date()));
  };

  return (
    <div className="ps-wrap">
      <style jsx>{`
        .ps-wrap {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          color: #334155;
          max-width: 1200px;
          margin: 0 auto;
          font-family: "Inter", sans-serif;
        }
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
          color: #0f172a;
        }
        .ps-actions {
          display: flex;
          gap: 8px;
        }
        .ps-btn {
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .ps-card {
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
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
          margin-bottom: 8px;
        }
        .ps-kpiValueBig {
          font-size: 32px;
          font-weight: 800;
          color: #2563eb;
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .ps-kpiUnit {
          font-size: 14px;
          font-weight: 600;
          color: #94a3b8;
        }
        .ps-bestWorstGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .ps-bwCard {
          border-left: 4px solid #e2e8f0;
        }
        .ps-bwCard.best {
          border-left-color: #16a34a;
        }
        .ps-bwCard.worst {
          border-left-color: #dc2626;
        }
        .ps-bwTitle {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 12px;
        }
        .ps-bwName {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
        }
        .ps-sectionTitle {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 16px;
          margin-top: 8px;
        }
        .ps-row {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr 0.8fr;
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          align-items: center;
        }
        .ps-row:last-child {
          border-bottom: none;
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
        @media (max-width: 860px) {
          .ps-overallGrid,
          .ps-bestWorstGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="ps-top">
        <h1 className="ps-title">Produksjonsstatistikk</h1>
        <div className="ps-actions">
          <button className="ps-btn" onClick={() => setRange(30)}>
            30 dager
          </button>
          <button className="ps-btn" onClick={() => setRange(90)}>
            90 dager
          </button>
        </div>
      </div>

      <DatePickerComponent
        fromYmd={fromYmd}
        setFromYmd={setFromYmd}
        toYmd={toYmd}
        setToYmd={setToYmd}
      />

      {q.isLoading && (
        <div
          className="ps-card"
          style={{ textAlign: "center", color: "#64748b" }}
        >
          Henter data...
        </div>
      )}

      {data && (
        <>
          {/* OVERALL KPI CARD */}
          <div className="ps-card ps-overallGrid">
            <div>
              <div className="ps-kpiLabel">Effektivitet</div>
              <div className="ps-kpiValueBig">
                {formatNum(data.overall.stokkerPerTime, 1)}
                <span className="ps-kpiUnit">stk/t</span>
              </div>
            </div>
            <div>
              <div className="ps-kpiLabel">Installeringer</div>
              <div className="ps-main" style={{ fontSize: "20px" }}>
                {formatInt(data.overall.installs)}
              </div>
            </div>
            <div>
              <div className="ps-kpiLabel">Total stokker</div>
              <div className="ps-main" style={{ fontSize: "20px" }}>
                {formatInt(data.overall.totalStokker)}
              </div>
            </div>
            <div>
              <div className="ps-kpiLabel">Total sagtid</div>
              <div className="ps-main" style={{ fontSize: "20px" }}>
                {formatNum(data.overall.totalHours, 1)}{" "}
                <span className="ps-sub">t</span>
              </div>
            </div>
          </div>

          {/* BEST/WORST CARDS */}
          <div className="ps-bestWorstGrid">
            <div className="ps-card ps-bwCard best">
              <div className="ps-bwTitle">Mest effektiv sag</div>
              <div className="ps-bwName">{data.bestSaw?.sawName ?? "–"}</div>
              <div
                style={{ color: "#16a34a", fontWeight: 700, margin: "8px 0" }}
              >
                {formatNum(data.bestSaw?.stokkerPerTime, 1)} stokker/time
              </div>
              <div className="ps-sub">
                {formatInt(data.bestSaw?.installs)} inst. ·{" "}
                {formatNum(data.bestSaw?.totalHours, 1)}t
              </div>
            </div>
            <div className="ps-card ps-bwCard worst">
              <div className="ps-bwTitle">Minst effektiv sag</div>
              <div className="ps-bwName">{data.worstSaw?.sawName ?? "–"}</div>
              <div
                style={{ color: "#dc2626", fontWeight: 700, margin: "8px 0" }}
              >
                {formatNum(data.worstSaw?.stokkerPerTime, 1)} stokker/time
              </div>
              <div className="ps-sub">
                {formatInt(data.worstSaw?.installs)} inst. ·{" "}
                {formatNum(data.worstSaw?.totalHours, 1)}t
              </div>
            </div>
          </div>

          {/* TABELL 1: EFFEKTIVITET PER SAG */}
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
                    <div className="ps-sub">stk/t</div>
                  </div>
                  <div className="ps-right">
                    <div className="ps-main">{formatInt(s.totalStokker)}</div>
                    <div className="ps-sub">stokker</div>
                  </div>
                  <div className="ps-right">
                    <div className="ps-main">{formatNum(s.totalHours, 1)}</div>
                    <div className="ps-sub">timer</div>
                  </div>
                  <div className="ps-right">
                    <div className="ps-main">{formatInt(s.installs)}</div>
                    <div className="ps-sub">inst.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TABELL 2: EFFEKTIVITET PER BLADTYPE (DENNE VAR MANGLENDE) */}
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
                    <div className="ps-sub">stk/t</div>
                  </div>
                  <div className="ps-right">
                    <div className="ps-main">{formatInt(b.totalStokker)}</div>
                    <div className="ps-sub">stokker</div>
                  </div>
                  <div className="ps-right">
                    <div className="ps-main">{formatNum(b.totalHours, 1)}</div>
                    <div className="ps-sub">timer</div>
                  </div>
                  <div className="ps-right">
                    <div className="ps-main">{formatInt(b.installs)}</div>
                    <div className="ps-sub">inst.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
