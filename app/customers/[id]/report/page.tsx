import NavBar from "@/app/components/NavBar";
import ReportView from "@/app/components/ReportView";
import { getCustomerById, MOCK_CUSTOMERS } from "@/app/lib/mockCustomers";

export function generateStaticParams() {
  return MOCK_CUSTOMERS.map((c) => ({ id: c.id }));
}

export default async function CustomerReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mock = getCustomerById(id) ?? null;

  return (
    <div className="report-root flex min-h-full flex-col bg-slate-50">
      <div className="no-print">
        <NavBar />
      </div>
      <main className="flex-1">
        <ReportView id={id} initialCustomer={mock} />
      </main>
    </div>
  );
}
