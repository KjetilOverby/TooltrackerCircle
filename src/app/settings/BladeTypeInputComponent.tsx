import React, { useEffect, useState } from "react";
import ListComponent from "./ListComponent";
import type { ListRow } from "./ListComponent";
import styles from "./BladeTypeInputComponent.module.css";

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

  // BladeType-only extras:
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
    <div className={styles.bladeRoot}>
      <h1 className={styles.bladeTitle}>{title}</h1>

      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.addButton}
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
          {showForm ? "Avbryt" : "➕ Legg til"}
        </button>
      </div>

      {showForm && (
        <div className={styles.card}>
          <h2>{mode === "create" ? subheader : "Oppdater"}</h2>

          <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Navn</label>
              <input
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Navn…"
              />
            </div>

            {onArtikkelChange && (
              <div className={styles.field}>
                <label>Artikkelnummer</label>
                <input
                  value={artikkel ?? ""}
                  onChange={(e) => onArtikkelChange(e.target.value)}
                  placeholder="Art nr"
                />
              </div>
            )}

            {onLagerBeholdningChange && (
              <div className={styles.field}>
                <label>Min antall lagerbeholdning</label>
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
                  placeholder="Antall…"
                />
              </div>
            )}

            <div className={styles.field}>
              <label>Notat (valgfritt)</label>
              <textarea
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                rows={3}
                placeholder="Valgfritt notat…"
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
              {isSaving ? "Lagrer…" : mode === "create" ? "Lagre" : "Oppdater"}
            </button>
          </form>
        </div>
      )}

      <ListComponent
        isLoading={isLoading}
        items={items}
        icon={icon}
        emptyText={emptyText}
        onEdit={(item) => onStartEdit(item)}
      />
    </div>
  );
}
