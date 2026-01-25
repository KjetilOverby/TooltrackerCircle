"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

type Props = {
  showOrg?: boolean;
  showUser?: boolean;
};

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

  // ✅ Lukk når route endrer seg (navigasjon, back/forward osv.)
  useEffect(() => {
    closeAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ✅ Lukk når man klikker utenfor
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

        <nav className="nav">
          <Link href="/startside" className="navLink" onClick={closeAll}>
            HJEM
          </Link>

          <details
            ref={driftRef}
            className="dropdown"
            onToggle={(e) => {
              if (e.currentTarget.open) closeOthers("drift");
            }}
          >
            <summary className="navLink navLinkBtn">DRIFT</summary>
            <div className="menu">
              <Link className="menuItem" href="/machines" onClick={closeAll}>
                Monter / demonter
              </Link>
              <Link
                className="menuItem"
                href="/drift/etterregistrering"
                onClick={closeAll}
              >
                Etterregistrering
              </Link>
              <Link
                className="menuItem"
                href="/drift/historikk"
                onClick={closeAll}
              >
                Driftshistorikk
              </Link>
              <Link
                className="menuItem"
                href="/drift/statistikk"
                onClick={closeAll}
              >
                Statistikk
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
            <summary className="navLink navLinkBtn">SERVICE</summary>
            <div className="menu">
              <Link className="menuItem" href="/service" onClick={closeAll}>
                Oversikt
              </Link>
              <Link
                className="menuItem"
                href="/service/hendelser"
                onClick={closeAll}
              >
                Servicehendelser
              </Link>
              <Link className="menuItem" href="/create" onClick={closeAll}>
                Legg til sagblad
              </Link>
              <Link
                className="menuItem"
                href="/service/planlagt"
                onClick={closeAll}
              >
                Planlagt service
              </Link>
            </div>
          </details>
          <Link href="/settings" className="navLink" onClick={closeAll}>
            INNSTILLINGER
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
          height: 64px;
          padding: 0 16px;
          border-bottom: 1px solid #e5e7eb;
          background: #ffffff;
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
          gap: 10px;
          margin-left: 8px;
        }

        .navLink {
          font-size: 13px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #111827;
          text-decoration: none;
          font-weight: 700;
          padding: 8px 10px;
          border-radius: 10px;
          cursor: pointer;
          user-select: none;
        }

        .navLink:hover {
          background: #f3f4f6;
        }

        .dropdown {
          position: relative;
        }

        .navLinkBtn {
          list-style: none;
        }

        .dropdown > summary::-webkit-details-marker {
          display: none;
        }

        .menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          min-width: 220px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 8px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.10);
          display: none;
        }

        .dropdown[open] .menu {
          display: block;
        }

        .menuItem {
          display: block;
          padding: 10px 10px;
          border-radius: 10px;
          text-decoration: none;
          color: #111827;
          font-size: 14px;
          font-weight: 600;
        }

        .menuItem:hover {
          background: #f3f4f6;
        }
      `}</style>
    </header>
  );
}
