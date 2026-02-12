import React, { useState, useEffect } from "react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  dangerMessage?: string; // Teksten som krever checkbox-bekreftelse
  isDeleting?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Bekreft sletting",
  message = "Er du sikker på at du vil slette dette?",
  dangerMessage,
  isDeleting = false,
}) => {
  const [hasConfirmedDanger, setHasConfirmedDanger] = useState(false);

  // Nullstill checkbox når modalen åpnes/lukkes
  useEffect(() => {
    if (!isOpen) setHasConfirmedDanger(false);
  }, [isOpen]);

  if (!isOpen) return null;

  // Sjekk om knappen skal være deaktivert
  const isConfirmDisabled =
    isDeleting || (!!dangerMessage && !hasConfirmedDanger);

  return (
    <div
      className="delete-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="delete-modal">
        <div className="delete-header">
          <h3>{title}</h3>
        </div>

        <div className="delete-body">
          <p className="main-message">{message}</p>

          {dangerMessage && (
            <div className="danger-zone">
              <p className="danger-text">⚠️ {dangerMessage}</p>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={hasConfirmedDanger}
                  onChange={(e) => setHasConfirmedDanger(e.target.checked)}
                />
                <span>Jeg forstår at dette ikke kan angres</span>
              </label>
            </div>
          )}
        </div>

        <div className="delete-footer">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Avbryt
          </button>
          <button
            className="btn-delete"
            onClick={onConfirm}
            disabled={isConfirmDisabled}
          >
            {isDeleting ? "Sletter..." : "Slett permanent"}
          </button>
        </div>
      </div>

      <style>{`
        .delete-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: grid;
          place-items: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .delete-modal {
          background: white;
          width: min(450px, 90vw);
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }
        .delete-header {
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
        }
        .delete-header h3 {
          margin: 0;
          color: #1e293b;
          font-size: 1.1rem;
        }
        .delete-body {
          padding: 20px;
        }
        .main-message {
          margin-bottom: 16px;
          color: #475569;
        }

        .danger-zone {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          padding: 12px;
          border-radius: 8px;
          margin-top: 10px;
        }
        .danger-text {
          color: #be123c;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .delete-footer {
          padding: 12px 20px;
          background: #f8fafc;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .btn-cancel {
          background: white;
          border: 1px solid #cbd5e1;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-delete {
          background: #e11d48;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-delete:disabled {
          background: #fda4af;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ConfirmDeleteModal;
