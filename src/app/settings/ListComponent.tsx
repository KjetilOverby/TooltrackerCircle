import React from "react";
import { FaCheckCircle } from "react-icons/fa";

interface ListComponentProps {
  isLoading: boolean;
  bladeTypes: {
    id: string;
    name: string;
    note?: string | null;
    createdAt: Date | string;
    hasSide?: boolean;
    lagerBeholdning?: number | null;
  }[];
  icon: React.ReactNode;
  header: string;
}

const ListComponent: React.FC<ListComponentProps> = ({
  isLoading,
  bladeTypes,
  icon,
  header,
}) => {
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

        /* ✅ Navn får hele bredden */
        .name {
          font-size: 15px;
          font-weight: 900;
          color: #111827;
          line-height: 1.2;
          white-space: normal;
          overflow-wrap: anywhere; /* viktig ved lange ord/ID-er */
        }

        /* ✅ Chips under navnet */
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

        /* Litt strammere på mobil */
        @media (max-width: 520px) {
          .listRoot {
            padding: 14px;
          }
          .item {
            padding: 12px;
          }
          .name {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="listRoot">
        <div className="listHeader">
          <div className="listTitle">Oppsett</div>
        </div>

        {isLoading ? (
          <div className="loading">Laster…</div>
        ) : bladeTypes.length === 0 ? (
          <div className="empty">{header}</div>
        ) : (
          bladeTypes.map((bt) => (
            <div key={bt.id} className="item">
              <div className="icon">{icon}</div>

              <div className="content">
                <div className="name">{bt.name}</div>

                <div className="chipsRow">
                  {bt.lagerBeholdning != null && (
                    <div className="pill">
                      Varsel ved: <span>{bt.lagerBeholdning}</span>
                    </div>
                  )}

                  {bt.hasSide && (
                    <div className="badge">
                      <FaCheckCircle size={12} />
                      Har side
                    </div>
                  )}
                </div>

                {bt.note && <div className="note">{bt.note}</div>}

                <div className="meta">
                  Opprettet: {new Date(bt.createdAt).toLocaleString("no-NB")}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default ListComponent;
