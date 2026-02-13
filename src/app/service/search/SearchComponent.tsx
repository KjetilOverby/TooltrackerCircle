"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import CheckoutModal from "./CheckoutModal";
import DriftsHistorikkComponent from "./DriftsHistorikkComponent";
import ServiceHistorikk from "./ServiceHistorikk";
import CheckInModal from "./CheckInModal";

export default function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceType, setServiceType] = useState("Sliping");
  const [note, setNote] = useState("");
  const [selectedServiceForCheckout, setSelectedServiceForCheckout] = useState<
    any | null
  >(null);
  const [feilkode, setFeilkode] = useState("");

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
      feilkode: serviceType === "Reklamasjon" ? feilkode : undefined, // Sender kun feilkode ved reklamasjon
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
          <button type="submit" disabled={isFetching}>
            {isFetching ? "Søker..." : "Finn blad"}
          </button>
        </form>
      </div>

      {blade && (
        <div className="content-layout animate-fade-in">
          <aside className="sidebar">
            <div className="blade-card">
              <div className={`blade-card-header ${statusClass}`}>
                <span className="status-badge">{statusLabel}</span>
                <h1>{blade.IdNummer}</h1>
                <p>{blade.bladeType?.name || "Standard sagblad"}</p>
              </div>

              <div className="blade-card-body">
                <button
                  className="main-action-btn"
                  onClick={() => setIsModalOpen(true)}
                  disabled={!!activeService || !!activeInstall || !!isDeleted}
                >
                  {activeService
                    ? "Allerede på service"
                    : activeInstall
                      ? "I drift"
                      : "+ Registrer service"}
                </button>

                <div className="detail-list">
                  <div className="detail-item">
                    <label>Produsent</label>
                    <span>{blade.produsent ?? "—"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Side</label>
                    <span>{blade.side ?? "N/A"}</span>
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
            refetch();
          }}
        />
      )}

      <style jsx>{`
        .page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          color: #1e293b;
          background: #f8fafc;
          min-height: 100vh;
        }
        .search-box {
          display: flex;
          gap: 10px;
          width: 100%;
          max-width: 500px;
          background: white;
          padding: 8px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          margin: 0 auto 40px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .search-box input {
          flex: 1;
          border: none;
          padding: 10px;
          font-size: 16px;
          outline: none;
        }
        .search-box button {
          background: #0f172a;
          color: white;
          border: none;
          padding: 0 20px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }
        .content-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 40px;
        }
        .blade-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          position: sticky;
          top: 20px;
        }
        .blade-card-header {
          padding: 30px;
          color: white;
          text-align: center;
        }
        .bg-ok {
          background: #10b981;
        }
        .bg-service {
          background: #f59e0b;
        }
        .bg-production {
          background: #3b82f6;
        }
        .bg-deleted {
          background: #ef4444;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(0, 0, 0, 0.15);
          border-radius: 20px;
          font-size: 11px;
          font-weight: 900;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        .blade-card-header h1 {
          margin: 0;
          font-size: 42px;
          font-weight: 900;
        }
        .blade-card-body {
          padding: 30px;
        }
        .main-action-btn {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          border: none;
          background: #0f172a;
          color: white;
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 10px;
        }
        .main-action-btn:disabled {
          background: #f1f5f9;
          color: #94a3b8;
          cursor: not-allowed;
        }
        .detail-list {
          margin-top: 25px;
          border-top: 1px solid #f1f5f9;
          padding-top: 20px;
        }
        .detail-item label {
          display: block;
          font-size: 10px;
          color: #94a3b8;
          font-weight: 800;
          text-transform: uppercase;
        }
        .detail-item span {
          font-weight: 700;
          color: #334155;
        }
        .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-panel {
          background: white;
          padding: 25px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }
        .stat-value {
          font-size: 32px;
          font-weight: 900;
          color: #0f172a;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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
