import React from "react";
import BladeListComponent from "./ListComponent";
import styles from "./BladeTypeInputComponent.module.css";

type BladeType = {
  id: string;
  name: string;
  note: string | null;
  createdAt: Date | string;
};

type Props = {
  name: string;
  onNameChange: (value: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;

  errorMsg: string | null;
  isSaving: boolean;

  isLoading: boolean;
  bladeTypes: BladeType[];
  header: string;
  icon: React.ReactNode;
  subheader: string;
  showHasSide: boolean;
  hasSide: boolean;
  onHasSideChange: (value: boolean) => void;
  onArtikkelChange: (value: string) => void;
  artikkel: string;
};

export default function BladeTypeInputComponent({
  name,
  onNameChange,
  note,
  onNoteChange,
  onSubmit,
  errorMsg,
  isSaving,
  isLoading,
  bladeTypes,
  header,
  icon,
  subheader,
  hasSide,
  onHasSideChange,
  showHasSide,
  artikkel,
  onArtikkelChange,
}: Props) {
  return (
    <div className={styles.bladeRoot}>
      <h1 className={styles.bladeTitle}>{header}</h1>

      <div className={styles.card}>
        <h2>{subheader}</h2>

        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Navn</label>
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="F.eks. 445/150-4.0/2.6-z36 MKV"
            />
          </div>
          <div className={styles.field}>
            <label>Artikkelnummer</label>
            <input
              value={artikkel}
              onChange={(e) => onArtikkelChange(e.target.value)}
              placeholder="Art nr"
            />
          </div>

          <div className={styles.field}>
            <label>Notat (valgfritt)</label>
            <textarea
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={3}
              placeholder="Valgfritt notat..."
            />
          </div>
          {showHasSide && (
            <div className={styles.field}>
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={hasSide ?? false}
                  onChange={(e) => onHasSideChange?.(e.target.checked)}
                />
                <span className={styles.checkboxBox}></span>
                <span className={styles.checkboxLabel}>
                  Har side (venstre / høyre)
                </span>
              </label>
            </div>
          )}

          {errorMsg && <div className="error">{errorMsg}</div>}

          <button type="submit" disabled={isSaving} className={styles.submit}>
            {isSaving ? "Lagrer…" : "Lagre bladtype"}
          </button>
        </form>
      </div>

      <BladeListComponent
        isLoading={isLoading}
        bladeTypes={bladeTypes}
        icon={icon}
        header="Ingen bladtyper er lagt inn enda."
      />
    </div>
  );
}
