"use client";

import React, { useEffect, useState } from "react";
import ListComponent from "./ListComponent";
import type { ListRow } from "./ListComponent";

type Mode = "create" | "edit";

type Props<T extends ListRow> = {
  mode: Mode;
  editingItem: T | null;
  name: string;
  onNameChange: (value: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onStartCreate: () => void;
  onStartEdit: (item: T) => void;
  errorMsg: string | null;
  isSaving: boolean;
  isLoading: boolean;
  items: T[];
  header: string;
  icon: React.ReactNode;
  subheader: string;
  emptyText: string;
  showHasSide: boolean;
  hasSide?: boolean;
  onHasSideChange?: (value: boolean) => void;
  artikkel?: string;
  onArtikkelChange?: (value: string) => void;
  lagerBeholdning?: number;
  onLagerBeholdningChange?: (value: number | undefined) => void;
};

export default function BladeTypeInputComponent<T extends ListRow>(
  props: Props<T>,
) {
  const {
    mode,
    editingItem,
    name,
    onNameChange,
    note,
    onNoteChange,
    onSubmit,
    onStartCreate,
    onStartEdit,
    errorMsg,
    isSaving,
    isLoading,
    items,
    header,
    icon,
    subheader,
    emptyText,
    showHasSide,
    hasSide,
    onHasSideChange,
    artikkel,
    onArtikkelChange,
    lagerBeholdning,
    onLagerBeholdningChange,
  } = props;

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (mode === "edit") setShowForm(true);
  }, [mode]);

  const title =
    mode === "create" ? header : `Rediger: ${editingItem?.name ?? ""}`;

  return (
    <div className="component-container">
      <div className="component-header">
        <h1 className="blade-title">{title}</h1>
        <button
          type="button"
          className={`add-button ${showForm ? "cancel-mode" : ""}`}
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              onStartCreate();
            } else {
              onStartCreate();
              setShowForm(true);
            }
          }}
        >
          {showForm ? "Avbryt" : "+ Legg til"}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2 className="form-subtitle">
            {mode === "create" ? subheader : "Oppdater informasjon"}
          </h2>

          <form onSubmit={onSubmit} className="input-form">
            <div className="field-group">
              <label>Navn</label>
              <input
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Navn på type/maskin…"
                required
              />
            </div>

            {onArtikkelChange && (
              <div className="field-group">
                <label>Artikkelnummer</label>
                <input
                  value={artikkel ?? ""}
                  onChange={(e) => onArtikkelChange(e.target.value)}
                  placeholder="Art.nr..."
                />
              </div>
            )}

            {onLagerBeholdningChange && (
              <div className="field-group">
                <label>Minimum lagerbeholdning</label>
                <input
                  type="number"
                  value={lagerBeholdning ?? ""}
                  onChange={(e) =>
                    onLagerBeholdningChange(
                      Number.isNaN(e.target.valueAsNumber)
                        ? undefined
                        : e.target.valueAsNumber,
                    )
                  }
                  placeholder="Antall..."
                />
              </div>
            )}

            <div className="field-group">
              <label>Notat</label>
              <textarea
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                rows={3}
                placeholder="Valgfritt notat..."
              />
            </div>

            {showHasSide && (
              <div className="field-group checkbox-wrapper">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={hasSide ?? false}
                    onChange={(e) => onHasSideChange?.(e.target.checked)}
                  />
                  <span className="checkbox-label">
                    Har side (Vennstre / Høyre)
                  </span>
                </label>
              </div>
            )}

            {errorMsg && <div className="error-msg">{errorMsg}</div>}

            <div className="form-actions">
              <button type="submit" disabled={isSaving} className="submit-btn">
                {isSaving
                  ? "Lagrer..."
                  : mode === "create"
                    ? "Lagre"
                    : "Oppdater"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="list-wrapper">
        <ListComponent
          isLoading={isLoading}
          items={items}
          icon={icon}
          emptyText={emptyText}
          onEdit={(item) => onStartEdit(item)}
        />
      </div>

      <style jsx>{`
        .component-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .component-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .blade-title {
          font-size: 1.5rem;
          color: #1e293b;
          margin: 0;
          font-weight: 700;
        }

        .add-button {
          background-color: #0f172a;
          color: white;
          padding: 10px 18px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .add-button:hover {
          background-color: #1e293b;
        }

        .add-button.cancel-mode {
          background-color: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .form-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .form-subtitle {
          font-size: 1rem;
          margin-top: 0;
          margin-bottom: 20px;
          color: #64748b;
          font-weight: 500;
        }

        .input-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
        }

        .field-group input,
        .field-group textarea {
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.95rem;
          width: 100%;
          box-sizing: border-box;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .checkbox-container input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .error-msg {
          color: #ef4444;
          background: #fef2f2;
          padding: 10px;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 8px;
        }

        .submit-btn {
          background-color: #2563eb;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .submit-btn:hover {
          background-color: #1d4ed8;
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .list-wrapper {
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}
