"use client";

import React from "react";

// 1. Definer hva en enkelt rad inneholder
interface ReasonData {
  reason: string;
  count: number;
}

// 2. Definer props - vi legger til filter her
interface ChangeReasonsProps {
  data: ReasonData[];
  filter: {
    from: Date;
    to: Date;
  };
}

const ChangeReasons: React.FC<ChangeReasonsProps> = ({ data, filter }) => {
  const totalCount = data.reduce((acc, curr) => acc + curr.count, 0);

  // Formater datoer for visning i teksten
  const formatDate = (d: Date) =>
    d.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "short",
    });

  return (
    <div className="ps-card">
      <header className="stats-header">
        <h2 className="section-title">Bytteårsaker</h2>
        <p className="section-sub">
          Fordeling av årsaker fra {formatDate(filter.from)} til{" "}
          {formatDate(filter.to)}
        </p>
      </header>

      <div className="table-wrapper">
        <table className="stats-table">
          <thead>
            <tr>
              <th>Årsak</th>
              <th className="text-right">Antall</th>
              <th style={{ width: "250px" }}>Fordeling</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty-state">
                  Ingen data for valgt periode
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const andel =
                  totalCount > 0
                    ? Math.round((row.count / totalCount) * 100)
                    : 0;

                return (
                  <tr key={index}>
                    <td>
                      <div className="reason-name">{row.reason}</div>
                      <div className="percentage-text">
                        {andel}% av alle registrerte bytter
                      </div>
                    </td>
                    <td className="text-right">
                      <span className="count-number">{row.count}</span>
                    </td>
                    <td>
                      <div className="progress-container">
                        <div className="progress-bg">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${andel}%`,
                              backgroundColor:
                                index === 0 ? "#2563eb" : "#94a3b8",
                            }}
                          ></div>
                        </div>
                        <span className="progress-label">{andel}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
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
          margin-bottom: 1.5rem;
        }

        .stats-table {
          width: 100%;
          border-collapse: collapse;
        }

        .stats-table th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          padding: 12px;
          border-bottom: 2px solid #f1f5f9;
        }

        .stats-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #f1f5f9;
        }

        .reason-name {
          font-weight: 700;
          color: #1e293b;
          font-size: 1rem;
        }

        .percentage-text {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 2px;
        }

        .count-number {
          font-weight: 800;
          font-size: 1.1rem;
          color: #0f172a;
        }

        .text-right {
          text-align: right;
        }

        /* Progress Bar Styling */
        .progress-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .progress-bg {
          background: #f1f5f9;
          height: 10px;
          border-radius: 5px;
          overflow: hidden;
          flex-grow: 1;
        }

        .progress-bar {
          height: 100%;
          border-radius: 5px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .progress-label {
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          min-width: 35px;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #94a3b8;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default ChangeReasons;
