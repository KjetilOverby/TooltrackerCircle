"use client";

import React, { useMemo } from "react";
import { api } from "~/trpc/react";
import ChangeReasons from "./ChangeReasons";
import MachineOverview from "./MachineOverview";

const StatistikkPage = () => {
  const filter = useMemo(() => {
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { from, to: new Date() };
  }, []);

  const statsQuery = api.driftstatistikk.getReasonStats.useQuery(filter);

  if (statsQuery.isLoading) {
    return (
      <div className="loading-wrapper">
        <div className="loader">Laster statistikk...</div>
      </div>
    );
  }

  const data = statsQuery.data ?? [];

  return (
    <main className="page-wrapper">
      <div className="content-container">
        <header className="page-header">
          <h1>Årsaksstatistikk</h1>
          <p>Oversikt over bladbytter og årsaker per maskin siste 30 dager</p>
        </header>

        <section className="stats-section">
          {/* Denne komponenten viser nå de overordnede årsakene */}
          <ChangeReasons data={data} />
        </section>

        <section className="stats-section">
          {/* Denne komponenten viser oversikten per maskin */}
          <MachineOverview />
        </section>
      </div>

      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          background-color: #f8fafc; /* Svak gråtone som gjør de hvite kortene tydeligere */
          padding: 2rem 0; /* Luft i topp og bunn */
        }

        .content-container {
          width: 100%;
          max-width: 1000px; /* Her begrenser vi bredden for "proff" look */
          margin: 0 auto; /* Sentrerer alt */
          padding: 0 1.5rem; /* Marger på sidene for mobil (responsivitet) */
        }

        .page-header {
          margin-bottom: 3rem;
          text-align: left;
        }

        .page-header h1 {
          font-size: 2.25rem;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.025em;
          margin-bottom: 0.5rem;
        }

        .page-header p {
          font-size: 1.125rem;
          color: #64748b;
        }

        .stats-section {
          margin-bottom: 4rem; /* Skaper et tydelig skille mellom de to rapportene */
        }

        .loading-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .loader {
          color: #64748b;
          font-weight: 500;
        }

        /* Responsiv tilpasning for mindre skjermer */
        @media (max-width: 640px) {
          .page-wrapper {
            padding: 1rem 0;
          }

          .page-header h1 {
            font-size: 1.75rem;
          }

          .page-header {
            margin-bottom: 2rem;
          }
        }
      `}</style>
    </main>
  );
};

export default StatistikkPage;
