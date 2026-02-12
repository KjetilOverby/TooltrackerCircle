"use client";

import React from "react";

interface DateFilterProps {
  fromYmd: string;
  setFromYmd: (val: string) => void;
  toYmd: string;
  setToYmd: (val: string) => void;
  label?: string;
}

export const DatePickerComponent = ({
  fromYmd,
  setFromYmd,
  toYmd,
  setToYmd,
  label,
}: DateFilterProps) => {
  // Hjelpefunksjon for å regne ut differansen
  const getPeriodStats = () => {
    if (!fromYmd || !toYmd) return "";

    const start = new Date(fromYmd);
    const end = new Date(toYmd);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 for å inkludere begge dager

    if (diffDays < 0) return "Ugyldig periode";
    if (diffDays === 1) return "1 dag";

    // Enkel konvertering til måneder/år for oversikt
    if (diffDays >= 365) {
      const years = (diffDays / 365).toFixed(1);
      return `${diffDays} dager (~${years} år)`;
    }
    if (diffDays >= 30) {
      const months = (diffDays / 30).toFixed(1);
      return `${diffDays} dager (~${months} mnd)`;
    }

    return `${diffDays} dager`;
  };

  return (
    <div className="filter-card">
      {label && <div className="filter-label-main">{label}</div>}

      <div className="inputs-container">
        <div className="input-group">
          <label>Fra</label>
          <input
            type="date"
            className="date-input"
            value={fromYmd}
            onChange={(e) => setFromYmd(e.target.value)}
          />
        </div>

        <div className="date-separator">→</div>

        <div className="input-group">
          <label>Til</label>
          <input
            type="date"
            className="date-input"
            value={toYmd}
            onChange={(e) => setToYmd(e.target.value)}
          />
        </div>
      </div>

      <div className="period-info">
        <span className="info-label">Periode valgt:</span>
        <span className="info-value">{getPeriodStats()}</span>
      </div>

      <style jsx>{`
        .filter-card {
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .inputs-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .date-separator {
          margin-top: 1rem;
          color: #cbd5e1;
          font-weight: bold;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .input-group label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }

        .date-input {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          color: #1e293b;
          font-weight: 600;
          font-family: inherit;
          outline: none;
          background: #f8fafc;
          transition: all 0.2s;
        }

        .date-input:focus {
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .period-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          border-left: 2px solid #f1f5f9;
          padding-left: 1.5rem;
        }

        .info-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          color: #94a3b8;
          font-weight: 700;
        }

        .info-value {
          font-size: 1.1rem;
          font-weight: 800;
          color: #2563eb;
        }

        @media (max-width: 850px) {
          .filter-card {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .period-info {
            border-left: none;
            border-top: 1px solid #f1f5f9;
            padding-left: 0;
            padding-top: 0.5rem;
            align-items: center;
          }
          .inputs-container {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};
