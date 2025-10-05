import React from "react";
import DailyFocusPage from "../../../_components/DailyFocus";
import { getRecentFocus } from "@/actions";

async function page() {
  const { data, error } = await getRecentFocus();

  return <DailyFocusPage recentFocus={data} />;
}

export default page;
