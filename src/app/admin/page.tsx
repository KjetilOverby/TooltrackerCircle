import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import Button from "../_components/common/Button";

export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>;
}) {
  const query = (await params.searchParams).search;
  const client = await clerkClient();
  const { has, userId, orgId, orgRole } = await auth();

  return (
    <>
      <div className="p-5">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>

        {has?.({ feature: "widget" }) ? (
          <div>
            <h1>You have access to Widgets</h1>
          </div>
        ) : (
          <div>
            <h1>Upgrade to Pro for access</h1>
            <Button title="UPGRADE NOW" />
          </div>
        )}

        {orgRole === "org:admin" ? (
          <div>Aut org</div>
        ) : (
          <div>Not org</div> // Ikke autorisert
        )}
      </div>
    </>
  );
}
