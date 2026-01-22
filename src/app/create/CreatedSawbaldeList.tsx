import React from "react";
import styles from "./CreateSawbladeList.module.css";
import { clerkClient } from "@clerk/nextjs/server";

export type SawBlade = {
  id: string;
  IdNummer: string;
  side: string;
  produsent: string | null;
  createdAt: string | Date;
  bladeType: { name: string };
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
  console.log("styles.table =", styles.table);

  return (
    <div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID / Serienr.</th>
            <th>Notat</th>
            <th>Bladtype</th>
            <th>Side</th>
            <th>Produsent</th>
            <th className={styles.right}>Opprettet</th>
          </tr>
        </thead>

        <tbody>
          {sawBlades.map((blade) => (
            <tr key={blade.id}>
              <td className={styles.mono} title={blade.IdNummer}>
                <span className={styles.ellipsis}>{blade.IdNummer}</span>
              </td>

              <td>
                {blade.note ? (
                  <span className={styles.ellipsis}>{blade.note}</span>
                ) : (
                  <span className={styles.muted}>–</span>
                )}
              </td>

              <td title={blade.bladeType.name}>
                <div className={styles.typeCell}>
                  <div className={styles.ellipsis}>{blade.bladeType.name}</div>
                  {blade.bladeType.note ? (
                    <div className={styles.typeSub}>{blade.bladeType.note}</div>
                  ) : null}
                </div>
              </td>

              <td>
                <span className={styles.pill}>{blade.side}</span>
              </td>

              <td title={blade.produsent ?? "–"}>
                <span className={styles.ellipsis}>
                  {blade.produsent ?? "–"}
                </span>
              </td>

              <td className={styles.right}>{formatDate(blade.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CreatedSawbladeList;
