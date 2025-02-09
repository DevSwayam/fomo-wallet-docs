"use client";
import TwitterShareButton from "@/components/intent";
import { Navbar } from "@/components/landingpage";
import PlayGame from "@/components/playgame";
import { useParams } from "next/navigation";
import React from "react";

const Page = () => {
  const params = useParams();
  console.log(params.chainid);
  console.log(params.betid);
  console.log(params.contractAddress);
  return (
    <main className="relative min-h-screen">
      {/* Background grid layers */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-30 blur-sm"
          style={{
            backgroundSize: "50px 50px",
            backgroundImage: `
            linear-gradient(to right, #BE9911 1px, transparent 1px),
            linear-gradient(to bottom, #BE9911 1px, transparent 1px)
          `,
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundSize: "50px 50px",
            filter: "blur(0.5px)",
            backgroundImage: `
            linear-gradient(to right, #BE9911 1px, transparent 1px),
            linear-gradient(to bottom, #BE9911 1px, transparent 1px)
          `,
          }}
        />
      </div>
      {/* Content layer */}
      <div className="relative z-10">
        <Navbar />
        <div className="relative">
          {/* <div className="grid place-items-center mt-6 sm:mt-10">
          <img
            src="/hero.png"
            className="w-full max-w-xs sm:max-w-2xl px-4"
            alt="Hero image"
          />
        </div> */}
          <PlayGame
            chainid={params.chainid}
            betid={params.betid}
            contractAddress={params.contractAddress}
          />
        </div>
      </div>
    </main>
  );
};

export default Page;
