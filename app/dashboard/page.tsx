import type { Metadata } from "next";
import NavBar from "@/app/components/NavBar";
import Footer from "@/app/components/Footer";
import DashboardView from "@/app/components/DashboardView";

export const metadata: Metadata = {
  title: "고객 관리 — Policy Funding OS",
  description: "관리 중인 정책자금 고객을 한눈에 확인하세요.",
};

export default function DashboardPage() {
  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <NavBar />
      <main className="flex-1">
        <DashboardView />
      </main>
      <Footer />
    </div>
  );
}
