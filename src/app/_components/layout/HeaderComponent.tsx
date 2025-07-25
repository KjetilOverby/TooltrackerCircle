import React from "react";
import {
  ClerkProvider,
  OrganizationSwitcher,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

const HeaderComponent = () => {
  return (
    <div>
      {" "}
      <header className="flex h-16 items-center justify-start gap-4 p-4">
        <SignedOut>
          <SignInButton />
          <SignUpButton>
            <button className="h-10 cursor-pointer rounded-full bg-[#6c47ff] px-4 text-sm font-medium text-white sm:h-12 sm:px-5 sm:text-base">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <OrganizationSwitcher />
          <UserButton />
          <Link href="/subscription" className="hover:underline">
            Subscriptions
          </Link>
          <Link href="/admin" className="hover:underline">
            Admin
          </Link>
        </SignedIn>
      </header>
    </div>
  );
};

export default HeaderComponent;
