import NavBar from "@/app/components/NavBar";
import Footer from "@/app/components/Footer";
import CustomerDetailView from "@/app/components/CustomerDetailView";
import { getCustomerById, MOCK_CUSTOMERS } from "@/app/lib/mockCustomers";

// Mock 고객 id 는 미리 정적 생성. localStorage 저장 고객은 요청 시 렌더되어
// 클라이언트에서 조회된다(dynamicParams 기본 허용).
export function generateStaticParams() {
  return MOCK_CUSTOMERS.map((c) => ({ id: c.id }));
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mock = getCustomerById(id) ?? null;

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <NavBar />
      <main className="flex-1">
        <CustomerDetailView id={id} initialCustomer={mock} />
      </main>
      <Footer />
    </div>
  );
}
