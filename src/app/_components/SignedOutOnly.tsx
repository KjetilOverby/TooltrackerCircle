// app/page.tsx
"use client";

import { SignInButton, SignedOut, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { isLoaded, userId, orgId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // Innlogget + org -> rett inn i appen
    if (userId && orgId) {
      router.replace("/machines"); // <- bytt til din "hovedside"
      return;
    }

    // Innlogget men uten org -> velg org
    if (userId && !orgId) {
      router.replace("/select-org");
    }
  }, [isLoaded, userId, orgId, router]);

  // Mens Clerk laster (unngå "flash" av landing)
  if (!isLoaded) return null;

  return (
    <SignedOut>
      <main className="wrap">
        <div className="bg" aria-hidden="true">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="grid" />
        </div>

        <section className="hero">
          <div className="badge">
            <span className="dot" />
            Tooltracker • privat tilgang
          </div>

          <h1 className="title">
            Hold kontroll på <span className="grad">sagblad</span>, drift og
            historikk.
          </h1>

          <p className="lead">
            Tooltracker er en privat løsning for utvalgte brukere. For å komme
            inn må du logge inn og være tilknyttet en organisasjon.
          </p>

          <div className="ctaRow">
            <SignInButton mode="redirect">
              <button className="primary">Logg inn</button>
            </SignInButton>

            <div className="mini">
              <div className="miniTitle">Første gang?</div>
              <div className="miniBody">
                Du må få tildelt organisasjon av en admin før du kan bruke
                appen.
              </div>
            </div>
          </div>

          <div className="cards">
            <div className="card">
              <div className="cardIcon" aria-hidden="true">
                ⏱
              </div>
              <div className="cardTitle">Historikk & driftstid</div>
              <div className="cardBody">
                Se når blader er montert/demontert, og få bedre grunnlag for
                etterregistrering.
              </div>
            </div>

            <div className="card">
              <div className="cardIcon" aria-hidden="true">
                🧩
              </div>
              <div className="cardTitle">Organisasjonsstyrt</div>
              <div className="cardBody">
                Data er knyttet til organisasjon. Du må inviteres av admin for å
                få tilgang.
              </div>
            </div>

            <div className="card">
              <div className="cardIcon" aria-hidden="true">
                🔒
              </div>
              <div className="cardTitle">Privat & kontrollert</div>
              <div className="cardBody">
                Kun utvalgte brukere får tilgang. Innlogging og tilgang
                håndteres via Clerk.
              </div>
            </div>
          </div>

          <div className="footerNote">
            <span className="muted">
              Trenger du tilgang? Kontakt admin for invitasjon til riktig
              organisasjon.
            </span>
          </div>
        </section>

        <style jsx>{`
          /* (samme CSS som sist) */
          .wrap {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 28px 24px;
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
            width: 620px;
            height: 620px;
            border-radius: 999px;
            filter: blur(54px);
            opacity: 0.55;
            transform: translateZ(0);
          }
          .b1 {
            left: -260px;
            top: -280px;
            background: radial-gradient(
              circle at 30% 30%,
              rgba(56, 189, 248, 0.95),
              rgba(59, 130, 246, 0.2)
            );
            animation: float1 10s ease-in-out infinite;
          }
          .b2 {
            right: -300px;
            bottom: -300px;
            background: radial-gradient(
              circle at 30% 30%,
              rgba(99, 102, 241, 0.8),
              rgba(236, 72, 153, 0.16)
            );
            animation: float2 12s ease-in-out infinite;
          }
          .grid {
            position: absolute;
            inset: 0;
            background-image:
              linear-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px),
              linear-gradient(
                90deg,
                rgba(15, 23, 42, 0.05) 1px,
                transparent 1px
              );
            background-size: 56px 56px;
            mask-image: radial-gradient(
              560px 560px at 50% 30%,
              rgba(0, 0, 0, 0.7),
              transparent 70%
            );
            opacity: 0.3;
          }
          .hero {
            width: min(980px, 100%);
            background: rgba(255, 255, 255, 0.82);
            border: 1px solid rgba(226, 232, 240, 0.95);
            border-radius: 22px;
            padding: 34px 30px;
            box-shadow:
              0 26px 70px rgba(15, 23, 42, 0.12),
              0 10px 22px rgba(15, 23, 42, 0.08);
            backdrop-filter: blur(10px);
            position: relative;
            overflow: hidden;
            animation: in 420ms ease-out both;
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            border-radius: 999px;
            font-size: 13px;
            color: #0f172a;
            background: rgba(226, 232, 240, 0.7);
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
            font-size: 34px;
            letter-spacing: -0.03em;
            color: #0f172a;
            line-height: 1.08;
          }
          .grad {
            background: linear-gradient(135deg, #38bdf8, #6366f1);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          .lead {
            margin: 14px 0 0;
            color: #475569;
            font-size: 16px;
            line-height: 1.65;
            max-width: 64ch;
          }
          .ctaRow {
            margin-top: 22px;
            display: grid;
            grid-template-columns: 220px 1fr;
            gap: 16px;
            align-items: start;
          }
          .primary {
            width: 100%;
            border: 0;
            border-radius: 14px;
            padding: 12px 14px;
            font-weight: 700;
            cursor: pointer;
            color: #0b1220;
            background: linear-gradient(135deg, #38bdf8, #6366f1);
            box-shadow: 0 14px 28px rgba(99, 102, 241, 0.18);
            transition:
              transform 120ms ease,
              filter 120ms ease;
          }
          .primary:hover {
            filter: brightness(1.02);
            transform: translateY(-1px);
          }
          .mini {
            padding: 14px 14px;
            border-radius: 14px;
            background: rgba(241, 245, 249, 0.72);
            border: 1px solid rgba(226, 232, 240, 0.9);
          }
          .miniTitle {
            font-size: 13px;
            font-weight: 750;
            color: #0f172a;
            margin-bottom: 2px;
          }
          .miniBody {
            font-size: 13px;
            color: #64748b;
            line-height: 1.45;
          }
          .cards {
            margin-top: 22px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
          }
          .card {
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(226, 232, 240, 0.95);
            border-radius: 16px;
            padding: 14px 14px;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
          }
          .cardIcon {
            width: 36px;
            height: 36px;
            border-radius: 12px;
            display: grid;
            place-items: center;
            background: rgba(56, 189, 248, 0.14);
            font-weight: 800;
            margin-bottom: 10px;
          }
          .cardTitle {
            font-size: 14px;
            font-weight: 750;
            color: #0f172a;
            margin-bottom: 6px;
          }
          .cardBody {
            font-size: 13px;
            color: #64748b;
            line-height: 1.45;
          }
          .footerNote {
            margin-top: 18px;
          }
          .muted {
            font-size: 13px;
            color: #64748b;
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
          @keyframes in {
            from {
              opacity: 0;
              transform: translateY(10px) scale(0.99);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @media (max-width: 920px) {
            .cards {
              grid-template-columns: 1fr;
            }
            .ctaRow {
              grid-template-columns: 1fr;
            }
          }
          @media (max-width: 520px) {
            .hero {
              padding: 24px 18px;
              border-radius: 18px;
            }
            .title {
              font-size: 26px;
            }
          }
        `}</style>
      </main>
    </SignedOut>
  );
}
