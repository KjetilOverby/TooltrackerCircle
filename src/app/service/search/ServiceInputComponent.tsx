"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function ServiceInputComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [antRep, setAntRep] = useState(0);
  const [antTannslipp, setAntTannslipp] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const utils = api.useUtils();

  // 1. Finn bladet vi skal registrere service på
  const { data: blade, isFetching } = api.service.getByExactIdNummer.useQuery(
    { idNummer: searchTerm },
    { enabled: searchTerm.length > 2 }, // Søker automatisk når man har skrevet litt
  );

  // 2. Mutation for å lagre
  const createService = api.service.create.useMutation({
    onSuccess: () => {
      // Oppdaterer alle søk og lister i hele appen så dataene er ferske
      void utils.service.invalidate();
      setShowSuccess(true);
      setAntRep(0);
      setAntTannslipp(0);
      setSearchTerm("");
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blade) return;

    createService.mutate({
      bladeId: blade.id,
      datoInn: new Date(),
    });
  };

  return (
    <div className="service-input-container">
      <div className="input-card">
        <h2 className="title">Registrer Service</h2>

        <form onSubmit={handleSubmit} className="service-form">
          {/* SØK I SKJEMAET */}
          <div className="field-group">
            <label>Søk blad (Serienummer)</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="F.eks. B100..."
              className="main-input"
            />
          </div>

          {/* VIS BLADINFO HVIS FUNNET */}
          {blade && (
            <div className="blade-preview animate-in">
              <div className="preview-info">
                <span className="preview-id">{blade.IdNummer}</span>
                <span className="preview-type">{blade.bladeType?.name}</span>
              </div>

              <div className="form-grid">
                <div className="field-group">
                  <label>Ant. Reparasjoner</label>
                  <input
                    type="number"
                    value={antRep}
                    onChange={(e) => setAntRep(Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="field-group">
                  <label>Ant. Tannslipp</label>
                  <input
                    type="number"
                    value={antTannslipp}
                    onChange={(e) => setAntTannslipp(Number(e.target.value))}
                    min="0"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={createService.isPending}
              >
                {createService.isPending
                  ? "Lagrer..."
                  : "Registrer Innlevering"}
              </button>
            </div>
          )}

          {isFetching && <p className="status-msg">Sjekker databasen...</p>}
          {showSuccess && <p className="success-msg">✅ Service registrert!</p>}
        </form>
      </div>

      <style>{`
        .service-input-container {
          padding: 1rem;
          max-width: 500px;
          margin: 0 auto;
        }
        .input-card {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }
        .title { margin-top: 0; font-size: 1.25rem; font-weight: 800; color: #0f172a; }
        .service-form { display: flex; flex-direction: column; gap: 1.25rem; }
        
        .field-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .field-group label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
        
        input {
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          font-size: 1rem;
          outline-color: #3b82f6;
        }
        
        .blade-preview {
          background: #f8fafc;
          padding: 1.25rem;
          border-radius: 0.75rem;
          border: 1px solid #3b82f6;
          margin-top: 0.5rem;
        }
        .preview-info { display: flex; justify-content: space-between; margin-bottom: 1rem; }
        .preview-id { font-weight: 900; color: #1e40af; }
        .preview-type { font-size: 0.8rem; color: #64748b; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        
        .submit-btn {
          width: 100%;
          margin-top: 1rem;
          padding: 1rem;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 700;
          cursor: pointer;
        }
        .submit-btn:hover { background: #1e293b; }
        
        .success-msg { color: #059669; font-weight: bold; text-align: center; }
        .status-msg { font-size: 0.8rem; color: #94a3b8; text-align: center; }

        .animate-in { animation: slideDown 0.3s ease-out; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
