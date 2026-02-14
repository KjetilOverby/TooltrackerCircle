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
  // Sorterer slik at nyeste service er øverst, men beholder nummerering basert på totalen
  const sortedServices = [...blade.services].sort(
    (a, b) => new Date(b.datoInn).getTime() - new Date(a.datoInn).getTime(),
  );

  return (
    <div className="history-wrapper">
      <div className="header-flex">
        <h2 className="glam-title">Servicehistorikk</h2>
        <span className="count-badge">{blade.services.length} totalt</span>
      </div>

      <div className="flow-container">
        {sortedServices.map((s, index) => {
          const serviceNumber = blade.services.length - index;
          const isActive = !s.datoUt;

          return (
            <div
              key={s.id}
              className={`flow-card ${isActive ? "is-active" : "finished"}`}
            >
              {/* VENSTRE: Nummer og linje */}
              <div className="flow-sidebar">
                <div className="step-number">{serviceNumber}</div>
                <div className="line"></div>
              </div>

              {/* HØYRE: Innholdet */}
              <div className="flow-main">
                <div className="main-card">
                  <div className="card-header">
                    <div className="type-meta">
                      <span className="date-tag">
                        {new Date(s.datoInn).toLocaleDateString("no-NO", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <h3 className="service-title">{s.serviceType}</h3>
                    </div>
                    {isActive ? (
                      <button
                        className="btn-complete"
                        onClick={() => setSelectedServiceForCheckout(s)}
                      >
                        Fullfør service
                      </button>
                    ) : (
                      <div className="status-completed">
                        ✓ Service utregistrert{" "}
                        {new Date(s.datoUt!).toLocaleDateString("no-NO")}
                      </div>
                    )}
                  </div>

                  <div className="grid-details">
                    {/* SEKSJON 1: INNLEVERING (Check-In) */}
                    <div className="detail-box in">
                      <label className="box-label">
                        Registrert servcie (Check-in)
                      </label>
                      <div className="box-content">
                        {s.feilkode && (
                          <span className="error-pill">{s.feilkode}</span>
                        )}
                        <p className="note-text">
                          {s.note ?? "Standard vedlikehold registrert."}
                        </p>
                      </div>
                    </div>

                    {/* SEKSJON 2: UTFØRT ARBEID (Check-Out) */}
                    {s.datoUt && (
                      <div className="detail-box out">
                        <label className="box-label">
                          Utført på verksted (Check-out)
                        </label>
                        <div className="box-content">
                          <div className="action-row">
                            {s.actions?.map((a) => (
                              <span key={a.id} className="action-tag">
                                {a.kode?.code}
                              </span>
                            ))}
                            {s.antRep > 0 && (
                              <span className="stat-tag rep">
                                +{s.antRep} Rep
                              </span>
                            )}
                            {s.antTannslipp > 0 && (
                              <span className="stat-tag ts">
                                ! {s.antTannslipp} Tannslipp
                              </span>
                            )}
                          </div>
                          <div className="supplier-comment-box">
                            {s.noteSupplier ?? "Ingen merknad fra sliper."}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .history-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          border-radius: 16px;
          margin: 40px 0;
        }
        .header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        .glam-title {
          font-size: 1.75rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.03em;
        }
        .count-badge {
          background: #e2e8f0;
          color: #475569;
          padding: 6px 14px;
          border-radius: 99px;
          font-weight: 800;
          font-size: 0.8rem;
        }

        .flow-container {
          display: flex;
          flex-direction: column;
        }
        .flow-card {
          display: flex;
          gap: 24px;
        }

        /* Tidslinje-grafikk */
        .flow-sidebar {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 40px;
        }
        .step-number {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #f1f5f9;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 900;
          border: 2px solid #e2e8f0;
          z-index: 2;
        }

        .is-active .step-number {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .line {
          width: 2px;
          flex-grow: 1;
          background: #e2e8f0;
          margin: 4px 0;
        }
        .flow-card:last-child .line {
          display: none;
        }

        /* Kortet */
        .flow-main {
          flex-grow: 1;
          padding-bottom: 40px;
        }
        .main-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }
        .is-active .main-card {
          border-left: 5px solid #3b82f6;
          background: #f8faff;
        }
        .finished {
          color: white;
          border-color: #3b82f6;
        }
        .finished .main-card {
          border-left: 5px solid #48d1cc;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .date-tag {
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
        }
        .service-title {
          font-size: 1.25rem;
          font-weight: 900;
          color: #1e293b;
          margin: 4px 0;
        }

        .grid-details {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        @media (min-width: 768px) {
          .grid-details {
            grid-template-columns: 1fr 1fr;
          }
        }

        .detail-box {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          border: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .out {
          background: #ffffff;
          border: 1px solid #e2e8f0;
        }

        .box-label {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }

        .error-pill {
          background: #fee2e2;
          color: #dc2626;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 800;
          display: inline-block;
          margin-bottom: 8px;
        }

        .note-text {
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.5;
          margin: 0;
        }

        .action-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
        }
        .action-tag {
          background: #4682b4;
          color: white;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        .stat-tag {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 800;
        }
        .stat-tag.rep {
          background: #dcfce7;
          color: #166534;
        }
        .stat-tag.ts {
          background: #fff7ed;
          color: #9a3412;
          border: 1px solid #ffedd5;
        }

        .supplier-comment-box {
          font-size: 0.9rem;
          color: #1e293b;
          line-height: 1.5;
          background: #f1f5f9;
          padding: 10px;
          border-radius: 8px;
          border-left: 3px solid #cbd5e1;
        }

        .btn-complete {
          background: #0f172a;
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-complete:hover {
          background: #3b82f6;
          transform: translateY(-1px);
        }
        .status-completed {
          color: #16a34a;
          font-weight: 800;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

export default ServiceHistorikk;
