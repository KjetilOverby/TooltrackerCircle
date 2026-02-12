"use client";

import React from "react";

// 1. Definer hva en enkelt rad inneholder
interface ReasonData {
  reason: string;
  count: number;
  cumulative?: number; // Valgfri hvis du har beholdt den i backend
}

// 2. Definer props for komponenten
interface ChangeReasonsProps {
  data: ReasonData[];
}

const ChangeReasons: React.FC<ChangeReasonsProps> = ({ data }) => {
  const totalCount = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div>
      <header className="stats-header">
        <h1>Bytteårsaker</h1>
        <p>De største årsakene de siste 30 dagene</p>
      </header>

      <div className="table-wrapper">
        <table className="stats-table">
          <thead>
            <tr>
              <th>Årsak</th>
              <th className="text-right">Antall</th>
              <th style={{ width: "200px" }}>Fordeling</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const andel =
                totalCount > 0 ? Math.round((row.count / totalCount) * 100) : 0;

              return (
                <tr key={index}>
                  <td>
                    <div className="reason-name">{row.reason}</div>
                    <div className="percentage-text">
                      {andel}% av alle bytter
                    </div>
                  </td>
                  <td className="text-right">
                    <span className="count-number">{row.count}</span>
                  </td>
                  <td>
                    <div className="progress-bg">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${andel}%`,
                          backgroundColor: index < 2 ? "#3182ce" : "#cbd5e0",
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style>{`
        
       
        .stats-header h1 {
          margin-bottom: 0.2rem;
          color: #1a202c;
        }
        .stats-header p {
          color: #718096;
          margin-bottom: 2rem;
        }
        .table-wrapper {
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .stats-table {
          width: 100%;
          border-collapse: collapse;
        }
        .stats-table th {
          background: #f8fafc;
          padding: 1rem;
          text-align: left;
          color: #4a5568;
          font-size: 0.85rem;
          border-bottom: 2px solid #edf2f7;
        }
        .stats-table td {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid #edf2f7;
        }
        .reason-name {
          font-weight: 600;
          color: #2d3748;
        }
        .percentage-text {
          font-size: 0.75rem;
          color: #a0aec0;
        }
        .count-number {
          font-weight: 700;
          font-size: 1.1rem;
          color: #2d3748;
        }
        .text-right {
          text-align: right;
        }
        .progress-bg {
          background: #edf2f7;
          height: 12px;
          border-radius: 6px;
          overflow: hidden;
          width: 100%;
        }
        .progress-bar {
          height: 100%;
          transition: width 0.5s ease;
        }
      `}</style>
    </div>
  );
};

export default ChangeReasons;
