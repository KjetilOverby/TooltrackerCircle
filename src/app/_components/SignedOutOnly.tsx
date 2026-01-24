// components/AuthGateOverlay.tsx
"use client";

import { SignedOut, SignInButton } from "@clerk/nextjs";

export default function AuthGateOverlay() {
  return (
    <SignedOut>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(0,0,0,0.55)",
          display: "grid",
          placeItems: "center",
          padding: 16,
        }}
      >
        <div
          style={{
            width: "min(480px, 100%)",
            background: "white",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 22 }}>Logg inn for å fortsette</h2>
          <p style={{ marginTop: 10, opacity: 0.8 }}>
            Du må være innlogget for å bruke appen.
          </p>

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <SignInButton mode="modal">
              <button style={{ padding: "10px 14px" }}>Logg inn</button>
            </SignInButton>
          </div>
        </div>
      </div>
    </SignedOut>
  );
}
