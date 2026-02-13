"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function ServiceKodeInput() {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const utils = api.useUtils();

  const createMutation = api.settings.create.useMutation({
    onSuccess: async () => {
      // Oppdaterer listen over servicekoder hvis du har en slik query
      await utils.settings.getAllCodes.invalidate();

      // Nullstill skjema og lukk modal
      setCode("");
      setName("");
      setIsOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return alert("Vennligst fyll ut alle felt");

    createMutation.mutate({
      code: code.trim(),
      name: name.trim(),
    });
  };

  return (
    <>
      <button className="open-btn" onClick={() => setIsOpen(true)}>
        + Ny Servicekode
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Opprett ny servicekode</h2>
              <button className="close-x" onClick={() => setIsOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Kode (f.eks. SERV 402)</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Skriv kode..."
                  required
                />
              </div>

              <div className="input-group">
                <label>Beskrivelse (f.eks. SLIP HM/STELLIT)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Skriv navn..."
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsOpen(false)}
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="save-btn"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Lagrer..." : "Lagre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .open-btn {
          background-color: #0f172a;
          color: white;
          padding: 10px 16px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: 500;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }

        .modal-content {
          background: white;
          padding: 24px;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h2 { margin: 0; font-size: 1.1rem; color: #1e293b; }

        .close-x {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #94a3b8;
        }

        .input-group {
          margin-bottom: 16px;
        }

        .input-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 6px;
          color: #475569;
        }

        .input-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.95rem;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 24px;
        }

        .cancel-btn {
          background: #f1f5f9;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
          color: #475569;
        }

        .save-btn {
          background: #2563eb;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
