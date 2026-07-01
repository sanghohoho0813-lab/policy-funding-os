import Link from "next/link";

// 공통 상단 네비게이션 (앱 전역에서 재사용).
export default function NavBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          title="랜딩으로 돌아가기"
          className="flex items-center gap-2 font-semibold"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            PF
          </span>
          <span className="text-lg">Policy Funding OS</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/diagnosis"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-700"
          >
            진단하기
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-700"
          >
            고객관리
          </Link>
          <Link
            href="/diagnosis"
            className="ml-1 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            무료 체험 시작
          </Link>
        </nav>
      </div>
    </header>
  );
}
