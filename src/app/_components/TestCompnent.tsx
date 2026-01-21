"use client";
import { Protect } from "@clerk/nextjs";
import React from "react";
import { useOrganization } from "@clerk/nextjs";
import { OrganizationSwitcher } from "@clerk/nextjs";

const TestCompnent = () => {
  const { organization, membership } = useOrganization();

  console.log(organization?.name); // Må vise "test"
  console.log(membership?.role); // Må vise "admin"
  return <div></div>;
};

export default TestCompnent;
