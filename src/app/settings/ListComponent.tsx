import React from "react";
import { FaCheckCircle } from "react-icons/fa";

export type ListRow = {
  id: string;
  name: string;
  note?: string | null;
  createdAt: Date | string;
  // optional extras (BladeType):
  hasSide?: boolean | null;
  lagerBeholdning?: number | null;
  artikkel?: string | null;
};

type Props<T extends ListRow> = {
  isLoading: boolean;
  items: T[];
  icon: React.ReactNode;
  emptyText: string;
  onEdit?: (item: T) => void;
  title?: string;
};

export default function ListComponent<T extends ListRow>({
  isLoading,
  items,
  icon,
  emptyText,
  onEdit,
  title = "Oppsett",
}: Props<T>) {
  return (
    <>
      <style jsx>{`
        .listRoot {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 20px;
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.04),
            0 12px 28px rgba(0, 0, 0, 0.06);
        }
        .listHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .listTitle {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #374151;
        }
        .loading,
        .empty {
          padding: 12px 4px;
          font-size: 13px;
          color: #6b7280;
        }
        .item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px;
          margin-bottom: 10px;
          border-radius: 16px;
          background:
            linear-gradient(#fff, #fff) padding-box,
            linear-gradient(135deg, #e5e7eb, #f3f4f6) border-box;
          border: 1px solid transparent;
          transition:
            box-shadow 0.2s ease,
            transform 0.05s ease,
            background 0.2s ease;
        }
        .item:hover {
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);
        }
        .icon {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #374151;
          flex-shrink: 0;
        }
        .content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
          flex: 1;
        }
        .name {
          font-size: 15px;
          font-weight: 900;
          color: #111827;
          line-height: 1.2;
          white-space: normal;
          overflow-wrap: anywhere;
        }
        .chipsRow {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid rgba(6, 95, 70, 0.15);
          white-space: nowrap;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid rgba(29, 78, 216, 0.15);
          white-space: nowrap;
        }
        .note {
          font-size: 12px;
          font-style: italic;
          color: #4b5563;
        }
        .meta {
          font-size: 11px;
          color: #9ca3af;
        }
        .actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .editBtn {
          border: 1px solid #e5e7eb;
          background: #fff;
          padding: 6px 10px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
        }
        .editBtn:hover {
          background: #f9fafb;
        }
      `}</style>

      <div className="listRoot">
        <div className="listHeader">
          <div className="listTitle">{title}</div>
        </div>

        {isLoading ? (
          <div className="loading">Laster…</div>
        ) : items.length === 0 ? (
          <div className="empty">{emptyText}</div>
        ) : (
          items.map((it) => {
            const created =
              it.createdAt instanceof Date
                ? it.createdAt
                : new Date(it.createdAt);

            return (
              <div key={it.id} className="item">
                <div className="icon">{icon}</div>

                <div className="content">
                  <div className="name">{it.name}</div>

                  <div className="chipsRow">
                    {it.lagerBeholdning != null && (
                      <div className="pill">
                        Varsel ved: {it.lagerBeholdning}
                      </div>
                    )}

                    {!!it.hasSide && (
                      <div className="badge">
                        <FaCheckCircle size={12} />
                        Har side
                      </div>
                    )}
                  </div>

                  {it.note && <div className="note">{it.note}</div>}

                  <div className="meta">
                    Opprettet:{" "}
                    {isNaN(created.getTime())
                      ? "—"
                      : created.toLocaleString("no-NB")}
                  </div>
                </div>

                {onEdit && (
                  <div className="actions">
                    <button
                      type="button"
                      className="editBtn"
                      onClick={() => onEdit(it)}
                    >
                      Rediger
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
