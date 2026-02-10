"use client";
import React from "react";
import type { RouterOutputs } from "~/trpc/react";

// Definerer sag-typen for å bli kvitt 'any'
interface Saw {
  id: string;
  name: string;
}

interface CreateInputComponentProps {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  form: {
    bladeTypeId: string;
    bladeNumber: string;
    note: string;
    side: string;
    hasSide?: boolean;
    produsent: string;
  };
  saws: Saw[];
  bladeTypes: {
    id: string;
    name: string;
    hasSide?: boolean;
  }[];
  handleChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  isLoading?: boolean;
}

const produsenter = ["Kanefusa", "Frezite", "Tenryu", "Apsi", "Ukjent"];

const CreateInputComponent: React.FC<CreateInputComponentProps> = ({
  handleSubmit,
  form,
  handleChange,
  bladeTypes,
  isLoading,
}) => {
  const selectedBladeType = bladeTypes.find((bt) => bt.id === form.bladeTypeId);
  const showSide = selectedBladeType?.hasSide === true;

  return (
    <div className="formContainer">
      <style>{`
        .formContainer {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 32px;
          max-width: 500px;
          margin: 2rem auto;
          color: #f8fafc;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        }

        .formTitle {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .formField {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .formLabel {
          font-size: 13px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-left: 4px;
        }

        .formInput, .formSelect, .formTextarea {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 16px;
          color: #fff;
          font-size: 15px;
          transition: all 0.2s ease;
          outline: none;
        }

        .formInput:focus, .formSelect:focus, .formTextarea:focus {
          border-color: #3b82f6;
          background: rgba(15, 23, 42, 0.8);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        }

        .formSelect option {
          background: #1e293b;
          color: #fff;
        }

        .formTextarea {
          resize: vertical;
          min-height: 80px;
        }

        .formButton {
          margin-top: 10px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
        }

        .formButton:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }

        .formButton:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .sideFadeIn {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <h1 className="formTitle">Registrer nytt sagblad</h1>

      <form onSubmit={handleSubmit} className="form">
        <div className="formField">
          <label className="formLabel">Bladetype</label>
          <select
            name="bladeTypeId"
            value={form.bladeTypeId}
            onChange={handleChange}
            className="formSelect"
            required
          >
            <option value="">Velg bladetype...</option>
            {bladeTypes.map((bt) => (
              <option key={bt.id} value={bt.id}>
                {bt.name}
              </option>
            ))}
          </select>
        </div>

        <div className="formField">
          <label className="formLabel">Produsent</label>
          <select
            name="produsent"
            value={form.produsent}
            onChange={handleChange}
            className="formSelect"
            required
          >
            <option value="">Velg produsent...</option>
            {produsenter.map((prod) => (
              <option key={prod} value={prod}>
                {prod}
              </option>
            ))}
          </select>
        </div>

        {showSide && (
          <div className="formField sideFadeIn">
            <label className="formLabel">Side</label>
            <select
              name="side"
              value={form.side}
              onChange={handleChange}
              className="formSelect"
              required
            >
              <option disabled value="">
                Velg side
              </option>
              <option value="Venstre">Venstre</option>
              <option value="Høyre">Høyre</option>
            </select>
          </div>
        )}

        <div className="formField">
          <label className="formLabel">ID / Serienummer</label>
          <input
            type="text"
            name="bladeNumber"
            value={form.bladeNumber}
            onChange={handleChange}
            className="formInput"
            placeholder="f.eks. B-00123"
            required
          />
        </div>

        <div className="formField">
          <label className="formLabel">Notat</label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            className="formTextarea"
            rows={3}
            placeholder="Valgfri kommentar om bladet..."
          />
        </div>

        <button type="submit" className="formButton" disabled={isLoading}>
          {isLoading ? <>Lagrer...</> : "Lagre blad i systemet"}
        </button>
      </form>
    </div>
  );
};

export default CreateInputComponent;
