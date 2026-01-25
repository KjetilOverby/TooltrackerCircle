"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

type Props = {
  showOrg?: boolean;
  showUser?: boolean;
};

function Icon({
  name,
}: {
  name:
    | "home"
    | "drift"
    | "log"
    | "history"
    | "chart"
    | "service"
    | "wrench"
    | "plus"
    | "calendar"
    | "settings";
}) {
  // Enkle inline SVG-er (ingen dependency)
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none" as const,
  };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path
            d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "drift":
      return (
        <svg {...common}>
          <path
            d="M7 7h10M7 12h10M7 17h6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "log":
      return (
        <svg {...common}>
          <path
            d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M8 8h8M8 12h8M8 16h5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "history":
      return (
        <svg {...common}>
          <path
            d="M4 12a8 8 0 1 0 2-5.3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M4 4v4h4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 7v5l3 2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path
            d="M5 19V5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M5 19h14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M8 15l3-3 3 2 4-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "service":
      return (
        <svg {...common}>
          <path
            d="M20 7h-6l-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M8 12h8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "wrench":
      return (
        <svg {...common}>
          <path
            d="M21 6.5a5 5 0 0 1-6.6 4.8L8 17.7a2 2 0 0 1-2.8 0l-.9-.9a2 2 0 0 1 0-2.8l6.4-6.4A5 5 0 0 1 17.5 3l-3 3 3.5 3.5 3-3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <path
            d="M7 4v3M17 4v3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M5 8h14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M6 6h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <path
            d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M19.4 15a7.7 7.7 0 0 0 .1-2l2-1.5-2-3.4-2.4.8a7.5 7.5 0 0 0-1.7-1L15 5h-6l-.4 2.9a7.5 7.5 0 0 0-1.7 1L4.5 8.1l-2 3.4 2 1.5a7.7 7.7 0 0 0 .1 2l-2 1.5 2 3.4 2.4-.8c.5.4 1.1.7 1.7 1L9 23h6l.4-2.9c.6-.3 1.2-.6 1.7-1l2.4.8 2-3.4-2-1.5Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
            opacity="0.9"
          />
        </svg>
      );
    default:
      return null;
  }
}

export default function Navbar({ showOrg = true, showUser = true }: Props) {
  const pathname = usePathname();

  const driftRef = useRef<HTMLDetailsElement>(null);
  const serviceRef = useRef<HTMLDetailsElement>(null);

  const closeAll = () => {
    if (driftRef.current?.open) driftRef.current.open = false;
    if (serviceRef.current?.open) serviceRef.current.open = false;
  };

  const closeOthers = (which: "drift" | "service") => {
    if (which === "drift") {
      if (serviceRef.current?.open) serviceRef.current.open = false;
    } else {
      if (driftRef.current?.open) driftRef.current.open = false;
    }
  };

  useEffect(() => {
    closeAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const drift = driftRef.current;
      const service = serviceRef.current;

      if (drift?.open && drift.contains(target)) return;
      if (service?.open && service.contains(target)) return;

      closeAll();
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="header">
      <div className="left">
        {showOrg ? <OrganizationSwitcher /> : null}

        <nav className="nav" aria-label="Hovedmeny">
          <Link href="/startside" className="navPill" onClick={closeAll}>
            <span className="pillIcon">
              <Icon name="home" />
            </span>
            <span className="pillText">Hjem</span>
          </Link>

          <details
            ref={driftRef}
            className="dropdown"
            onToggle={(e) => {
              if (e.currentTarget.open) closeOthers("drift");
            }}
          >
            <summary className="navPill navPillBtn">
              <span className="pillIcon">
                <Icon name="drift" />
              </span>
              <span className="pillText">Drift</span>
              <span className="chev" aria-hidden>
                ▾
              </span>
            </summary>

            <div className="menu" role="menu">
              <Link
                className="menuItem"
                href="/machines"
                onClick={closeAll}
                role="menuitem"
              >
                <span className="menuIcon">
                  <Icon name="log" />
                </span>
                <span className="menuMain">
                  <span className="menuTitle">Monter / demonter</span>
                  <span className="menuSub">
                    Bytt og registrer blader i sag
                  </span>
                </span>
              </Link>

              <Link
                className="menuItem"
                href="/drift/etterregistrering"
                onClick={closeAll}
                role="menuitem"
              >
                <span className="menuIcon">
                  <Icon name="history" />
                </span>
                <span className="menuMain">
                  <span className="menuTitle">Etterregistrering</span>
                  <span className="menuSub">
                    Fullfør innlegging av bladbytte
                  </span>
                </span>
              </Link>

              <Link
                className="menuItem"
                href="/drift/historikk"
                onClick={closeAll}
                role="menuitem"
              >
                <span className="menuIcon">
                  <Icon name="history" />
                </span>
                <span className="menuMain">
                  <span className="menuTitle">Driftshistorikk</span>
                  <span className="menuSub">
                    Se tidligere drift per sag/blad
                  </span>
                </span>
              </Link>

              <Link
                className="menuItem"
                href="/drift/statistikk"
                onClick={closeAll}
                role="menuitem"
              >
                <span className="menuIcon">
                  <Icon name="chart" />
                </span>
                <span className="menuMain">
                  <span className="menuTitle">Statistikk</span>
                  <span className="menuSub">Nøkkeltall og utvikling</span>
                </span>
              </Link>
            </div>
          </details>

          <details
            ref={serviceRef}
            className="dropdown"
            onToggle={(e) => {
              if (e.currentTarget.open) closeOthers("service");
            }}
          >
            <summary className="navPill navPillBtn">
              <span className="pillIcon">
                <Icon name="service" />
              </span>
              <span className="pillText">Service</span>
              <span className="chev" aria-hidden>
                ▾
              </span>
            </summary>

            <div className="menu" role="menu">
              <Link
                className="menuItem"
                href="/service"
                onClick={closeAll}
                role="menuitem"
              >
                <span className="menuIcon">
                  <Icon name="service" />
                </span>
                <span className="menuMain">
                  <span className="menuTitle">Oversikt</span>
                  <span className="menuSub">Status og åpne oppgaver</span>
                </span>
              </Link>

              <Link
                className="menuItem"
                href="/service/hendelser"
                onClick={closeAll}
                role="menuitem"
              >
                <span className="menuIcon">
                  <Icon name="wrench" />
                </span>
                <span className="menuMain">
                  <span className="menuTitle">Servicehendelser</span>
                  <span className="menuSub">Logg hendelser og tiltak</span>
                </span>
              </Link>

              <Link
                className="menuItem"
                href="/create"
                onClick={closeAll}
                role="menuitem"
              >
                <span className="menuIcon">
                  <Icon name="plus" />
                </span>
                <span className="menuMain">
                  <span className="menuTitle">Legg til sagblad</span>
                  <span className="menuSub">
                    Registrer nytt blad i systemet
                  </span>
                </span>
              </Link>

              <Link
                className="menuItem"
                href="/service/planlagt"
                onClick={closeAll}
                role="menuitem"
              >
                <span className="menuIcon">
                  <Icon name="calendar" />
                </span>
                <span className="menuMain">
                  <span className="menuTitle">Planlagt service</span>
                  <span className="menuSub">Intervall og kommende jobber</span>
                </span>
              </Link>
            </div>
          </details>

          <Link href="/settings" className="navPill" onClick={closeAll}>
            <span className="pillIcon">
              <Icon name="settings" />
            </span>
            <span className="pillText">Innstillinger</span>
          </Link>
        </nav>
      </div>

      <div className="right">{showUser ? <UserButton /> : null}</div>

      <style>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          height: 60px;
          padding: 0 14px;
          border-bottom: 1px solid #e5e7eb;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: 6px;
        }

        /* roligere enn uppercase + bold */
        .navPill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 12px;
          text-decoration: none;
          color: #111827;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          user-select: none;
          line-height: 1;
        }

        .navPill:hover {
          background: #f3f4f6;
        }

        .navPill:active {
          transform: translateY(0.5px);
        }

        .pillIcon {
          display: inline-flex;
          width: 18px;
          height: 18px;
          color: #6b7280; /* rolig ikonfarge */
        }

        .pillText {
          color: #111827;
          opacity: 0.9; /* roligere tekst */
          white-space: nowrap;
        }

        .dropdown {
          position: relative;
        }

        .navPillBtn {
          list-style: none;
        }

        .dropdown > summary::-webkit-details-marker {
          display: none;
        }

        .chev {
          margin-left: 2px;
          color: #9ca3af;
          font-size: 12px;
        }

        .menu {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          min-width: 290px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 18px 40px rgba(0,0,0,0.12);
          display: none;
        }

        .dropdown[open] .menu {
          display: block;
          animation: pop 110ms ease-out;
          transform-origin: top left;
        }

        @keyframes pop {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .menuItem {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 10px;
          border-radius: 12px;
          text-decoration: none;
          color: #111827;
        }

        .menuItem:hover {
          background: #f3f4f6;
        }

        .menuIcon {
          display: inline-flex;
          width: 28px;
          height: 28px;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #f9fafb;
          border: 1px solid #eef2f7;
          color: #6b7280;
          flex: 0 0 auto;
          margin-top: 1px;
        }

        .menuMain {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .menuTitle {
          font-size: 13px;
          font-weight: 650;
          color: #111827;
          line-height: 1.2;
        }

        .menuSub {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.2;
        }
      `}</style>
    </header>
  );
}
