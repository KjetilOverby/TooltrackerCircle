"use client";

import React, { useState, useMemo } from "react";
import { api } from "~/trpc/react";
import ChangeReasons from "./ChangeReasons";
import MachineOverview from "./MachineOverview";
import { DatePickerComponent } from "../../../_components/common/DatePickerComponent";
import { dateToYMD, startOfDay, endOfDay } from "~/utils/dateUtils";

const StatistikkPage = () => {
  const [fromYmd, setFromYmd] = useState(
    dateToYMD(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
  );
  const [toYmd, setToYmd] = useState(dateToYMD(new Date()));

  const filter = useMemo(
    () => ({
      from: startOfDay(fromYmd),
      to: endOfDay(toYmd),
    }),
    [fromYmd, toYmd],
  );

  const statsQuery = api.driftstatistikk.getReasonStats.useQuery(filter);
  const data = statsQuery.data ?? [];

  return (
    <main className="page-wrapper">
      <div className="content-container">
        <header className="page-header">
          <div className="header-text">
            <h1>Årsaksstatistikk</h1>
            <p>Dataanalyse for alle maskiner i valgt periode</p>
          </div>

          {/* 2. Bruk den nye komponenten her */}
          <DatePickerComponent
            fromYmd={fromYmd}
            setFromYmd={setFromYmd}
            toYmd={toYmd}
            setToYmd={setToYmd}
          />
        </header>

        {statsQuery.isLoading ? (
          <div className="loader">Oppdaterer data...</div>
        ) : (
          <>
            <section className="stats-section">
              <ChangeReasons filter={filter} data={data} />
            </section>

            <section className="stats-section">
              <MachineOverview filter={filter} />
            </section>
          </>
        )}
      </div>

      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          background-color: #f1f5f9;
          padding: 3rem 0;
        }

        .content-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3rem;
          gap: 2rem;
        }

        .header-text h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.03em;
          margin: 0;
        }

        .header-text p {
          color: #64748b;
          margin-top: 0.5rem;
          font-size: 1.1rem;
        }

        /* Vi har fjernet .filter-card og .date-input herfra 
           siden de nå bor i DatePickerComponent */

        .stats-section {
          margin-bottom: 2.5rem;
        }

        .loader {
          text-align: center;
          padding: 5rem;
          color: #64748b;
          font-weight: 600;
          font-size: 1.1rem;
        }

        @media (max-width: 850px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
};

export default StatistikkPage;
