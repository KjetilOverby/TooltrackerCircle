"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function OrgRedirect() {
  const { isLoaded, orgId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded) return;

    // Når org akkurat er valgt → send til /dashboard (eller hva du vil)
    if (orgId && pathname === "/select-org") {
      router.replace("/startside");
    }
  }, [isLoaded, orgId, pathname, router]);

  return null;
}
