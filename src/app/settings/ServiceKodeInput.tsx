"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

interface ServiceKode {
  id: string;
  code: string;
  name: string;
}

interface Props {
  editingItem?: ServiceKode;
}

export default function ServiceKodeInput({ editingItem }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const utils = api.useUtils();

  // Synkroniser state med editingItem når modalen åpnes for redigering
  useEffect(() => {
    if (editingItem && isOpen) {
      setCode(editingItem.code);
      setName(editingItem.name);
    } else if (!editingItem && isOpen) {
      setCode("");
      setName("");
    }
  }, [editingItem, isOpen]);

  // Mutasjon for å opprette
  const createMutation = api.settings.createCode.useMutation({
    onSuccess: async () => {
      await utils.settings.getAllCodes.invalidate();
      closeModal();
    },
  });

  // Mutasjon for å oppdatere
  const updateMutation = api.settings.updateCode.useMutation({
    onSuccess: async () => {
      await utils.settings.getAllCodes.invalidate();
      closeModal();
    },
  });

  const closeModal = () => {
    setIsOpen(false);
    if (!editingItem) {
      setCode("");
      setName("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return alert("Vennligst fyll ut alle felt");

    if (editingItem) {
      updateMutation.mutate({
        id: editingItem.id,
        code: code.trim(),
        name: name.trim(),
      });
    } else {
      createMutation.mutate({
        code: code.trim(),
        name: name.trim(),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      {editingItem ? (
        <button className="edit-link-btn" onClick={() => setIsOpen(true)}>
          Rediger
        </button>
      ) : (
        <button className="open-btn" onClick={() => setIsOpen(true)}>
          + Ny Servicekode
        </button>
      )}

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {editingItem ? "Rediger servicekode" : "Opprett ny servicekode"}
              </h2>
              <button className="close-x" onClick={closeModal}>
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
                  onClick={closeModal}
                >
                  Avbryt
                </button>
                <button type="submit" className="save-btn" disabled={isPending}>
                  {isPending ? "Lagrer..." : editingItem ? "Oppdater" : "Lagre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .open-btn {
          background-color: #0f172a;
          color: white;
          padding: 10px 16px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: 500;
        }

        .edit-link-btn {
          background: #f1f5f9;
          color: #2563eb;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 0.85rem;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }

        .edit-link-btn:hover {
          background: #e2e8f0;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
        }

        .modal-content {
          background: white;
          padding: 24px;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.1rem;
          color: #1e293b;
        }

        .close-x {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #94a3b8;
          line-height: 1;
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
          box-sizing: border-box;
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
          font-weight: 500;
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
