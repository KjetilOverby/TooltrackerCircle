"use client";

import React from "react";
import { type RouterOutputs } from "~/trpc/react";

type BladeData = NonNullable<RouterOutputs["service"]["getByExactIdNummer"]>;
type ServiceData = BladeData["services"][number];

interface Props {
  blade: BladeData;
  setSelectedServiceForCheckout: (service: ServiceData) => void;
}

const ServiceHistorikk = ({ blade, setSelectedServiceForCheckout }: Props) => {
  return (
    <div className="component-container">
      <section className="data-section">
        <h2 className="section-title">Servicehistorikk</h2>
        <div className="table-wrapper">
          <table className="pro-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>Loggført</th>
                <th className="text-right">Handling</th>
              </tr>
            </thead>
            <tbody>
              {blade.services.map((s) => (
                <React.Fragment key={s.id}>
                  <tr className={`main-row ${!s.datoUt ? "is-active" : ""}`}>
                    <td>
                      <div className="type-column">
                        <span className="type-text">{s.serviceType}</span>
                        {s.note && (
                          <span className="customer-note-preview">
                            💬 {s.note}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {s.datoUt ? (
                        <span className="status-pill completed">Ferdig</span>
                      ) : (
                        <span className="status-pill pending">På verksted</span>
                      )}
                    </td>
                    <td className="date-text">
                      {new Date(s.datoInn).toLocaleDateString("no-NO")}
                    </td>
                    <td className="text-right">
                      {!s.datoUt ? (
                        <button
                          className="btn-action"
                          onClick={() => setSelectedServiceForCheckout(s)}
                        >
                          Fullfør
                        </button>
                      ) : (
                        <span className="date-done">
                          {new Date(s.datoUt).toLocaleDateString("no-NO")}
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* DEN KULE DETALJ-RADEN */}
                  {s.datoUt && (
                    <tr className="expanded-row">
                      <td colSpan={4}>
                        <div className="timeline-detail">
                          <div className="detail-grid">
                            {/* Venstre: Utførte handlinger */}
                            <div className="detail-section">
                              <label>Utførte handlinger</label>
                              <div className="action-cloud">
                                {s.actions?.map((a) => (
                                  <span key={a.id} className="modern-badge">
                                    {a.kode?.code}
                                  </span>
                                ))}
                                {s.antRep > 0 && (
                                  <span className="stat-tag rep">
                                    +{s.antRep} Rep
                                  </span>
                                )}
                                {s.antTannslipp > 0 && (
                                  <span className="stat-tag error">
                                    ! {s.antTannslipp} Tannslipp
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Høyre: Sliperens kommentar i en "bubble" */}
                            <div className="detail-section">
                              <label>Leverandørens tilbakemelding</label>
                              <div className="supplier-bubble">
                                {s.noteSupplier ||
                                  "Ingen spesifisert kommentar fra leverandør."}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <style jsx>{`
        .data-section {
          background: white;
          border-radius: 20px;
          padding: 24px;
          border: 1px solid #eef2f6;
          box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
        }

        .section-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pro-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 4px;
        }

        .pro-table th {
          padding: 12px 16px;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          text-align: left;
        }

        /* Hovedrader */
        .main-row td {
          padding: 16px;
          background: #ffffff;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
        }
        .main-row td:first-child {
          border-left: 1px solid #f1f5f9;
          border-top-left-radius: 12px;
          border-bottom-left-radius: 12px;
        }
        .main-row td:last-child {
          border-right: 1px solid #f1f5f9;
          border-top-right-radius: 12px;
          border-bottom-right-radius: 12px;
        }

        .is-active td {
          background: #fffdf5;
          border-color: #fef3c7;
        }

        .type-column {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .type-text {
          font-weight: 700;
          color: #334155;
          font-size: 0.95rem;
        }
        .customer-note-preview {
          font-size: 0.8rem;
          color: #64748b;
          font-style: italic;
        }

        /* Statuser */
        .status-pill {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .status-pill.completed {
          background: #f0fdf4;
          color: #16a34a;
        }
        .status-pill.pending {
          background: #fff7ed;
          color: #c2410c;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            opacity: 1;
          }
        }

        /* Detaljer */
        .expanded-row td {
          padding: 0 16px 16px 16px;
        }

        .timeline-detail {
          background: #f8fafc;
          padding: 20px;
          border-radius: 0 0 12px 12px;
          border: 1px solid #e2e8f0;
          border-top: none;
          margin-top: -5px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .detail-section label {
          display: block;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 10px;
        }

        .action-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .modern-badge {
          background: #1e293b;
          color: white;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .stat-tag {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .stat-tag.rep {
          background: #dcfce7;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }
        .stat-tag.error {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        /* Kommentarboblen */
        .supplier-bubble {
          background: white;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          font-size: 0.85rem;
          color: #475569;
          position: relative;
          line-height: 1.5;
        }

        .supplier-bubble::before {
          content: "";
          position: absolute;
          left: -6px;
          top: 15px;
          width: 10px;
          height: 10px;
          background: white;
          border-left: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          transform: rotate(45deg);
        }

        .btn-action {
          background: #0f172a;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-action:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .text-right {
          text-align: right;
        }
        .date-text {
          color: #64748b;
          font-size: 0.85rem;
        }
        .date-done {
          color: #16a34a;
          font-weight: 700;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

export default ServiceHistorikk;
