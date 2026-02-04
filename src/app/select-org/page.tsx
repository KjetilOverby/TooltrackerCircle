// app/select-org/page.tsx
"use client";

import { OrganizationSwitcher } from "@clerk/nextjs";
import { OrgRedirect } from "../_components/OrgRedirect";

export default function SelectOrgPage() {
  return (
    <main className="wrap">
      {/* bakgrunns “blobs” */}
      <div className="bg" aria-hidden="true">
        <OrgRedirect />
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="grid" />
      </div>

      <section className="card" role="region" aria-label="Velg organisasjon">
        <div className="top">
          <div className="badge">
            <span className="dot" />
            Tilgang krever organisasjon
          </div>

          <h1 className="title">Velg organisasjon</h1>
          <p className="lead">
            Du må være tilknyttet en organisasjon for å bruke appen. Hvis du
            ikke ser noen organisasjoner under, må en administrator invitere
            deg.
          </p>
        </div>

        <div className="divider" />

        <div className="switcher">
          <OrganizationSwitcher hidePersonal />
        </div>

        <div className="helper">
          <div className="helperIcon" aria-hidden="true">
            ?
          </div>
          <div className="helperText">
            <div className="helperTitle">Finner du ingen organisasjoner?</div>
            <div className="helperBody">
              Be en admin i bedriften om å invitere brukeren din til riktig org.
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .wrap {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              1200px 600px at 50% -10%,
              rgba(56, 189, 248, 0.22),
              rgba(248, 250, 252, 1) 45%
            ),
            radial-gradient(
              900px 500px at 10% 90%,
              rgba(99, 102, 241, 0.14),
              rgba(248, 250, 252, 0) 55%
            ),
            #f8fafc;
        }

        .bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 999px;
          filter: blur(40px);
          opacity: 0.55;
          transform: translateZ(0);
        }

        .b1 {
          left: -180px;
          top: -200px;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(56, 189, 248, 0.9),
            rgba(59, 130, 246, 0.2)
          );
          animation: float1 10s ease-in-out infinite;
        }

        .b2 {
          right: -220px;
          bottom: -240px;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(99, 102, 241, 0.75),
            rgba(236, 72, 153, 0.18)
          );
          animation: float2 12s ease-in-out infinite;
        }

        .grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.05) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(
            520px 520px at 50% 30%,
            rgba(0, 0, 0, 0.7),
            transparent 70%
          );
          opacity: 0.35;
        }

        .card {
          width: min(560px, 100%);
          position: relative;
          border-radius: 20px;
          padding: 30px 28px;
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(226, 232, 240, 0.9);
          box-shadow:
            0 24px 60px rgba(15, 23, 42, 0.12),
            0 10px 22px rgba(15, 23, 42, 0.08);
          overflow: hidden;
          animation: cardIn 420ms ease-out both;
        }

        /* subtil “shine” */
        .card::before {
          content: "";
          position: absolute;
          inset: -120px -160px auto auto;
          width: 420px;
          height: 420px;
          background: radial-gradient(
            closest-side,
            rgba(255, 255, 255, 0.65),
            rgba(255, 255, 255, 0)
          );
          transform: rotate(20deg);
          opacity: 0.9;
          animation: shine 3.8s ease-in-out infinite;
          pointer-events: none;
        }

        .top {
          position: relative;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 13px;
          color: #0f172a;
          background: rgba(226, 232, 240, 0.6);
          border: 1px solid rgba(226, 232, 240, 1);
          margin-bottom: 14px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #38bdf8;
          box-shadow: 0 0 0 6px rgba(56, 189, 248, 0.18);
          animation: pulse 1.8s ease-in-out infinite;
        }

        .title {
          margin: 0;
          font-size: 26px;
          letter-spacing: -0.02em;
          color: #0f172a;
        }

        .lead {
          margin: 10px 0 0;
          color: #475569;
          font-size: 15px;
          line-height: 1.55;
        }

        .divider {
          height: 1px;
          margin: 20px 0 20px;
          background: linear-gradient(
            to right,
            transparent,
            rgba(148, 163, 184, 0.45),
            transparent
          );
        }

        .switcher {
          position: relative;
          display: grid;
          gap: 12px;
        }

        .helper {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 34px 1fr;
          gap: 12px;
          padding: 14px 14px;
          border-radius: 14px;
          background: rgba(241, 245, 249, 0.7);
          border: 1px solid rgba(226, 232, 240, 0.9);
        }

        .helperIcon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: rgba(56, 189, 248, 0.14);
          color: #0f172a;
          font-weight: 700;
        }

        .helperTitle {
          font-size: 13px;
          font-weight: 650;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .helperBody {
          font-size: 13px;
          color: #64748b;
          line-height: 1.45;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(56, 189, 248, 0.16);
          }
          50% {
            transform: scale(1.06);
            box-shadow: 0 0 0 10px rgba(56, 189, 248, 0.12);
          }
        }

        @keyframes float1 {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(40px, 30px);
          }
        }

        @keyframes float2 {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-36px, -28px);
          }
        }

        @keyframes shine {
          0%,
          100% {
            opacity: 0.85;
            transform: translate(0, 0) rotate(20deg);
          }
          50% {
            opacity: 0.65;
            transform: translate(-12px, 8px) rotate(18deg);
          }
        }

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* litt mer kompakt på små skjermer */
        @media (max-width: 520px) {
          .card {
            padding: 24px 18px;
            border-radius: 18px;
          }
          .title {
            font-size: 22px;
          }
        }
      `}</style>
    </main>
  );
}
