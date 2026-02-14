"use client";

import React, { useState } from "react";
import { type RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";
import CheckoutModal from "./CheckoutModal";
import DriftsHistorikkComponent from "./DriftsHistorikkComponent";
import ServiceHistorikk from "./ServiceHistorikk";
import CheckInModal from "./CheckInModal";

// Definere typene fra TRPC-outputen
type BladeData = NonNullable<RouterOutputs["service"]["getByExactIdNummer"]>;
type ServiceData = BladeData["services"][number];

export default function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceType, setServiceType] = useState("Sliping");
  const [note, setNote] = useState("");
  const [feilkode, setFeilkode] = useState("");

  // HER: Nå med riktig type i stedet for any
  const [selectedServiceForCheckout, setSelectedServiceForCheckout] =
    useState<ServiceData | null>(null);

  const utils = api.useUtils();

  const {
    data: blade,
    isFetching,
    refetch,
  } = api.service.getByExactIdNummer.useQuery(
    { idNummer: searchTerm },
    { enabled: false },
  );

  const { data: serviceKoder } = api.settings.getAllCodes.useQuery();

  const createService = api.service.create.useMutation({
    onSuccess: async () => {
      await utils.service.getByExactIdNummer.invalidate({
        idNummer: searchTerm,
      });
      await refetch();
      setIsModalOpen(false);
      setNote("");
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) void refetch();
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blade) return;
    createService.mutate({
      bladeId: blade.id,
      datoInn: new Date(),
      serviceType,
      note,
      feilkode: serviceType === "Reklamasjon" ? feilkode : undefined,
    });
  };

  // --- LOGIKK ---
  const activeService = blade?.services.find((s) => !s.datoUt);
  const activeInstall = blade?.installs.find((i) => !i.removedAt);
  const isDeleted = blade?.deleted;

  const allLogs =
    blade?.installs
      .map((i) => i.runLog)
      .filter((log): log is NonNullable<typeof log> => log !== null) ?? [];

  const totalStokker = allLogs.reduce(
    (acc, log) => acc + (log.stokkAnt ?? 0),
    0,
  );
  const totalSagtid = allLogs.reduce((acc, log) => acc + (log.sagtid ?? 0), 0);

  let statusLabel = "LEDIG";
  let statusClass = "bg-ok";
  if (isDeleted) {
    statusLabel = "KASSERT";
    statusClass = "bg-deleted";
  } else if (activeService) {
    statusLabel = "PÅ SERVICE";
    statusClass = "bg-service";
  } else if (activeInstall) {
    statusLabel = `I DRIFT: ${activeInstall.saw?.name}`;
    statusClass = "bg-production";
  }

  return (
    <div className="page-container">
      <div className="search-header">
        <form onSubmit={handleSearch} className="search-box">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Søk på serienummer..."
          />
          <button type="submit" disabled={isFetching} className="search-btn">
            {isFetching ? "Søker..." : "Finn blad"}
          </button>
        </form>
      </div>

      {blade && (
        <div className="content-layout animate-fade-in">
          <aside className="sidebar">
            <div className={`blade-pro-card ${statusClass}`}>
              <div className="card-glass-overlay"></div>

              <div className="card-header-v2">
                <div className="status-indicator">
                  <span className="pulse-dot"></span>
                  {statusLabel}
                </div>
                <h1 className="serial-number">{blade.IdNummer}</h1>
                <p className="blade-subtitle">
                  {blade.bladeType?.name || "Standard sagblad"}
                  {blade.side ? ` • ${blade.side}` : ""}
                </p>
              </div>

              <div className="card-content-v2">
                <button
                  className="main-action-btn-v2"
                  onClick={() => setIsModalOpen(true)}
                  disabled={!!activeService || !!activeInstall || !!isDeleted}
                >
                  {activeService
                    ? "Allerede på service"
                    : activeInstall
                      ? "I drift"
                      : "+ Registrer service"}
                </button>

                <div className="info-grid-v2">
                  <div className="info-tile">
                    <label>Produsent</label>
                    <span>{blade.produsent ?? "—"}</span>
                  </div>
                  <div className="info-tile">
                    <label>Side</label>
                    <span>{blade.side ?? "N/A"}</span>
                  </div>
                  <div className="info-tile full-width">
                    <label>Registrert dato</label>
                    <span>
                      {blade.createdAt
                        ? new Date(blade.createdAt).toLocaleString("no-NO", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="main-content">
            <section className="stats-row">
              <div className="stat-panel">
                <label>Totalt stokker</label>
                <div className="stat-value">
                  {totalStokker.toLocaleString()}
                </div>
              </div>
              <div className="stat-panel">
                <label>Total sagtid</label>
                <div className="stat-value">{totalSagtid.toFixed(1)}t</div>
              </div>
            </section>

            <DriftsHistorikkComponent blade={blade} />

            <ServiceHistorikk
              blade={blade}
              setSelectedServiceForCheckout={setSelectedServiceForCheckout}
            />
          </main>
        </div>
      )}

      {isModalOpen && blade && (
        <CheckInModal
          blade={blade}
          handleCreateService={handleCreateService}
          serviceType={serviceType}
          setServiceType={setServiceType}
          note={note}
          setNote={setNote}
          setIsModalOpen={setIsModalOpen}
          createService={createService}
          feilkode={feilkode}
          setFeilkode={setFeilkode}
        />
      )}

      {selectedServiceForCheckout && (
        <CheckoutModal
          service={selectedServiceForCheckout}
          bladeIdNummer={blade?.IdNummer ?? ""}
          serviceKoder={serviceKoder ?? []}
          onClose={() => setSelectedServiceForCheckout(null)}
          onSuccess={() => {
            setSelectedServiceForCheckout(null);
            void refetch();
          }}
        />
      )}

      <style jsx>{`
        .page-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 40px 20px;
          color: #1e293b;
          background: #f8fafc;
          min-height: 100vh;
          font-family: "Inter", system-ui, sans-serif;
        }

        /* --- SØK --- */
        .search-box {
          display: flex;
          gap: 12px;
          width: 100%;
          max-width: 550px;
          background: white;
          padding: 10px;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          margin: 0 auto 50px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        }
        .search-box input {
          flex: 1;
          border: none;
          padding: 12px 15px;
          font-size: 16px;
          outline: none;
          background: transparent;
        }
        .search-btn {
          background: #0f172a;
          color: white;
          border: none;
          padding: 0 25px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .search-btn:hover {
          background: #1e293b;
        }

        /* --- LAYOUT --- */
        .content-layout {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 40px;
          align-items: start;
        }

        /* --- DET NYE PRO KORTET --- */
        .blade-pro-card {
          position: sticky;
          top: 20px;
          border-radius: 35px;
          overflow: hidden;
          color: white;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.3s ease;
        }

        .bg-ok {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        .bg-service {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }
        .bg-production {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }
        .bg-deleted {
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
        }

        .card-glass-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(0, 0, 0, 0.2) 100%
          );
          pointer-events: none;
        }

        .card-header-v2 {
          padding: 40px 30px 30px;
          position: relative;
          text-align: center;
          z-index: 1;
        }

        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(4px);
          border-radius: 99px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.05em;
          margin-bottom: 20px;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #fff;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
          }
        }

        .serial-number {
          font-size: 52px;
          font-weight: 900;
          line-height: 0.9;
          margin: 0;
          letter-spacing: -2px;
        }

        .blade-subtitle {
          opacity: 0.9;
          font-size: 14px;
          font-weight: 500;
          margin-top: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-content-v2 {
          background: white;
          margin: 0 12px 12px;
          border-radius: 28px;
          padding: 25px;
          position: relative;
          z-index: 1;
          color: #1e293b;
        }

        .main-action-btn-v2 {
          width: 100%;
          padding: 16px;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 16px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 25px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
        }
        .main-action-btn-v2:hover:not(:disabled) {
          transform: translateY(-2px);
          background: #1e293b;
          box-shadow: 0 6px 15px rgba(15, 23, 42, 0.2);
        }
        .main-action-btn-v2:disabled {
          background: #f1f5f9;
          color: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
        }

        .info-grid-v2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          padding-top: 5px;
        }
        .info-tile {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .full-width {
          grid-column: span 2;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
          margin-top: 5px;
        }
        .info-tile label {
          font-size: 10px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
        }
        .info-tile span {
          font-weight: 700;
          color: #334155;
          font-size: 15px;
        }

        /* --- STATS --- */
        .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 40px;
        }
        .stat-panel {
          background: white;
          padding: 25px;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }
        .stat-panel label {
          display: block;
          font-size: 11px;
          color: #64748b;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .stat-value {
          font-size: 36px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -1px;
        }

        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
