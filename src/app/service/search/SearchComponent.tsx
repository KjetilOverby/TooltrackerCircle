"use client";

import React, { useState } from "react";
import { type RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";
import CheckoutModal from "./CheckoutModal";
import DriftsHistorikkComponent from "./DriftsHistorikkComponent";
import ServiceHistorikk from "./ServiceHistorikk";
import CheckInModal from "./CheckInModal";

// Definere typene fra TRPC-outputen for å unngå 'any'
type BladeData = NonNullable<RouterOutputs["service"]["getByExactIdNummer"]>;
type ServiceData = BladeData["services"][number];

export default function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceType, setServiceType] = useState("Sliping");
  const [note, setNote] = useState("");
  const [feilkode, setFeilkode] = useState("");

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
      void refetch();
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
          {/* TOPP-BANNER: Full bredde med status og statistikk */}
          <header className="blade-header-banner">
            <div className={`blade-pro-card wide ${statusClass}`}>
              <div className="card-glass-overlay"></div>

              <div className="card-main-content">
                <div className="header-left">
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

                {/* Integrert statistikk midt i kortet */}
                <div className="header-stats">
                  <div className="stat-item">
                    <label>Totalt stokker</label>
                    <div className="value">{totalStokker.toLocaleString()}</div>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <label>Total sagtid</label>
                    <div className="value">{totalSagtid.toFixed(1)}t</div>
                  </div>
                </div>

                <div className="header-right">
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
                </div>
              </div>

              {/* Info-detaljer som en stripe nederst */}
              <div className="card-footer-details">
                <div className="footer-item">
                  <label>Produsent:</label>{" "}
                  <span>{blade.produsent ?? "—"}</span>
                </div>
                <div className="footer-item">
                  <label>Side:</label> <span>{blade.side ?? "N/A"}</span>
                </div>
                <div className="footer-item">
                  <label>Registrert:</label>
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
          </header>

          <main className="main-content">
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
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
          color: #1e293b;
          background: #f8fafc;
          min-height: 100vh;
          font-family: "Inter", system-ui, sans-serif;
        }

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
        }
        .search-btn {
          background: #0f172a;
          color: white;
          border: none;
          padding: 0 25px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .content-layout {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        /* --- WIDE PRO CARD --- */
        .blade-pro-card.wide {
          position: relative;
          border-radius: 30px;
          overflow: hidden;
          color: white;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-main-content {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 40px;
          position: relative;
          z-index: 2;
          gap: 30px;
        }

        .header-left { display: flex; flex-direction: column; align-items: flex-start; }
        .serial-number { font-size: 56px; font-weight: 900; line-height: 1; margin: 0; letter-spacing: -2px; }
        .blade-subtitle { opacity: 0.9; font-size: 16px; margin-top: 5px; font-weight: 500; }

        .header-stats {
          display: flex;
          align-items: center;
          gap: 35px;
          background: rgba(0, 0, 0, 0.15);
          padding: 18px 35px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-item text-align: center;
        .stat-item label { display: block; font-size: 10px; text-transform: uppercase; font-weight: 800; opacity: 0.7; margin-bottom: 4px; }
        .stat-item .value { font-size: 28px; font-weight: 900; }
        .stat-divider { width: 1px; height: 35px; background: rgba(255, 255, 255, 0.2); }

        .main-action-btn-v2 {
          background: white;
          color: #0f172a;
          border: none;
          padding: 16px 30px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .main-action-btn-v2:hover:not(:disabled) { transform: scale(1.03); }
        .main-action-btn-v2:disabled { background: rgba(255, 255, 255, 0.2); color: rgba(255, 255, 255, 0.5); cursor: not-allowed; }

        .card-footer-details {
          background: rgba(0, 0, 0, 0.1);
          padding: 12px 40px;
          display: flex;
          gap: 25px;
          font-size: 13px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          position: relative;
          z-index: 2;
        }

        .footer-item label { opacity: 0.6; margin-right: 5px; font-weight: 600; }
        .footer-item span { font-weight: 700; }

        .bg-ok { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .bg-service { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        .bg-production { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
        .bg-deleted { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }

        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 99px;
          font-size: 11px;
          font-weight: 900;
          margin-bottom: 15px;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #fff;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }

        .card-glass-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%);
          pointer-events: none;
        }

        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1100px) {
          .card-main-content { grid-template-columns: 1fr; text-align: center; }
          .header-left, .header-right { align-items: center; justify-content: center; }
          .header-stats { justify-content: center; }
        }
      `}</style>
    </div>
  );
}
