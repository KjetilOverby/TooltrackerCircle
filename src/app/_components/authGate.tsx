// app/_components/AuthGate.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up"]; // "/" er IKKE public hvis du vil låse alt

function isPublic(pathname: string) {
  return PUBLIC_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

export default function AuthGate() {
  const { isLoaded, userId, orgId } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // Ikke innlogget -> alltid til sign-in (med redirect_url tilbake hit)
    if (!userId) {
      if (!isPublic(pathname)) {
        const back = encodeURIComponent(window.location.href);
        router.replace(`/sign-in?redirect_url=${back}`);
      }
      return;
    }

    // Innlogget men uten org -> til select-org
    if (!orgId && pathname !== "/select-org") {
      router.replace("/select-org");
    }
  }, [isLoaded, userId, orgId, pathname, router]);

  return null;
}
