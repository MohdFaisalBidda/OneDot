import { DashboardServer } from "./dashboard-server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Clarity Log",
  description: "Your personal dashboard with insights and analytics",
};

export default function DashboardPage() {
  return <DashboardServer />;
}
