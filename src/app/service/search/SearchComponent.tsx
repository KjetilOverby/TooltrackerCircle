"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceType, setServiceType] = useState("Sliping");
  const [note, setNote] = useState("");

  const utils = api.useUtils();
  const {
    data: blade,
    isFetching,
    refetch,
  } = api.service.getByExactIdNummer.useQuery(
    { idNummer: searchTerm },
    { enabled: false },
  );

  const createService = api.service.create.useMutation({
    onSuccess: async () => {
      // 1. Invaliderer cachen slik at gamle data slettes
      await utils.service.getByExactIdNummer.invalidate({
        idNummer: searchTerm,
      });

      // 2. Siden spørringen er i "manuell modus" (enabled: false),
      // MÅ vi vekke den med refetch()
      await refetch();

      setIsModalOpen(false);
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

  // Status styling
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

  const formatDateTime = (date: Date | undefined | null) => {
    if (!date) return "—";
    return new Intl.DateTimeFormat("no-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

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
              {/* FARGEKODET HEADER ER TILBAKE */}
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

                {activeInstall && (
                  <p className="hint-text">Må demonteres fra sag først</p>
                )}

                <div className="detail-list">
                  <div className="detail-item">
                    <label>Produsent</label>
                    <span>{blade.produsent ?? "—"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Side</label>
                    <span>{blade.side ?? "Har ikke side"}</span>
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

            <section className="data-section">
              <h2 className="section-title">Driftshistorikk</h2>
              <div className="table-wrapper">
                <table className="pro-table">
                  <thead>
                    <tr>
                      <th>Sag</th>
                      <th>Montert</th>
                      <th>Demontert</th>
                      <th>Stokker</th>
                      <th>Tid</th>
                      <th>Utetemp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blade.installs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="empty-td">
                          Ingen driftshistorikk registrert
                        </td>
                      </tr>
                    )}
                    {blade.installs.map((i) => {
                      const uteTemp = i.runLog?.temperatur;
                      const isFrozen =
                        uteTemp !== null &&
                        uteTemp !== undefined &&
                        uteTemp <= 0;

                      return (
                        <tr key={i.id}>
                          <td className="font-bold">{i.saw?.name}</td>
                          <td className="dimmed">
                            {formatDateTime(i.installedAt)}
                          </td>
                          <td className="dimmed">
                            {i.removedAt
                              ? formatDateTime(i.removedAt)
                              : "I drift"}
                          </td>
                          <td className="font-bold">
                            {i.runLog?.stokkAnt ?? 0}
                          </td>
                          <td>
                            {i.runLog?.sagtid ? `${i.runLog.sagtid}t` : "—"}
                          </td>
                          <td
                            className={`font-bold ${isFrozen ? "text-frozen" : "text-warm"}`}
                          >
                            {uteTemp !== null && uteTemp !== undefined
                              ? `${uteTemp}°C ${isFrozen ? "❄️" : "☀️"}`
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="data-section">
              <h2 className="section-title">Servicehistorikk</h2>
              <div className="table-wrapper">
                <table className="pro-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Notat</th>
                      <th>Registrert</th>
                      <th>status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blade.services.length === 0 && (
                      <tr>
                        <td colSpan={6} className="empty-td">
                          Ingen servicehistorikk registrert
                        </td>
                      </tr>
                    )}
                    {blade.services.map((s) => (
                      <tr
                        key={s.id}
                        className={!s.datoUt ? "active-row-highlight" : ""}
                      >
                        <td className="font-bold">
                          {s.serviceType ?? "Service"}
                          {!s.datoUt && (
                            <span className="active-dot-mini"></span>
                          )}
                        </td>
                        {/* EGET NOTAT: Dette har vi jo fra start, så det kan stå */}
                        <td className="note-cell-small">
                          {s.note ?? <span className="dimmed">—</span>}
                        </td>
                        <td className="dimmed">
                          {new Date(s.datoInn).toLocaleDateString("no-NO")}
                        </td>
                        <td className="dimmed">
                          {s.datoUt ? (
                            new Date(s.datoUt).toLocaleDateString("no-NO")
                          ) : (
                            <span className="status-work">På service</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-box animate-fade-in">
            <div className="modal-header">
              <h2>Registrer innlevering</h2>
              <p>
                Blad: <strong>{blade?.IdNummer}</strong>
              </p>
            </div>
            <form onSubmit={handleCreateService} className="modal-form">
              <div className="input-group">
                <label>Service-type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                >
                  <option value="Sliping">Sliping</option>
                  <option value="Omlodding">Omlodding</option>
                  <option value="Reparasjon">Reparasjon</option>
                  <option value="Reklamasjon">Reklamasjon</option>
                  <option value="Annet">Annet</option>
                </select>
              </div>
              <div className="input-group">
                <label>Notat til sliper</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Beskriv eventuelle skader eller spesielle behov..."
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={createService.isPending}
                >
                  {createService.isPending ? "Lagrer..." : "Start Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style jsx>{`
        .page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: "Inter", sans-serif;
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

        /* Sidebar Card med farger */
        .blade-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
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
          letter-spacing: 0.5px;
        }
        .blade-card-header h1 {
          margin: 0;
          font-size: 42px;
          font-weight: 900;
          line-height: 1;
        }
        .blade-card-header p {
          margin: 8px 0 0;
          opacity: 0.9;
          font-size: 14px;
          font-weight: 500;
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
        .hint-text {
          font-size: 11px;
          color: #94a3b8;
          text-align: center;
        }

        .detail-list {
          margin-top: 25px;
          display: grid;
          gap: 15px;
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

        /* Stats & Tabell */
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
        .stat-panel label {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
        }
        .stat-value {
          font-size: 32px;
          font-weight: 900;
          color: #0f172a;
        }

        .data-section {
          background: white;
          border-radius: 20px;
          padding: 30px;
          border: 1px solid #e2e8f0;
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 900;
          margin-bottom: 20px;
          color: #0f172a;
        }

        .pro-table {
          width: 100%;
          border-collapse: collapse;
        }
        .pro-table th {
          text-align: left;
          padding: 12px;
          font-size: 11px;
          text-transform: uppercase;
          color: #94a3b8;
          border-bottom: 1px solid #f1f5f9;
        }
        .pro-table td {
          padding: 12px;
          border-bottom: 1px solid #f8fafc;
          font-size: 14px;
        }
        .font-bold {
          font-weight: 700;
        }
        .dimmed {
          color: #64748b;
        }

        .service-item {
          padding: 20px;
          background: #f8fafc;
          border-radius: 15px;
          border: 1px solid #f1f5f9;
          margin-bottom: 10px;
        }
        .active-service {
          border-color: #fde68a;
          background: #fffbeb;
        }
        .service-type {
          font-weight: 800;
        }
        .service-date {
          font-size: 12px;
          color: #94a3b8;
        }

        /* MODAL STYLING OPPGRADERT */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-box {
          background: white;
          border-radius: 28px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden; /* For å sikre at border-radius fungerer med header */
        }

        .modal-header {
          background: #0f172a;
          padding: 30px;
          color: white;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .modal-header p {
          margin: 8px 0 0;
          opacity: 0.7;
          font-size: 14px;
        }

        .modal-form {
          padding: 30px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .input-group select,
        .input-group textarea {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: 2px solid #f1f5f9;
          background: #f8fafc;
          font-size: 15px;
          font-family: inherit;
          transition: all 0.2s ease;
          outline: none;
        }

        .input-group select:focus,
        .input-group textarea:focus {
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          margin-top: 30px;
        }

        .btn-secondary {
          flex: 1;
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-secondary:hover {
          background: #e2e8f0;
        }

        .btn-primary {
          flex: 2;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
        }

        .btn-primary:disabled {
          background: #94a3b8;
          box-shadow: none;
          cursor: not-allowed;
          transform: none;
        }
        .text-frozen {
          color: #3b82f6; /* Blåfarge for kuldegrader/klake */
        }
        .text-warm {
          color: #bd420d;
        }

        /* Sørger for at tabellen håndterer 6 kolonner fint */
        .pro-table th,
        .pro-table td {
          padding: 12px 10px;
          white-space: nowrap; /* Hindrer at datoer brekker på små skjermer */
        }
      `}</style>
    </div>
  );
}
