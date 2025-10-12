import { getRecentDecisions } from "@/actions";
import DecisionsTrackerPage from "@/app/_components/DecisionTracker";
import React from "react";

async function page() {
  const { data, error } = await getRecentDecisions();
  return <DecisionsTrackerPage decisions={data} />;
}

export default page;

