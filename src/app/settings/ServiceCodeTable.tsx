"use client";

import { api } from "~/trpc/react";
import ServiceKodeInput from "./ServiceKodeInput"; // Antar at dette er filnavnet på modalen din

export default function ServiceKodeTable() {
  const { data: koder, isLoading, error } = api.settings.getAllCodes.useQuery();

  if (isLoading) return <div className="loading">Laster koder...</div>;
  if (error)
    return <div className="error">Kunne ikke hente koder: {error.message}</div>;

  return (
    <div className="">
      <div className="header-row">
        <h1>Servicekoder</h1>
        <ServiceKodeInput />
      </div>

      <div className="table-wrapper">
        <table className="kode-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Beskrivelse</th>
            </tr>
          </thead>
          <tbody>
            {koder && koder.length > 0 ? (
              koder.map((kode) => (
                <tr key={kode.id}>
                  <td className="font-mono">{kode.code}</td>
                  <td>{kode.name}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="empty-state">
                  Ingen servicekoder funnet. Trykk på knappen over for å legge
                  til.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .container {
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
        }

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
        }

        .table-wrapper {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .kode-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.95rem;
        }

        .kode-table th {
          background: #f8fafc;
          padding: 12px 16px;
          font-weight: 600;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }

        .kode-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }

        .kode-table tr:last-child td {
          border-bottom: none;
        }

        .kode-table tr:hover {
          background-color: #f8fafc;
        }

        .font-mono {
          font-family: monospace;
          font-weight: 600;
          color: #2563eb;
        }

        .date-col {
          color: #94a3b8;
          font-size: 0.85rem;
        }

        .empty-state {
          padding: 40px;
          text-align: center;
          color: #94a3b8;
          font-style: italic;
        }

        .loading, .error {
          padding: 40px;
          text-align: center;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
