"use client";

import { Navbar } from "@/components/landingpage";
import dynamic from 'next/dynamic';
import React from "react";

// Dynamically import LeaderboardTable with SSR disabled
const LeaderboardTable = dynamic(
  () => import("@/components/leaderboard"),
  { ssr: false }
);

const Page = () => {
  return (
    <div>
      <Navbar />
      <LeaderboardTable />
    </div>
  );
};

export default Page;