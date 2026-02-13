import React from "react";
import { type RouterOutputs } from "~/trpc/react";

type BladeData = NonNullable<RouterOutputs["service"]["getByExactIdNummer"]>;

interface Props {
  blade: BladeData;
}

const formatDateTime = (date: Date | undefined | null) => {
  if (!date) return "—";
  return new Intl.DateTimeFormat("no-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const DriftsHistorikkComponent = ({ blade }: Props) => {
  return (
    <div className="component-container">
      <section className="data-section">
        <h2 className="section-title">Driftshistorikk</h2>
        <div className="table-wrapper">
          <table className="pro-table">
            <thead>
              <tr>
                <th>Sag</th>
                <th>Montert</th>
                <th>Demontert</th>
                <th className="text-right">Stokker</th>
                <th className="text-right">Tid</th>
                <th className="text-center">Utetemp</th>
              </tr>
            </thead>
            <tbody>
              {blade.installs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    Ingen driftshistorikk registrert for dette bladet
                  </td>
                </tr>
              ) : (
                blade.installs.map((i) => {
                  const uteTemp = i.runLog?.temperatur;
                  const isFrozen =
                    uteTemp !== null && uteTemp !== undefined && uteTemp <= 0;

                  return (
                    <tr key={i.id} className="table-row">
                      <td className="font-semibold text-slate-700">
                        {i.saw?.name}
                      </td>
                      <td className="text-slate-500">
                        {formatDateTime(i.installedAt)}
                      </td>
                      <td className="text-slate-500">
                        {i.removedAt ? (
                          formatDateTime(i.removedAt)
                        ) : (
                          <span className="active-badge">I drift</span>
                        )}
                      </td>
                      <td className="text-right font-medium text-slate-700">
                        {i.runLog?.stokkAnt?.toLocaleString() ?? 0}
                      </td>
                      <td className="text-right text-slate-600">
                        {i.runLog?.sagtid ? `${i.runLog.sagtid}t` : "—"}
                      </td>
                      <td className="text-center">
                        {uteTemp !== null && uteTemp !== undefined ? (
                          <span
                            className={`temp-pill ${isFrozen ? "frozen" : "warm"}`}
                          >
                            {uteTemp}°C {isFrozen ? "❄️" : "☀️"}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <style jsx>{`
        .component-container {
          width: 100%;
        }

        .data-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
          padding-left: 4px;
        }

        .pro-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .pro-table th {
          text-align: left;
          padding: 12px 16px;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          border-bottom: 2px solid #f8fafc;
        }

        .table-row:hover {
          background-color: #fcfdfe;
        }

        .pro-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f8fafc;
        }

        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .font-semibold {
          font-weight: 600;
        }
        .font-medium {
          font-weight: 500;
        }

        .active-badge {
          background: #f0fdf4;
          color: #16a34a;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .temp-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .temp-pill.frozen {
          background-color: #f0f9ff;
          color: #0369a1;
        }

        .temp-pill.warm {
          background-color: #fffaf0;
          color: #9a3412;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default DriftsHistorikkComponent;
