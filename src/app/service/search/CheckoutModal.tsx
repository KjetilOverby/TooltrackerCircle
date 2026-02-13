"use client";

import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";

interface CheckoutModalProps {
  service: any;
  bladeIdNummer: string;
  serviceKoder: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const CheckoutModal = ({
  service,
  bladeIdNummer,
  serviceKoder,
  onClose,
  onSuccess,
}: CheckoutModalProps) => {
  const [selectedKodeIds, setSelectedKodeIds] = useState<string[]>([]);
  const [antRep, setAntRep] = useState(0);
  const [antTannslipp, setAntTannslipp] = useState(0);
  const [noteSupplier, setNoteSupplier] = useState("");

  const checkOutMutation = api.service.checkOut.useMutation({
    onSuccess: () => onSuccess(),
  });

  const handleToggleKode = (id: string) => {
    setSelectedKodeIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Forbedret sjekk: Ser etter "reparasjon" i både navn og kode
  const hasRepair = selectedKodeIds.some((id) => {
    const kode = serviceKoder.find((k) => k.id === id);
    if (!kode) return false;
    const searchStr = `${kode.name} ${kode.code}`.toLowerCase();
    return searchStr.includes("Reparasjon") || searchStr.includes("Reparasjon");
  });

  // Forbedret sjekk: Ser etter "tannslipp" eller "reklamasjon"
  const hasReklamasjon = selectedKodeIds.some((id) => {
    const kode = serviceKoder.find((k) => k.id === id);
    if (!kode) return false;
    const searchStr = `${kode.name} ${kode.code}`.toLowerCase();
    return searchStr.includes("Tannslipp") || searchStr.includes("Reklamasjon");
  });

  // Nullstill antall hvis valget fjernes (valgfritt, men ryddig)
  useEffect(() => {
    if (!hasRepair) setAntRep(0);
  }, [hasRepair]);

  useEffect(() => {
    if (!hasReklamasjon) setAntTannslipp(0);
  }, [hasReklamasjon]);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Fullfør Service</h2>
            <p className="modal-subtitle">
              Registrer utført arbeid på blad <strong>{bladeIdNummer}</strong>
            </p>
          </div>
          <button className="close-x" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="input-section">
            <label className="section-label">Hva er utført?</label>
            <div className="scroll-container">
              {serviceKoder.map((k) => (
                <label
                  key={k.id}
                  className={`choice-card ${selectedKodeIds.includes(k.id) ? "selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="hidden-check"
                    checked={selectedKodeIds.includes(k.id)}
                    onChange={() => handleToggleKode(k.id)}
                  />
                  <span className="kode-pill">{k.code}</span>
                  <span className="kode-label">{k.name}</span>
                  <div className="custom-check"></div>
                </label>
              ))}
            </div>
          </div>

          {/* Viser feltene kun hvis de relevante kodene er valgt */}
          {(hasRepair || hasReklamasjon) && (
            <div className="stats-row animate-slide-in">
              {hasRepair && (
                <div className="input-field">
                  <label>Antall tenner reparert</label>
                  <input
                    type="number"
                    min="1"
                    autoFocus
                    value={antRep || ""}
                    onChange={(e) => setAntRep(Number(e.target.value))}
                    placeholder="Eks: 4"
                  />
                </div>
              )}
              {hasReklamasjon && (
                <div className="input-field">
                  <label>Antall tannslipp</label>
                  <input
                    type="number"
                    min="1"
                    value={antTannslipp || ""}
                    onChange={(e) => setAntTannslipp(Number(e.target.value))}
                    placeholder="Eks: 2"
                  />
                </div>
              )}
            </div>
          )}

          <div className="input-field">
            <label>Sliperens notat</label>
            <textarea
              rows={3}
              value={noteSupplier}
              onChange={(e) => setNoteSupplier(e.target.value)}
              placeholder="Skriv merknader her..."
            />
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">
            Avbryt
          </button>
          <button
            className="btn-submit"
            disabled={
              checkOutMutation.isPending || selectedKodeIds.length === 0
            }
            onClick={() =>
              checkOutMutation.mutate({
                serviceId: service.id,
                datoUt: new Date(),
                noteSupplier,
                selectedKodeIds,
                antRep,
                antTannslipp,
              })
            }
          >
            {checkOutMutation.isPending ? "Lagrer..." : "Ferdigstill service"}
          </button>
        </div>
      </div>

      <style jsx>{`
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
          max-width: 550px;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalPop {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
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
          margin-bottom: 12px;
          display: block;
        }

        .scroll-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          max-height: 240px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .choice-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 12px;
          border: 2px solid #f1f5f9;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .choice-card:hover {
          border-color: #e2e8f0;
          background: #f8fafc;
        }
        .choice-card.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .hidden-check {
          position: absolute;
          opacity: 0;
        }
        .kode-pill {
          background: #1e293b;
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          width: fit-content;
        }
        .kode-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
        }

        .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .input-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-field label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #475569;
        }

        .input-field input,
        .input-field textarea {
          padding: 12px;
          border: 2px solid #f1f5f9;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .input-field input:focus,
        .input-field textarea:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
        }

        .modal-actions {
          padding: 24px 32px;
          background: #f8fafc;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
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
        .btn-submit:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default CheckoutModal;
