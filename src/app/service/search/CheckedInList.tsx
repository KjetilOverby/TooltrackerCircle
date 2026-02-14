"use client";

import React from "react";
import { api } from "~/trpc/react";

const getTimeDistance = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "nylig";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}t`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d`;
};

export default function CheckedInList({
  onSelect,
}: {
  onSelect: (idNummer: string) => void;
}) {
  const { data: services, isLoading } =
    api.service.getActiveServices.useQuery();

  if (isLoading)
    return <div className="loading-state">Laster service-kø...</div>;

  if (!services || services.length === 0) {
    return (
      <div className="empty-state">
        <p>Ingen blader inne til service nå. ☕</p>
      </div>
    );
  }

  return (
    <div className="list-container">
      <div className="list-header-row">
        <h2>Service-kø</h2>
        <span className="badge">{services.length} blader</span>
      </div>

      <div className="table-wrapper">
        <table className="service-table">
          <thead>
            <tr>
              <th>Serienummer</th>
              <th>Type</th>
              <th>Oppdrag</th>
              <th>Inne i</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr
                key={service.id}
                className="clickable table-row"
                onClick={() => onSelect(service.blade?.IdNummer ?? "")}
              >
                <td className="bold-id">{service.blade?.IdNummer}</td>
                <td className="sub-text">{service.blade?.bladeType?.name}</td>
                <td>
                  <span
                    className={`type-pill ${service.serviceType?.toLowerCase() ?? "default-type"}`}
                  >
                    {service.serviceType}
                  </span>
                </td>
                <td className="time-cell">
                  {getTimeDistance(new Date(service.datoInn))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .list-container {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .list-header-row {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #f1f5f9;
        }

        .list-header-row h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
        }

        .badge {
          background: #f1f5f9;
          color: #64748b;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .service-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 14px;
        }

        th {
          background: #f8fafc;
          padding: 12px 20px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
        }

        .table-row {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.1s;
        }

        .table-row:hover {
          background: #f8fafc;
        }

        td {
          padding: 14px 20px;
          color: #475569;
        }

        .bold-id {
          font-weight: 800;
          color: #0f172a;
          font-size: 16px;
        }

        .sub-text {
          color: #64748b;
        }

        .side-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          background: #f1f5f9;
        }

        .side-badge.venstre {
          color: #3b82f6;
          background: #eff6ff;
        }
        .side-badge.høyre {
          color: #ec4899;
          background: #fdf2f8;
        }

        .type-pill {
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 700;
        }

        .type-pill.sliping {
          background: #ecfdf5;
          color: #059669;
        }
        .type-pill.reklamasjon {
          background: #fef2f2;
          color: #dc2626;
        }
        .type-pill.reparasjon {
          background: #fffbeb;
          color: #d97706;
        }

        .time-cell {
          font-weight: 600;
          color: #0f172a;
        }

        .note-cell {
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #94a3b8;
          font-style: italic;
        }

        .empty-state,
        .loading-state {
          padding: 40px;
          text-align: center;
          color: #94a3b8;
        }

        .clickable {
          cursor: pointer;
          transition: all 0.2s;
        }
        .clickable:hover {
          background: #f1f5f9 !important;
          transform: scale(1.002);
        }
        .bold-id {
          color: #2563eb; /* Blå farge for å indikere link/klikkbarhet */
          text-decoration: underline;
          text-decoration-color: transparent;
          transition: text-decoration-color 0.2s;
        }
        .clickable:hover .bold-id {
          text-decoration-color: #2563eb;
        }
      `}</style>
    </div>
  );
}
