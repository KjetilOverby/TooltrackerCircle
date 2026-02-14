"use client";

import React, { useState } from "react";
import { type RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";
import CheckoutModal from "./CheckoutModal";
import DriftsHistorikkComponent from "./DriftsHistorikkComponent";
import ServiceHistorikk from "./ServiceHistorikk";
import CheckInModal from "./CheckInModal";
import CheckedInList from "./CheckedInList";

type BladeData = NonNullable<RouterOutputs["service"]["getByExactIdNummer"]>;
type ServiceData = BladeData["services"][number];

export default function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // States for sletting
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("Normal slitasje");

  const [serviceType, setServiceType] = useState("Sliping");
  const [note, setNote] = useState("");
  const [feilkode, setFeilkode] = useState("");

  const [selectedServiceForCheckout, setSelectedServiceForCheckout] =
    useState<ServiceData | null>(null);

  const utils = api.useUtils();

  // Denne funksjonen håndterer klikk fra listen
  const handleSelectFromList = (idNummer: string) => {
    setSearchTerm(idNummer);
    // Vi må bruke en timeout eller useEffect for å sikre at staten
    // er oppdatert før vi kjører refetch, eller sende id direkte:
    setTimeout(() => {
      void refetch();
      // Scroller opp til søkefeltet/bladet for bedre brukervennlighet
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 10);
  };

  const {
    data: blade,
    isFetching,
    refetch,
  } = api.service.getByExactIdNummer.useQuery(
    { idNummer: searchTerm },
    { enabled: false },
  );

  const { data: serviceKoder } = api.settings.getAllCodes.useQuery();

  const deleteBlade = api.sawBlade.softDelete.useMutation({
    onSuccess: async () => {
      await utils.service.getByExactIdNummer.invalidate({
        idNummer: searchTerm,
      });
      void refetch();
      setIsDeleteModalOpen(false);
    },
  });

  const restoreBlade = api.sawBlade.restore.useMutation({
    onSuccess: async () => {
      await utils.service.getByExactIdNummer.invalidate({
        idNummer: searchTerm,
      });
      void refetch();
    },
  });

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

  const handleConfirmDelete = () => {
    if (!blade) return;
    deleteBlade.mutate({
      id: blade.id,
      deleteReason: deleteReason,
    });
  };

  const handleToggleDelete = () => {
    if (!blade) return;
    if (blade.deleted) {
      if (window.confirm(`Vil du gjenopprette blad ${blade.IdNummer}?`)) {
        restoreBlade.mutate({ id: blade.id });
      }
    } else {
      setIsDeleteModalOpen(true);
    }
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchTerm.trim()) void refetch();
          }}
          className="search-box"
        >
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
          <header className="blade-header-banner">
            <div className={`blade-pro-card wide ${statusClass}`}>
              <div className="card-glass-overlay"></div>

              <div className="card-main-content">
                <div className="header-left">
                  <div className="status-indicator">
                    <span className="pulse-dot"></span>
                    {statusLabel}
                  </div>
                  {/* Elegant visning av årsak ved sletting */}
                  {isDeleted && blade.deleteReason && (
                    <div className="delete-reason-badge">
                      <span className="reason-label">ÅRSAK:</span>
                      <span className="reason-text">{blade.deleteReason}</span>
                    </div>
                  )}
                  <h1 className="serial-number">{blade.IdNummer}</h1>
                  <p className="blade-subtitle">
                    {blade.bladeType?.name || "Standard sagblad"}
                  </p>
                </div>

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
                  <div className="action-group">
                    <button
                      className="main-action-btn-v2"
                      onClick={() => setIsModalOpen(true)}
                      disabled={
                        !!activeService || !!activeInstall || !!isDeleted
                      }
                    >
                      {activeService
                        ? "På service"
                        : activeInstall
                          ? "I drift"
                          : "+ Service"}
                    </button>

                    <button
                      className={
                        isDeleted ? "restore-action-btn" : "delete-action-btn"
                      }
                      onClick={handleToggleDelete}
                      disabled={
                        deleteBlade.isPending ||
                        restoreBlade.isPending ||
                        (!!activeInstall && !isDeleted)
                      }
                    >
                      {isDeleted ? "Gjenopprett" : "Kasser"}
                    </button>
                  </div>
                </div>
              </div>

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
                      ? new Date(blade.createdAt).toLocaleDateString("no-NO")
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

      {/* KASSERING MODAL */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content small">
            <h3>Kasser blad {blade?.IdNummer}</h3>

            {/* Dynamisk advarsel om aktiv service */}
            {activeService ? (
              <div className="service-warning">
                <strong>OBS!</strong> Dette bladet er sjekket inn til service.
                Ved kassering vil den aktive innsjekken bli slettet.
              </div>
            ) : (
              <p>Vennligst oppgi årsak til kassering:</p>
            )}

            <div className="input-group">
              <label>Årsak</label>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="modal-select"
              >
                <option value="Normal slitasje">Normal slitasje</option>
                <option value="Havari">Havari</option>
                <option value="Varmekjørt">Varmekjørt</option>
                <option value="Dårlig stamme">Dårlig stamme</option>
              </select>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="cancel-btn"
              >
                Avbryt
              </button>
              <button
                onClick={handleConfirmDelete}
                className="confirm-delete-btn"
                disabled={deleteBlade.isPending}
              >
                {deleteBlade.isPending ? "Kasserer..." : "Bekreft kassering"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Andre modaler (CheckIn/Checkout) beholdes som før */}
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

      <div className="mt-12">
        <CheckedInList onSelect={handleSelectFromList} />
      </div>

      <style jsx>{`
        .service-warning {
          background: #fff7ed;
          border: 1px solid #ffedd5;
          color: #9a3412;
          padding: 12px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 20px;
        }

        .service-warning strong {
          color: #ea580c;
          display: block;
          margin-bottom: 2px;
        }
        .delete-reason-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(8px);
          padding: 4px 12px;
          border-radius: 8px;
          margin-bottom: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: slideIn 0.3s ease-out;
        }

        .reason-label {
          font-size: 10px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 0.05em;
        }

        .reason-text {
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content.small {
          background: white;
          padding: 30px;
          border-radius: 24px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
        }

        .modal-content h3 {
          margin-top: 0;
          font-size: 20px;
          color: #0f172a;
        }
        .modal-content p {
          color: #64748b;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 25px;
        }
        .input-group label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
        }

        .modal-select {
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 15px;
          font-weight: 500;
          outline: none;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
        }
        .modal-actions button {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .cancel-btn {
          background: #f1f5f9;
          color: #64748b;
        }
        .cancel-btn:hover {
          background: #e2e8f0;
        }

        .confirm-delete-btn {
          background: #ef4444;
          color: white;
        }
        .confirm-delete-btn:hover {
          background: #dc2626;
          transform: translateY(-2px);
        }
        .page-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
          color: #1e293b;
          min-height: 100vh;
          font-family: "Inter", sans-serif;
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

        .header-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .serial-number {
          font-size: 56px;
          font-weight: 900;
          line-height: 1;
          margin: 0;
          letter-spacing: -2px;
        }
        .blade-subtitle {
          opacity: 0.9;
          font-size: 16px;
          margin-top: 5px;
          font-weight: 500;
        }

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
        .stat-item {
          text-align: center;
        }
        .stat-item label {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 800;
          opacity: 0.7;
          margin-bottom: 4px;
        }
        .stat-item .value {
          font-size: 28px;
          font-weight: 900;
        }
        .stat-divider {
          width: 1px;
          height: 35px;
          background: rgba(255, 255, 255, 0.2);
        }

        .action-group {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .main-action-btn-v2 {
          background: white;
          color: #0f172a;
          border: none;
          padding: 16px 25px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .main-action-btn-v2:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .delete-action-btn {
          background: rgba(0, 0, 0, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 16px 20px;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .delete-action-btn:hover:not(:disabled) {
          background: #ef4444;
          border-color: transparent;
        }

        .restore-action-btn {
          background: white;
          color: #10b981;
          border: none;
          padding: 16px 20px;
          border-radius: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }
        .restore-action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

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
        .footer-item label {
          opacity: 0.6;
          margin-right: 5px;
          font-weight: 600;
        }
        .footer-item span {
          font-weight: 700;
        }

        /* LEDIG / OK - En myk Smaragd/Salvie-grønn */
        .bg-ok {
          background: linear-gradient(
            135deg,
            #6366f1 0%,
            #4338ca 100%
          ); /* Merk: Hvis du vil beholde grønn, bruk koden under */
          background: linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%);
        }

        /* PÅ SERVICE - En varm, nedtonet rav-farge */
        .bg-service {
          background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
        }

        /* I DRIFT - En profesjonell stål-blå */
        .bg-production {
          background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
        }

        /* KASSERT - En dempet, elegant dyp rød/vin-farge */
        .bg-deleted {
          background: linear-gradient(135deg, #f87171 0%, #991b1b 100%);
        }

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
        .card-glass-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(0, 0, 0, 0.1) 100%
          );
          pointer-events: none;
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

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }
      `}</style>
    </div>
  );
}
