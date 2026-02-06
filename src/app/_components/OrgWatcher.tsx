"use client";

import { useOrganization } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export function OrgChangeListener() {
  const { organization } = useOrganization();
  const router = useRouter();
  const utils = api.useUtils();

  useEffect(() => {
    if (!organization) return;

    void utils.invalidate();
    router.refresh();
  }, [organization?.id, router, utils]);

  return null;
}
