import type { Metadata } from "next";
import NavBar from "@/app/components/NavBar";
import Footer from "@/app/components/Footer";
import DiagnosisSection from "@/app/components/DiagnosisSection";

export const metadata: Metadata = {
  title: "AI 정책자금 진단 — Policy Funding OS",
  description:
    "DB가 들어온 순간, 이 업체를 어떤 기관으로 안내하고 어떤 말로 상담해야 할지 바로 확인하세요.",
};

export default async function DiagnosisPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const autoSample = params.sample === "1";

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <NavBar />

      <main className="flex-1">
        <section className="w-full px-6 pt-14 pb-8 sm:pt-20">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
              AI 진단
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              AI 정책자금 진단
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              DB가 들어온 순간, 이 업체를 어떤 기관으로 안내하고 어떤 말로 상담해야
              할지 바로 확인하세요.
            </p>
          </div>
        </section>

        <section className="w-full px-6 pb-20 sm:pb-28">
          <DiagnosisSection autoSample={autoSample} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
