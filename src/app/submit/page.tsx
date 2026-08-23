import React, { Suspense } from "react";
import { SubmitForm } from "@/components/SubmitForm";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Claim or Raise Rank Placement — RankBid India",
  description: "Submit your startup, brand, or creator handle to take top rank on Bharat's pay-to-rank leaderboard.",
};

export default function SubmitPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Suspense
        fallback={
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
          </div>
        }
      >
        <SubmitForm />
      </Suspense>
    </div>
  );
}
