"use client";

import React from "react";
import { type RouterOutputs } from "~/trpc/react";
import servicetyper from "../../../appdata/servicetyper";
import reklamasjonstyper from "../../../appdata/reklamasjonstyper";

type BladeData = NonNullable<RouterOutputs["service"]["getByExactIdNummer"]>;

interface CheckInModalProps {
  blade: BladeData;
  handleCreateService: (e: React.FormEvent) => void;
  serviceType: string;
  setServiceType: (val: string) => void;
  feilkode: string; // Ny prop
  setFeilkode: (val: string) => void; // Ny prop
  note: string;
  setNote: (val: string) => void;
  setIsModalOpen: (open: boolean) => void;
  createService: {
    isPending: boolean;
  };
}

const CheckInModal = ({
  blade,
  handleCreateService,
  serviceType,
  setServiceType,
  feilkode,
  setFeilkode,
  note,
  setNote,
  setIsModalOpen,
  createService,
}: CheckInModalProps) => {
  // Resetter feilkode hvis man bytter bort fra Reklamasjon
  const handleServiceTypeChange = (val: string) => {
    setServiceType(val);
    if (val !== "Reklamasjon") setFeilkode("");
    console.log("Service type endret til:", val);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Registrer innlevering</h2>
            <p className="modal-subtitle">
              Opprett ny service på blad: <strong>{blade?.IdNummer}</strong>
            </p>
          </div>
          <button className="close-x" onClick={() => setIsModalOpen(false)}>
            &times;
          </button>
        </div>

        <form onSubmit={handleCreateService} className="modal-body">
          <div className="input-field">
            <label className="section-label">Service-type</label>
            <select
              className="modern-select"
              value={serviceType}
              onChange={(e) => handleServiceTypeChange(e.target.value)}
            >
              {servicetyper.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* DYNAMISK RULLEGARDIN FOR REKLAMASJON */}
          {serviceType === "Reklamasjon" && (
            <div className="input-field animate-slide-down">
              <label className="section-label">Årsak til reklamasjon</label>
              <select
                className="modern-select highlight-select"
                value={feilkode}
                onChange={(e) => setFeilkode(e.target.value)}
                required={serviceType === "Reklamasjon"}
              >
                <option value="">-- Velg årsak --</option>
                {reklamasjonstyper.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="input-field">
            <label className="section-label">Notat til sliper</label>
            <textarea
              className="modern-textarea"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Beskriv eventuelle skader eller spesielle ønsker..."
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setIsModalOpen(false)}
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={
                createService.isPending ||
                (serviceType === "Reklamasjon" && !feilkode)
              }
            >
              {createService.isPending ? "Lagrer..." : "Start Service"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        /* ... All eksisterende CSS ... */

        .highlight-select {
          border-color: #fbbf24; /* Gulaktig border for å markere at dette er viktig */
          background-color: #fffbeb;
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Behold resten av stilene dine fra forrige melding */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-container {
          background: white;
          width: 100%;
          max-width: 500px;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .modal-header {
          padding: 24px 32px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .modal-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }
        .modal-subtitle {
          font-size: 0.9rem;
          color: #64748b;
          margin: 4px 0 0 0;
        }
        .close-x {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #94a3b8;
          cursor: pointer;
        }
        .modal-body {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .section-label {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          display: block;
        }
        .input-field {
          display: flex;
          flex-direction: column;
        }
        .modern-select,
        .modern-textarea {
          padding: 12px;
          border: 2px solid #f1f5f9;
          border-radius: 12px;
          font-size: 0.95rem;
          color: #1e293b;
          background: #f8fafc;
          transition: all 0.2s;
        }
        .modern-select:focus,
        .modern-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .modal-actions {
          padding: 24px 32px;
          background: #f8fafc;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin: 0 -32px -32px -32px;
          border-top: 1px solid #f1f5f9;
        }
        .btn-cancel {
          background: none;
          border: none;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
          padding: 10px 20px;
        }
        .btn-submit {
          background: #0f172a;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-submit:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default CheckInModal;
