// 공통 푸터 (앱 전역에서 재사용).
export default function Footer() {
  return (
    <footer className="border-t border-slate-100 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-slate-500 sm:flex-row">
        <div className="flex items-center gap-2 font-semibold text-slate-700">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
            PF
          </span>
          Policy Funding OS
        </div>
        <p>© 2026 Policy Funding OS. All rights reserved.</p>
      </div>
    </footer>
  );
}
