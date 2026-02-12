"use client";
import React, { useMemo } from "react";
import { api } from "~/trpc/react";

// Definer hva komponenten forventer å få fra hovedsiden
interface MachineOverviewProps {
  filter: {
    from: Date;
    to: Date;
  };
}

const MachineOverview = ({ filter }: MachineOverviewProps) => {
  // 1. Bruk filteret i queryen
  const { data: rawData, isLoading } =
    api.driftstatistikk.getAllMachineStats.useQuery(filter);

  const machineSummary = useMemo(() => {
    if (!rawData) return [];

    const stats = rawData as any[];
    const summaryMap: Record<
      string,
      {
        name: string;
        total: number;
        reasons: { name: string; count: number }[];
      }
    > = {};

    stats.forEach((item) => {
      const mName = item.machineName;
      const reasonName = item.removedReason ?? "Uoppgitt";
      const count = item._count._all;

      summaryMap[mName] ??= { name: mName, total: 0, reasons: [] };
      summaryMap[mName].total += count;
      summaryMap[mName].reasons.push({ name: reasonName, count });
    });

    return Object.values(summaryMap)
      .map((m) => ({
        ...m,
        reasons: m.reasons.sort((a, b) => b.count - a.count),
      }))
      .sort((a, b) => b.total - a.total);
  }, [rawData]);

  if (isLoading)
    return <div className="loading-state">Laster maskinoversikt...</div>;

  return (
    <div className="ps-card">
      {" "}
      {/* Bruker ps-card klassen for konsistens */}
      <header className="stats-header">
        <h2 className="section-title">Maskinoversikt</h2>
        <p className="section-sub">
          Årsaksfordeling per maskin for valgt periode
        </p>
      </header>
      <div className="table-wrapper">
        <table className="overview-table">
          <thead>
            <tr>
              <th style={{ width: "25%" }}>Maskin</th>
              <th className="text-center" style={{ width: "15%" }}>
                Totalt
              </th>
              <th>Fordeling av årsaker</th>
            </tr>
          </thead>
          <tbody>
            {machineSummary.map((m) => (
              <tr key={m.name}>
                <td className="align-top">
                  <div className="machine-name">{m.name}</div>
                </td>
                <td className="text-center align-top">
                  <span className="total-badge">{m.total}</span>
                </td>
                <td>
                  <div className="reason-list">
                    {m.reasons.map((r, i) => {
                      const prosent = Math.round((r.count / m.total) * 100);
                      return (
                        <div key={i} className="reason-item">
                          <div className="reason-info">
                            <span className="reason-label">{r.name}</span>
                            <span className="reason-count">
                              {r.count} stk{" "}
                              <span className="pct">({prosent}%)</span>
                            </span>
                          </div>
                          <div className="reason-bar-bg">
                            <div
                              className="reason-bar-fill"
                              style={{
                                width: `${prosent}%`,
                                backgroundColor:
                                  i === 0 ? "#2563eb" : "#cbd5e1",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .ps-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .stats-header {
          margin-bottom: 1rem;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .section-sub {
          font-size: 0.9rem;
          color: #64748b;
          margin-top: 4px;
        }

        /* VIKTIG: Endret fra collapse til separate for å få mellomrom mellom rader */
        .overview-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 16px;
          margin-top: -16px; /* Drar tabellen opp for å nulle ut spacing på første rad */
        }

        .overview-table th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          padding: 0 12px;
          border: none;
        }

        /* Hver celle i en rad får hvit bakgrunn og ramme for å se ut som et kort */
        .overview-table td {
          padding: 24px 16px;
          background: white;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: top;
        }

        /* Venstre side av "kortet" */
        .overview-table td:first-child {
          border-left: 5px solid #2563eb; /* Den blå stripen som skiller maskinene */
          border-top-left-radius: 12px;
          border-bottom-left-radius: 12px;
        }

        /* Høyre side av "kortet" */
        .overview-table td:last-child {
          border-right: 1px solid #e2e8f0;
          border-top-right-radius: 12px;
          border-bottom-right-radius: 12px;
        }

        .machine-name {
          font-weight: 800;
          color: #1e293b;
          font-size: 1.1rem;
          letter-spacing: -0.01em;
        }

        .total-badge {
          background: #f8fafc;
          color: #2563eb;
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 800;
          border: 1px solid #dbeafe;
          display: inline-block;
        }

        .reason-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .reason-info {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 6px;
        }

        .reason-label {
          font-weight: 600;
          color: #334155;
        }

        .reason-count {
          color: #64748b;
          font-weight: 600;
        }

        .pct {
          color: #94a3b8;
          font-weight: 400;
          margin-left: 4px;
        }

        .reason-bar-bg {
          background: #f1f5f9;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
        }

        .reason-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .text-center {
          text-align: center;
        }
        .loading-state {
          padding: 40px;
          text-align: center;
          color: #64748b;
        }
      `}</style>
    </div>
  );
};

export default MachineOverview;
