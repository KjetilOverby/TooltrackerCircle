import React from "react";
import styles from "./CreateInputComponent.module.css";

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
  saws: {
    name: string;
    id: string;
    orgId: string;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
    sawType: string | null;
    note: string | null;
    side: string | null;
    createdById: string | null;
  }[];

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

const produsent = ["Kanefusa", "Frezite", "Tenryu", "Apsi", "Ukjent"];

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
    <div className={styles.formWrapper}>
      <h1 className={styles.formTitle}>Registrer sagblad</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Bladetype</label>
          <select
            name="bladeTypeId"
            value={form.bladeTypeId}
            onChange={handleChange}
            className={styles.formSelect}
            required
          >
            <option value="">Velg bladetype</option>
            {bladeTypes.map((bt) => (
              <option key={bt.id} value={bt.id}>
                {bt.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Produsent</label>
          <select
            name="produsent"
            value={form.produsent}
            onChange={handleChange}
            className={styles.formSelect}
            required
          >
            <option value="">Velg produsent</option>
            {produsent.map((prod) => (
              <option key={prod} value={prod}>
                {prod}
              </option>
            ))}
          </select>
        </div>

        {showSide && (
          <div className={styles.formField}>
            <label className={styles.formLabel}>Side</label>
            <select
              name="side"
              value={form.side}
              onChange={handleChange}
              className={styles.formSelect}
            >
              <option value="">Ingen</option>
              <option value="Venstre">Venstre</option>
              <option value="Høyre">Høyre</option>
            </select>
          </div>
        )}

        <div className={styles.formField}>
          <label className={styles.formLabel}>ID / Serienummer</label>
          <input
            type="text"
            name="bladeNumber"
            value={form.bladeNumber}
            onChange={handleChange}
            className={styles.formInput}
            placeholder="f.eks. B-00123"
            required
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Notat</label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            className={styles.formTextarea}
            rows={3}
            placeholder="Evt. kommentar"
          />
        </div>

        <button
          type="submit"
          className={styles.formButton}
          disabled={isLoading}
        >
          {isLoading ? "Lagrer..." : "Lagre blad"}
        </button>
      </form>
    </div>
  );
};

export default CreateInputComponent;
