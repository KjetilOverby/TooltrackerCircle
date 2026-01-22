import React from "react";
import styles from "./ListComponent.module.css";
import { FaCheckCircle } from "react-icons/fa";

interface ListComponentProps {
  isLoading: boolean;
  bladeTypes: {
    id: string;
    name: string;
    note?: string | null;
    createdAt: Date | string;
    hasSide?: boolean;
  }[];
  icon: React.ReactNode;
  header: string;
  hasSide?: boolean;
}

const ListComponent: React.FC<ListComponentProps> = ({
  isLoading,
  bladeTypes,
  icon,
  header,
}) => {
  return (
    <div className={styles.listRoot}>
      <div className={styles.boxEx}>
        <h2 className={styles.listTitle}>Oppsett</h2>
        <FaCheckCircle color="green" /> <p className={styles.meta}>Har side</p>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Laster…</div>
      ) : bladeTypes.length === 0 ? (
        <div className={styles.empty}>{header}</div>
      ) : (
        bladeTypes.map((bt) => (
          <div key={bt.id} className={styles.item}>
            <div className={styles.icon}>{icon}</div>

            <div className={styles.content}>
              <div className={styles.name}>{bt.name}</div>
              {bt.hasSide ? (
                <p className={styles.listTitle}>
                  <FaCheckCircle color="green" />
                </p>
              ) : (
                <div></div>
              )}

              {bt.note && <div className={styles.note}>{bt.note}</div>}

              <div className={styles.meta}>
                Opprettet: {new Date(bt.createdAt).toLocaleString("no-NB")}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ListComponent;
