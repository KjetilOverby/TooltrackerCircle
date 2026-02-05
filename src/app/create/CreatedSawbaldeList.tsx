"use client";
import React from "react";

export type SawBlade = {
  id: string;
  IdNummer: string;
  side?: string | null;
  produsent?: string | null;
  createdAt: string | Date;
  note?: string | null;
  bladeType: {
    name: string;
    note?: string | null;
    artikkel?: string | null;
  };
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
  if (isLoading) return <div className="listStatus">Laster sagblad…</div>;
  if (!sawBlades || sawBlades.length === 0)
    return <div className="listStatus">Ingen sagblad registrert enda.</div>;

  return (
    <div className="bladeListWrap">
      <style>{`
        .bladeListWrap {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 24px;
          margin-top: 2rem;
          color: #f8fafc;
          overflow: hidden;
        }

        .tableScroll {
          overflow-x: auto;
        }

        .bladeTable {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 8px; /* Gir luft mellom radene */
          text-align: left;
        }

        .bladeTable th {
          padding: 12px 16px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          font-weight: 700;
        }

        .bladeTable tr td {
          background: rgba(15, 23, 42, 0.4);
          padding: 14px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 13px;
          transition: all 0.2s ease;
        }

        /* Rund av hjørnene på radene */
        .bladeTable tr td:first-child {
          border-left: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px 0 0 12px;
        }
        .bladeTable tr td:last-child {
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 0 12px 12px 0;
        }

        .bladeTable tr:hover td {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
          color: #fff;
        }

        .idNum {
          font-weight: 800;
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
          padding: 4px 8px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 14px;
        }

        .typeBadge {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .typeName {
          font-weight: 700;
          color: #f1f5f9;
        }

        .typeNote {
          font-size: 11px;
          color: #64748b;
        }

        .sidePill {
          display: inline-block;
          font-size: 10px;
          padding: 2px 6px;
          background: #334155;
          color: #fff;
          border-radius: 4px;
          margin-left: 6px;
          vertical-align: middle;
          text-transform: uppercase;
        }

        .noteCell {
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #94a3b8;
          font-style: italic;
        }

        .right { text-align: right; }
        .muted { opacity: 0.3; }

        .listStatus {
          padding: 2rem;
          text-align: center;
          color: #94a3b8;
          font-style: italic;
        }
      `}</style>

      <div className="tableScroll">
        <table className="bladeTable">
          <thead>
            <tr>
              <th>ID / Serienr.</th>
              <th>Bladtype</th>
              <th>Artikkel</th>
              <th>Notat</th>
              <th>Produsent</th>
              <th className="right">Opprettet</th>
            </tr>
          </thead>

          <tbody>
            {sawBlades.map((blade) => (
              <tr key={blade.id}>
                <td>
                  <span className="idNum">{blade.IdNummer}</span>
                </td>

                <td>
                  <div className="typeBadge">
                    <div className="typeName">
                      {blade.bladeType.name}
                      {blade.side && (
                        <span className="sidePill">{blade.side}</span>
                      )}
                    </div>
                    {blade.bladeType.note && (
                      <div className="typeNote">{blade.bladeType.note}</div>
                    )}
                  </div>
                </td>

                <td>
                  {blade.bladeType.artikkel ?? <span className="muted">—</span>}
                </td>

                <td>
                  <div className="noteCell" title={blade.note ?? ""}>
                    {blade.note ?? <span className="muted">—</span>}
                  </div>
                </td>

                <td>{blade.produsent ?? <span className="muted">—</span>}</td>

                <td
                  className="right"
                  style={{ fontWeight: 600, color: "#64748b" }}
                >
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
