"use client";
import { Protect } from "@clerk/nextjs";
import React from "react";
import { useOrganization } from "@clerk/nextjs";
import { OrganizationSwitcher } from "@clerk/nextjs";

const TestCompnent = () => {
  const { organization, membership } = useOrganization();

  console.log(organization?.name); // Må vise "test"
  console.log(membership?.role); // Må vise "admin"
  return (
    <div>
      <h1>This is the test app</h1>
      <Protect
        role="org:admin"
        fallback={<p>You do not have the permissions to create an invoice.</p>}
      >
        <h1>My new test</h1>
      </Protect>
      <OrganizationSwitcher />
    </div>
  );
};

export default TestCompnent;
