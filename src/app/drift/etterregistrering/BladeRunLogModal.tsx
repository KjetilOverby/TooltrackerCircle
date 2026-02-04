"use client";

import React, { useMemo, useState } from "react";

type CreateBladeRunLogInput = {
  installId: string;
  loggedAt: Date;
  sagtid?: number;
  feilkode?: string;
  temperatur?: number;
  sideklaring?: number;
  ampere?: number;
  stokkAnt?: number;
  alt?: string;
};

type BladeRunLogModalProps = {
  open: boolean;
  installId: string;

  sawName?: string;
  bladeIdNummer?: string;

  isSaving?: boolean;
  error?: string | null;

  onClose: () => void;
  onSave: (input: CreateBladeRunLogInput) => Promise<void> | void;
};

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

export default function BladeRunLogModal({
  open,
  installId,
  sawName,
  bladeIdNummer,
  isSaving = false,
  error = null,
  onClose,
  onSave,
}: BladeRunLogModalProps) {
  const defaultLoggedAt = useMemo(() => toDatetimeLocalValue(new Date()), []);
  const [loggedAt, setLoggedAt] = useState(defaultLoggedAt);

  const [sagtid, setSagtid] = useState<string>("");
  const [feilkode, setFeilkode] = useState<string>("");
  const [temperatur, setTemperatur] = useState<string>("");

  const [sideklaring, setSideklaring] = useState<string>("");
  const [ampere, setAmpere] = useState<string>("");
  const [stokkAnt, setStokkAnt] = useState<string>("");

  const [alt, setAlt] = useState<string>("");

  const [localError, setLocalError] = useState<string | null>(null);

  const reset = () => {
    setLoggedAt(toDatetimeLocalValue(new Date()));
    setSagtid("");
    setFeilkode("");
    setTemperatur("");
    setSideklaring("");
    setAmpere("");
    setStokkAnt("");
    setAlt("");
    setLocalError(null);
  };

  const handleClose = () => {
    if (isSaving) return;
    reset();
    onClose();
  };

  const handleSaveClick = async () => {
    setLocalError(null);

    const sagtidNum = parseNullableNumber(sagtid);
    if (sagtidNum !== null) {
      if (!Number.isInteger(sagtidNum * 2)) {
        setLocalError(
          "Sagtid må være i 0,5-intervaller (f.eks. 0,5 / 1,0 / 1,5).",
        );
        return;
      }
      if (sagtidNum <= 0) {
        setLocalError("Sagtid må være større enn 0.");
        return;
      }
    }

    const input: CreateBladeRunLogInput = {
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
      ...(alt.trim() ? { alt: alt.trim() } : {}),
    };

    await onSave(input);

    // hvis save lykkes (ingen exception), lukk + reset
    reset();
    onClose();
  };

  if (!open) return null;

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
            <h2>Etterregistrer driftsdata</h2>
            <div className="modalSub">
              {sawName ? <span>🪚 {sawName}</span> : null}
              {bladeIdNummer ? <span> • Blad: {bladeIdNummer}</span> : null}
            </div>
          </div>

          <button
            type="button"
            className="btn btnGhost"
            onClick={handleClose}
            disabled={isSaving}
          >
            Lukk
          </button>
        </div>

        {localError || error ? (
          <div className="alertError">{localError ?? error}</div>
        ) : null}

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
            <small className="hint">0,5-intervaller anbefales.</small>
          </label>

          {/* <label className="field">
            <span>Feilkode</span>
            <input
              type="text"
              placeholder="valgfritt"
              value={feilkode}
              onChange={(e) => setFeilkode(e.target.value)}
              disabled={isSaving}
            />
          </label> */}

          <label className="field">
            <span>Temperatur (°C)</span>
            <input
              type="number"
              step={1}
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
              step={0.1}
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
              step={1}
              placeholder="valgfritt"
              value={stokkAnt}
              onChange={(e) => setStokkAnt(e.target.value)}
              disabled={isSaving}
            />
          </label>

          <label className="field fieldFull">
            <span>Notat (alt)</span>
            <textarea
              placeholder="valgfritt"
              rows={4}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              disabled={isSaving}
            />
          </label>
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
            {isSaving ? "Lagrer…" : "Lagre"}
          </button>
        </div>

        <style jsx>{`
          .modalBackdrop {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.65);
            backdrop-filter: blur(4px);
            z-index: 9999;
          }

          .modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: min(820px, 100%);
            max-height: calc(100vh - 36px);
            overflow: auto;

            padding: 20px 24px;
            background: rgba(255, 255, 255, 0.96);
            border: 1px solid rgba(15, 23, 42, 0.18);
            border-radius: 16px;
            box-shadow:
              0 20px 40px rgba(15, 23, 42, 0.25),
              0 8px 16px rgba(15, 23, 42, 0.15);
          }

          .modalHeader {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 12px;
          }

          .modalHeader h2 {
            font-size: 18px;
            line-height: 1.2;
            margin: 0;
          }

          .modalSub {
            color: rgba(15, 23, 42, 0.7);
            font-size: 13px;
            margin-top: 6px;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .alertError {
            background: rgba(220, 38, 38, 0.08);
            border: 1px solid rgba(220, 38, 38, 0.25);
            color: #7f1d1d;
            padding: 10px 12px;
            border-radius: 12px;
            margin-bottom: 12px;
            font-size: 14px;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }

          .field {
            display: flex;
            flex-direction: column;
            gap: 6px;
            min-width: 0;
          }

          .fieldFull {
            grid-column: 1 / -1;
          }

          .field > span {
            font-size: 13px;
            color: rgba(15, 23, 42, 0.85);
          }

          .hint {
            font-size: 12px;
            color: rgba(15, 23, 42, 0.6);
          }

          input,
          textarea {
            width: 100%;
            box-sizing: border-box;
            background: #fff;
            border: 1px solid rgba(15, 23, 42, 0.18);
            color: #0f172a;
            border-radius: 12px;
            padding: 10px 12px;
            font-size: 14px;
            line-height: 1.4;
            outline: none;
          }

          textarea {
            resize: vertical;
            min-height: 96px;
          }

          input:focus,
          textarea:focus {
            border-color: rgba(108, 71, 255, 0.55);
            box-shadow: 0 0 0 4px rgba(108, 71, 255, 0.16);
          }

          .modalFooter {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 16px;
            padding-top: 12px;
            border-top: 1px solid rgba(15, 23, 42, 0.08);
          }

          .btn {
            border-radius: 999px;
            padding: 10px 14px;
            border: 1px solid rgba(15, 23, 42, 0.14);
            background: rgba(15, 23, 42, 0.04);
            color: #0f172a;
            cursor: pointer;
          }

          .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .btnPrimary {
            background: rgba(108, 71, 255, 0.92);
            border-color: rgba(108, 71, 255, 0.92);
            color: #fff;
          }

          .btnGhost {
            background: transparent;
          }

          @media (max-width: 700px) {
            .grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
