import React from "react";
import styles from "./CreateSawbladeList.module.css";

export type SawBlade = {
  id: string;
  IdNummer: string;
  side: string;
  produsent: string | null;
  createdAt: string | Date;
  note?: string | null;
  bladeType: { name: string; note?: string | null };
  artikkel?: string | null;
};

type Props = {
  sawBlades: SawBlade[];
  isLoading?: boolean;
};

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("nb-NO");

const CreatedSawbladeList: React.FC<Props> = ({
  sawBlades,
  isLoading = false,
}) => {
  if (isLoading) return <p className={styles.listMuted}>Laster sagblad…</p>;
  if (!sawBlades || sawBlades.length === 0)
    return <p className={styles.listMuted}>Ingen sagblad registrert enda.</p>;

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr className={styles.trHead}>
              <th className={styles.th}>ID / Serienr.</th>
              <th className={styles.th}>Notat</th>
              <th className={styles.th}>Bladtype</th>
              <th className={styles.th}>Artikkel</th>
              <th className={styles.th}>Produsent</th>
              <th className={`${styles.th} ${styles.right}`}>Opprettet</th>
            </tr>
          </thead>

          <tbody style={{ fontSize: "small" }} className={styles.tbody}>
            {sawBlades.map((blade) => (
              <tr key={blade.id}>
                <td className={`${styles.td}`} title={blade.IdNummer}>
                  <span
                    style={{ fontWeight: "bolder", color: "#0f172a" }}
                    className={styles.idNumber}
                  >
                    {blade.IdNummer}
                  </span>
                </td>

                <td className={styles.td}>
                  {blade.note ? (
                    <span
                      className={`${styles.ellipsis} ${styles.id}`}
                      title={blade.note}
                    >
                      {blade.note}
                    </span>
                  ) : (
                    <span className={styles.muted}>–</span>
                  )}
                </td>

                <td className={styles.td}>
                  <div className={styles.typeCellFull}>
                    <div
                      className={styles.typeName}
                      title={blade.bladeType.name}
                    >
                      {blade.bladeType.name}{" "}
                      {blade.side && (
                        <span className={styles.pill}>{blade.side}</span>
                      )}
                    </div>

                    {blade.bladeType.note ? (
                      <div
                        className={styles.typeNote}
                        title={blade.bladeType.note}
                      >
                        {blade.bladeType.note}
                      </div>
                    ) : null}
                  </div>
                </td>

                <td className={styles.td}>
                  <span>{blade.bladeType.artikkel ?? "–"}</span>
                </td>

                <td className={styles.td} title={blade.produsent ?? "–"}>
                  <span className={styles.ellipsis}>
                    {blade.produsent ?? "–"}
                  </span>
                </td>

                <td className={`${styles.td} ${styles.right}`}>
                  {formatDate(blade.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreatedSawbladeList;
