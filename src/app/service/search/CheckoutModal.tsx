"use client";

import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";

interface CheckoutModalProps {
  service: any; // Her ligger nå serviceType og feilkode fra innsjekk
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

  // Henter verdiene som ble satt ved innsjekk
  const isReklamasjon = service?.serviceType === "Reklamasjon";
  const isTannslipp = service?.feilkode === "Tannslipp";

  const handleToggleKode = (id: string) => {
    setSelectedKodeIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Sjekker om "Reparasjon" er valgt i lista over utført arbeid
  const hasRepairSelected = selectedKodeIds.some((id) => {
    const kode = serviceKoder.find((k) => k.id === id);
    return kode?.name.toLowerCase().includes("reparasjon");
  });

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
          {/* VISER INFO FRA INNSJEKK HVIS DET ER REKLAMASJON */}
          {isReklamasjon && (
            <div className="reklamasjon-info-box">
              <span className="info-tag">REKLAMASJON</span>
              <p>
                Årsak registrert ved innsjekk:{" "}
                <strong>{service.feilkode}</strong>
              </p>
            </div>
          )}

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
                </label>
              ))}
            </div>
          </div>

          <div className="stats-row">
            {/* Viser antall reparasjon hvis "Reparasjon" er krysset av i lista */}
            {hasRepairSelected && (
              <div className="input-field">
                <label>Antall reparerte tenner</label>
                <input
                  type="number"
                  min="0"
                  value={antRep || ""}
                  onChange={(e) => setAntRep(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            )}

            {/* Viser antall tannslipp KUN hvis det ble registrert som Tannslipp ved innsjekk */}
            {isTannslipp && (
              <div className="input-field highlight-field">
                <label>Registrer antall tannslipp</label>
                <input
                  type="number"
                  min="0"
                  value={antTannslipp || ""}
                  onChange={(e) => setAntTannslipp(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            )}
          </div>

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
        }

        .modal-header {
          padding: 24px 32px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
        }
        .modal-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1e293b;
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

        .reklamasjon-info-box {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          padding: 16px;
          border-radius: 12px;
          color: #92400e;
          font-size: 0.9rem;
        }
        .info-tag {
          background: #f59e0b;
          color: white;
          font-size: 0.7rem;
          font-weight: 900;
          padding: 2px 6px;
          border-radius: 4px;
          margin-bottom: 4px;
          display: inline-block;
        }

        .section-label {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 12px;
          display: block;
        }

        .scroll-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          max-height: 200px;
          overflow-y: auto;
        }

        .choice-card {
          padding: 12px;
          border: 2px solid #f1f5f9;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .choice-card.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        .hidden-check {
          display: none;
        }
        .kode-pill {
          background: #1e293b;
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          display: block;
          width: fit-content;
          margin-bottom: 4px;
        }

        .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
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
        }
        .input-field input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .highlight-field input {
          border-color: #f59e0b;
          background: #fffbeb;
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
        }
        .btn-submit {
          background: #0f172a;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .btn-submit:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default CheckoutModal;
