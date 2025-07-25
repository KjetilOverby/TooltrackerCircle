"use client";
import { useUser } from "@clerk/nextjs";

import React, { use } from "react";

type RoleGuardProps = {
  role: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

function RoleGuard({ role, children, fallback = null }: RoleGuardProps) {
  const { isSignedIn, user, isLoaded } = useUser();
  console.log(user);

  if (!isLoaded) return null; // Eller en loader/spinner

  if (!isSignedIn || user?.publicMetadata?.role !== "admin") {
    return <>{fallback}</>; // Tom, eller alternativt innhold
  }

  return <>{children}</>;
}

export default function Admin({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="Admin" fallback={<p>Access denied. Admins only.</p>}>
      {children}
    </RoleGuard>
  );
}
