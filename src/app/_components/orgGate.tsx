// components/OrgGate.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrgGate() {
  const { isLoaded, userId, orgId } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) return;

    if (!orgId && pathname !== "/select-org") {
      router.replace("/select-org");
    }
  }, [isLoaded, userId, orgId, pathname, router]);

  return null;
}
