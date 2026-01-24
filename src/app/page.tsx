import Admin from "~/roles/Admin";
import { api, HydrateClient } from "~/trpc/server";
import SignedOutOnly from "./_components/SignedOutOnly";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#ffffff] to-[#aec4e8]">
        <div className="container flex flex-col items-center justify-center gap-12 px-1 py-5">
          <SignedOutOnly />
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            TOOLTRACKER{" "}
            <span className="text-[hsl(280,100%,70%)]">SIRKEL</span>{" "}
          </h1>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8"></div>
          <div className="flex flex-col items-center gap-2"></div>
        </div>
      </main>
    </HydrateClient>
  );
}
