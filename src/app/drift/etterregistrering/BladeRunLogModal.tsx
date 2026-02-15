"use client";

import React, { useEffect, useState } from "react";
import servicetyper from "~/appdata/servicetyper";
import reklamasjonstyper from "~/appdata/reklamasjonstyper";

// --- TYPER ---

export type BladeRunLogInitial = {
  id: string;
  loggedAt: Date;
  sagtid: number | null;
  feilkode: string | null;
  temperatur: number | null;
  sideklaring: number | null;
  ampere: number | null;
  stokkAnt: number | null;
  alt: string | null;
};

type UpsertBladeRunLogInput = {
  installId: string;
  loggedAt: Date;
  sagtid?: number;
  feilkode?: string;
  temperatur?: number;
  sideklaring?: number;
  ampere?: number;
  stokkAnt?: number;
  alt?: string;
  // Denne MÅ matche det du sender i handleSaveClick
  createService?: {
    serviceType: string;
    note?: string;
    feilkode?: string; // Legg til denne for sikkerhets skyld
  };
};

type BladeRunLogModalProps = {
  open: boolean;
  installId: string;
  sawName?: string;
  bladeIdNummer?: string;
  initial?: BladeRunLogInitial | null;
  isSaving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (input: UpsertBladeRunLogInput) => Promise<void> | void;
};

// --- HJELPEFUNKSJONER ---

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function datetimeLocalToDate(value: string) {
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
}

function parseNullableNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseNullableInt(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function numToStr(n: number | null | undefined) {
  return n === null || n === undefined ? "" : String(n);
}

// --- HOVEDKOMPONENT ---

export default function BladeRunLogModal({
  open,
  installId,
  sawName,
  bladeIdNummer,
  initial = null,
  isSaving = false,
  error = null,
  onClose,
  onSave,
}: BladeRunLogModalProps) {
  // Driftsdata states
  const [loggedAt, setLoggedAt] = useState<string>(
    toDatetimeLocalValue(new Date()),
  );
  const [sagtid, setSagtid] = useState<string>("");
  const [feilkode, setFeilkode] = useState<string>("");
  const [temperatur, setTemperatur] = useState<string>("");
  const [sideklaring, setSideklaring] = useState<string>("");
  const [ampere, setAmpere] = useState<string>("");
  const [stokkAnt, setStokkAnt] = useState<string>("");
  const [alt, setAlt] = useState<string>("");
  const [reklamasjonsType, setReklamasjonsType] = useState("");

  // Service states
  const [includeService, setIncludeService] = useState(false);
  const [serviceType, setServiceType] = useState("Sliping");
  const [serviceNote, setServiceNote] = useState("");

  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLocalError(null);

    const d = initial?.loggedAt ? new Date(initial.loggedAt) : new Date();
    setLoggedAt(toDatetimeLocalValue(d));
    setSagtid(numToStr(initial?.sagtid));
    setFeilkode(initial?.feilkode ?? "");
    setTemperatur(numToStr(initial?.temperatur));
    setSideklaring(numToStr(initial?.sideklaring));
    setAmpere(numToStr(initial?.ampere));
    setStokkAnt(numToStr(initial?.stokkAnt));
    setAlt(initial?.alt ?? "");

    // Reset service ved åpning
    setIncludeService(false);
    setServiceNote("");
  }, [open, initial?.id]);

  const resetToEmpty = () => {
    setLoggedAt(toDatetimeLocalValue(new Date()));
    setSagtid("");
    setFeilkode("");
    setTemperatur("");
    setSideklaring("");
    setAmpere("");
    setStokkAnt("");
    setAlt("");
    setIncludeService(false);
    setServiceNote("");
    setLocalError(null);
  };

  const handleClose = () => {
    if (isSaving) return;
    resetToEmpty();
    onClose();
  };

  const handleSaveClick = async () => {
    setLocalError(null);

    // 1. Validering av sagtid
    const sagtidNum = parseNullableNumber(sagtid);
    if (sagtidNum !== null) {
      if (!Number.isInteger(sagtidNum * 2)) {
        setLocalError("Sagtid må være i 0,5-intervaller (f.eks. 0,5 / 1,0).");
        return;
      }
      if (sagtidNum <= 0) {
        setLocalError("Sagtid må være større enn 0.");
        return;
      }
    }

    // 2. Bygging av input-objektet
    const input: UpsertBladeRunLogInput = {
      installId,
      loggedAt: datetimeLocalToDate(loggedAt),
      ...(sagtidNum !== null ? { sagtid: sagtidNum } : {}),
      ...(feilkode.trim() ? { feilkode: feilkode.trim() } : {}),
      ...(parseNullableInt(temperatur) !== null
        ? { temperatur: parseNullableInt(temperatur)! }
        : {}),
      ...(parseNullableNumber(sideklaring) !== null
        ? { sideklaring: parseNullableNumber(sideklaring)! }
        : {}),
      ...(parseNullableNumber(ampere) !== null
        ? { ampere: parseNullableNumber(ampere)! }
        : {}),
      ...(parseNullableInt(stokkAnt) !== null
        ? { stokkAnt: parseNullableInt(stokkAnt)! }
        : {}),
      alt: alt.trim(),

      // Legg til service-data hvis checkbox er huket av
      ...(includeService
        ? {
            createService: {
              serviceType,
              note: serviceNote.trim(),
              // VIKTIG: Pass på at serviceFeilkode (reklamasjon) blir med her
              feilkode:
                serviceType === "Reklamasjon" ? reklamasjonsType : undefined,
            },
          }
        : {}),
    };

    // --- DEBUGGING START ---
    console.group("🚀 BladeRunLog Submit");
    console.log("Install ID:", installId);
    console.log("Inkluderer service?:", includeService ? "JA ✅" : "NEI ❌");
    console.log("Full pakke som sendes til onSave:", input);
    console.groupEnd();
    // --- DEBUGGING SLUTT ---

    try {
      // 3. Kall til onSave (som trigger tRPC-mutasjonen)
      await onSave(input);

      console.log("✅ Lagring vellykket!");

      // 4. Rydd opp og lukk hvis alt gikk bra
      resetToEmpty();
      onClose();
    } catch (error: any) {
      // 5. Fang opp feil fra serveren
      console.error("❌ Feil ved lagring i BladeRunLogModal:", error);

      // Vis feilmeldingen til brukeren
      const errorMsg =
        error?.message ?? "Det oppstod en ukjent feil ved lagring.";
      setLocalError(`Kunne ikke lagre: ${errorMsg}`);
    }
  };

  if (!open) return null;

  const isEdit = Boolean(initial?.id);

  return (
    <div className="modalBackdrop" onClick={handleClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modalHeader">
          <div>
            <h2>
              {isEdit ? "Rediger driftsdata" : "Etterregistrer driftsdata"}
            </h2>
            <div className="modalSub">
              {sawName ? <span>🪚 {sawName}</span> : null}
              {bladeIdNummer ? <span> • Blad: {bladeIdNummer}</span> : null}
            </div>
          </div>
          <button
            type="button"
            className="btnClose"
            onClick={handleClose}
            disabled={isSaving}
          >
            ✕
          </button>
        </div>

        {(localError ?? error) && (
          <div className="alertError">{localError ?? error}</div>
        )}

        <div className="grid">
          <label className="field">
            <span>Logget tidspunkt</span>
            <input
              type="datetime-local"
              value={loggedAt}
              onChange={(e) => setLoggedAt(e.target.value)}
              disabled={isSaving}
            />
          </label>

          <label className="field">
            <span>Sagtid (timer)</span>
            <input
              type="number"
              step={0.5}
              min={0}
              placeholder="f.eks. 0,5"
              value={sagtid}
              onChange={(e) => setSagtid(e.target.value)}
              disabled={isSaving}
            />
          </label>

          <label className="field">
            <span>Temperatur (°C)</span>
            <input
              type="number"
              placeholder="valgfritt"
              value={temperatur}
              onChange={(e) => setTemperatur(e.target.value)}
              disabled={isSaving}
            />
          </label>

          <label className="field">
            <span>Sideklaring</span>
            <input
              type="number"
              step={0.1}
              placeholder="valgfritt"
              value={sideklaring}
              onChange={(e) => setSideklaring(e.target.value)}
              disabled={isSaving}
            />
          </label>

          <label className="field">
            <span>Ampere</span>
            <input
              type="number"
              placeholder="valgfritt"
              value={ampere}
              onChange={(e) => setAmpere(e.target.value)}
              disabled={isSaving}
            />
          </label>

          <label className="field">
            <span>Stokk antall</span>
            <input
              type="number"
              placeholder="valgfritt"
              value={stokkAnt}
              onChange={(e) => setStokkAnt(e.target.value)}
              disabled={isSaving}
            />
          </label>

          <label className="field fieldFull">
            <span>Notat / Driftsavvik</span>
            <textarea
              placeholder="Skriv inn eventuelle merknader her..."
              rows={3}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              disabled={isSaving}
            />
          </label>
        </div>

        {/* --- SERVICE SEKSJON --- */}
        <div className={`serviceSection ${includeService ? "isActive" : ""}`}>
          <label className="serviceToggle">
            <input
              type="checkbox"
              checked={includeService}
              onChange={(e) => setIncludeService(e.target.checked)}
              disabled={isSaving}
            />
            <div className="toggleContent">
              <span className="toggleTitle">🔧 Send til service samtidig</span>
              <span className="toggleDesc">
                Opprett en servicepost for dette bladet umiddelbart.
              </span>
            </div>
          </label>

          {includeService && (
            <div className="serviceFields">
              <div className="grid">
                <label className="field">
                  <span>Type service</span>
                  <select
                    value={serviceType}
                    onChange={(e) => {
                      setServiceType(e.target.value);
                      setReklamasjonsType(""); // Nullstill underkategori ved bytte
                    }}
                    className="selectInput"
                  >
                    {servicetyper.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                {/* REKLAMASJON: Vis underkategorier */}
                {serviceType === "Reklamasjon" && (
                  <>
                    <label className="field">
                      <span>Reklamasjonstype</span>
                      <select
                        value={reklamasjonsType}
                        onChange={(e) => setReklamasjonsType(e.target.value)}
                        className="selectInput"
                      >
                        <option value="">-- Velg årsak --</option>
                        {reklamasjonstyper.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                )}

                <label className="field fieldFull">
                  <span>Service-notat</span>
                  <input
                    type="text"
                    placeholder="Utfyllende info til sliperiet..."
                    value={serviceNote}
                    onChange={(e) => setServiceNote(e.target.value)}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="modalFooter">
          <button
            type="button"
            className="btn btnGhost"
            onClick={handleClose}
            disabled={isSaving}
          >
            Avbryt
          </button>
          <button
            type="button"
            className="btn btnPrimary"
            onClick={handleSaveClick}
            disabled={isSaving || !installId}
          >
            {isSaving ? "Lagrer…" : isEdit ? "Oppdater" : "Lagre og fullfør"}
          </button>
        </div>

        <style>{`
          .modalBackdrop {
            position: fixed;
            /* Dette tvinger modalen til å dekke hele skjermen uansett hvor i koden den er */
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(8px);
            z-index: 99999; /* Veldig høy verdi */
            display: flex;
            align-items: center; /* Senterer vertikalt */
            justify-content: center; /* Senterer horisontalt */
          }

          .modal {
            background: #ffffff;
            width: min(720px, 95vw);
            /* Fjern position: fixed herfra siden backdropen sentrerer den */
            position: relative;
            max-height: 90vh;
            overflow-y: auto;
            border-radius: 20px;
            padding: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border: 1px solid #e2e8f0;
          }

          .modalHeader {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
          }

          .modalHeader h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 800;
            color: #1e293b;
          }

          .modalSub {
            font-size: 14px;
            color: #64748b;
            margin-top: 4px;
          }

          .btnClose {
            background: #f1f5f9;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #64748b;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .field {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .fieldFull {
            grid-column: 1 / -1;
          }

          .field span {
            font-size: 13px;
            font-weight: 700;
            color: #475569;
          }

          input,
          textarea,
          .selectInput {
            padding: 10px 14px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            font-size: 14px;
            background: #f8fafc;
            transition: all 0.2s;
          }

          input:focus,
          textarea:focus {
            outline: none;
            border-color: #3b82f6;
            background: #fff;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          /* Service Seksjon Styling */
          .serviceSection {
            margin-top: 24px;
            padding: 16px;
            border-radius: 14px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            transition: all 0.2s;
          }

          .serviceSection.isActive {
            background: #eff6ff;
            border-color: #bfdbfe;
          }

          .serviceToggle {
            display: flex;
            gap: 12px;
            cursor: pointer;
          }

          .serviceToggle input {
            width: 20px;
            height: 20px;
            margin-top: 2px;
          }

          .toggleContent {
            display: flex;
            flex-direction: column;
          }

          .toggleTitle {
            font-weight: 700;
            font-size: 14px;
            color: #1e293b;
          }

          .toggleDesc {
            font-size: 12px;
            color: #64748b;
          }

          .serviceFields {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px dashed #cbd5e1;
            animation: slideDown 0.2s ease-out;
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

          .modalFooter {
            margin-top: 32px;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding-top: 16px;
            border-top: 1px solid #f1f5f9;
          }

          .btn {
            padding: 10px 20px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btnGhost {
            background: transparent;
            border: 1px solid #e2e8f0;
            color: #64748b;
          }

          .btnPrimary {
            background: #2563eb;
            color: #fff;
            border: none;
            box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
          }

          .btnPrimary:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
          }

          .alertError {
            background: #fef2f2;
            color: #b91c1c;
            padding: 12px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-size: 14px;
            border: 1px solid #fee2e2;
          }

          @media (max-width: 600px) {
            .grid {
              grid-template-columns: 1fr;
            }
            .modal {
              padding: 16px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
