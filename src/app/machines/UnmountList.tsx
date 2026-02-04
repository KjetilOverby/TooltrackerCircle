import React from "react";

function formatDuration(ms: number) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes} min`;
  return `${hours} t ${minutes} min`;
}

type RecentRow = {
  id: string;
  saw: { id: string; name: string };
  blade: { id: string; IdNummer: string };
  installedAt: Date;
  removedAt: Date | null;
  removedReason: string | null;
  removedNote: string | null;
  _count: {
    runLogs: number;
  };
};

type Props = {
  rows: RecentRow[];
  isFetching: boolean;
};

const UnmountList: React.FC<Props> = ({ rows, isFetching }) => {
  if (!rows.length) return null;

  return (
    <div className="logWrap">
      <style jsx>{`
        .logWrap {
          background: #fff;
          border: 1px solid #e6e7ea;
          border-radius: 14px;
          padding: 14px 16px;
          margin: 2rem 0 0 0;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        .logHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }
        .logTitle {
          font-size: 14px;
          font-weight: 700;
        }
        .logList {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .logItem {
          background: #f7f8fb;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 10px 12px;
        }
        .logMain {
          font-size: 14px;
          color: #111827;
        }
        .logMeta {
          margin-top: 4px;
          font-size: 12px;
          color: #6b7280;
        }

        /* 🔖 Pills */
        .pill {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid transparent;

          white-space: nowrap;
          nargin-top: 4px;
        }
        .pillWarn {
          background: #fef3c7; /* gul */
          color: #92400e;
          border-color: #fde68a;
        }
        .pillOk {
          background: #d1fae5; /* grønn */
          color: #065f46;
          border-color: #6ee7b7;
        }
      `}</style>

      <div className="logHeader">
        <div className="logTitle">Siste demonteringer</div>
        <div className="small">Oppdatert: {isFetching ? "…" : "nå"}</div>
      </div>
      <div className="logList">
        {rows.map((row) => {
          const manglerDriftsdata = row._count.runLogs === 0;
          console.log(manglerDriftsdata);

          const duration =
            row.removedAt != null
              ? formatDuration(
                  row.removedAt.getTime() - row.installedAt.getTime(),
                )
              : "";

          return (
            <div key={row.id} className="logItem">
              <div className="logMain">
                Demontering: <b>{row.blade.IdNummer}</b> fra{" "}
                <b>{row.saw.name}</b>
                {row.removedReason ? (
                  <>
                    {" "}
                    · <span className="pill">{row.removedReason}</span>
                  </>
                ) : null}
              </div>

              <div className="logMeta">
                {row.installedAt.toLocaleString()} →{" "}
                {row.removedAt?.toLocaleString()} · Varighet: {duration}
                {row.removedNote ? ` · ${row.removedNote}` : ""}
              </div>
              <div style={{ marginTop: "5px" }} className="logMain">
                <span
                  className={`pill ${
                    manglerDriftsdata ? "pillWarn" : "pillOk"
                  }`}
                >
                  {manglerDriftsdata ? "Driftsdata mangler" : "Har driftsdata"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UnmountList;
