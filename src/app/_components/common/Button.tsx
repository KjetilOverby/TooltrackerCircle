// UpgradeButton.tsx
"use client";

import Link from "next/link";

interface ButtonProps {
  title: string;
}

export default function Button({ title }: ButtonProps) {
  return (
    <Link href="/subscription" className="rounded bg-green-500 px-4 py-2">
      {title}
    </Link>
  );
}
