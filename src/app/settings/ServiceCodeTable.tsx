"use client";

import { api } from "~/trpc/react";
import ServiceKodeInput from "./ServiceKodeInput";

export default function ServiceKodeTable() {
  const { data: koder, isLoading, error } = api.settings.getAllCodes.useQuery();

  if (isLoading) return <div className="loading">Laster koder...</div>;
  if (error)
    return <div className="error">Kunne ikke hente koder: {error.message}</div>;

  return (
    <div className="table-section">
      <div className="header-row">
        <h1>Servicekoder</h1>
        <ServiceKodeInput /> {/* Knappen for "Ny kode" */}
      </div>

      <div className="table-wrapper">
        <table className="kode-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Beskrivelse</th>
              <th style={{ textAlign: "right" }}>Handlinger</th>
            </tr>
          </thead>
          <tbody>
            {koder && koder.length > 0 ? (
              koder.map((kode) => (
                <tr key={kode.id}>
                  <td className="font-mono">{kode.code}</td>
                  <td>{kode.name}</td>
                  <td style={{ textAlign: "right" }}>
                    {/* Vi sender med den eksisterende koden til modalen */}
                    <ServiceKodeInput editingItem={kode} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="empty-state">
                  Ingen servicekoder funnet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .header-row h1 {
          font-size: 1.5rem;
          color: #1e293b;
          margin: 0;
          font-weight: 700;
        }
        .table-wrapper {
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .kode-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .kode-table th {
          background: #f8fafc;
          padding: 12px 16px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          font-size: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .kode-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }
        .font-mono {
          font-family: monospace;
          font-weight: 600;
          color: #2563eb;
        }
        .empty-state {
          padding: 40px;
          text-align: center;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
