"use client";
import React, { useMemo } from "react";
import { api } from "~/trpc/react";

const MachineOverview = () => {
  const { data: rawData, isLoading } =
    api.driftstatistikk.getAllMachineStats.useQuery({});

  const machineSummary = useMemo(() => {
    if (!rawData) return [];

    // Vi tvinger typen siden vi vet hva backenden sender nå
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

      // Bruk ??= her for å tilfredsstille linteren
      summaryMap[mName] ??= { name: mName, total: 0, reasons: [] };

      summaryMap[mName].total += count;
      summaryMap[mName].reasons.push({ name: reasonName, count });
    });

    // Sorter maskiner etter totalt antall bytter, og årsaker per maskin etter antall
    return Object.values(summaryMap)
      .map((m) => ({
        ...m,
        reasons: m.reasons.sort((a, b) => b.count - a.count),
      }))
      .sort((a, b) => b.total - a.total);
  }, [rawData]);

  if (isLoading) return <div>Laster oversikt...</div>;

  return (
    <div>
      <header className="stats-header">
        <h1>Maskinoversikt</h1>
        <p>Fullstendig oversikt over alle årsaker per maskin</p>
      </header>

      <div className="table-wrapper">
        <table className="overview-table">
          <thead>
            <tr>
              <th style={{ width: "25%" }}>Maskin</th>
              <th className="text-center" style={{ width: "10%" }}>
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
                              {r.count} stk ({prosent}%)
                            </span>
                          </div>
                          <div className="reason-bar-bg">
                            <div
                              className="reason-bar-fill"
                              style={{
                                width: `${prosent}%`,
                                backgroundColor:
                                  i === 0 ? "#3182ce" : "#94a3b8",
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

      <style>{`


  .stats-header {
    margin-bottom: 2.5rem;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 1rem;
  }

  /* Vi fjerner selve table-taggen og bruker div-baserte kort i stedet, 
     men hvis du beholder tabellen, fungerer dette for <tr>: */
  .overview-table { 
    width: 100%; 
    border-spacing: 0 1rem; /* Lager mellomrom mellom radene */
    border-collapse: separate; 
  }

  .overview-table tr {
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    border-radius: 8px;
    transition: transform 0.2s ease;
  }

  .overview-table tr:hover {
    transform: scale(1.005);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .overview-table td { 
    padding: 1.5rem; 
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
    background: white;
  }

  /* Venstre kant - farget stripe for å skille maskiner */
  .overview-table td:first-child {
    border-left: 5px solid #3182ce;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }

  .overview-table td:last-child {
    border-right: 1px solid #e2e8f0;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  .align-top { vertical-align: top; }
  
  .machine-name { 
    font-weight: 800; 
    color: #1e293b; 
    font-size: 1.2rem; 
    letter-spacing: -0.025em;
  }

  .total-badge { 
    background: #f1f5f9; 
    color: #1e293b; 
    padding: 0.5rem 1rem; 
    border-radius: 6px; 
    font-weight: 800; 
    font-size: 1rem;
    border: 1px solid #e2e8f0;
    display: inline-block;
  }
  
  .reason-list { 
    display: flex; 
    flex-direction: column; 
    gap: 1rem; 
  }

  .reason-item { 
    padding: 0.5rem;
    border-radius: 6px;
    background: #ffffff;
  }

  .reason-info { 
    display: flex; 
    justify-content: space-between; 
    font-size: 0.9rem; 
    margin-bottom: 0.4rem;
  }

  .reason-label { 
    font-weight: 600; 
    color: #334155; 
  }

  .reason-count { 
    color: #64748b; 
    font-variant-numeric: tabular-nums;
  }
  
  .reason-bar-bg { 
    background: #f1f5f9; 
    height: 10px; 
    border-radius: 5px; 
    overflow: hidden; 
  }

  .reason-bar-fill { 
    height: 100%; 
    border-radius: 5px; 
    background: linear-gradient(90deg, #3182ce 0%, #4299e1 100%);
  }

  .text-center { text-align: center; }

  /* Seksjonsoverskrift for hver maskin */
  .machine-label {
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    color: #94a3b8;
    margin-bottom: 0.25rem;
  }
`}</style>
    </div>
  );
};

export default MachineOverview;
