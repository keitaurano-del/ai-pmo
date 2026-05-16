import { NavLink, Outlet } from 'react-router-dom';
import { project } from '@/lib/data';

const nav = [
  { to: '/', label: 'ダッシュボード', end: true },
  { to: '/wbs', label: 'WBS' },
  { to: '/schedule', label: 'スケジュール' },
  { to: '/issues', label: '課題' },
  { to: '/risks', label: 'リスク' },
  { to: '/decisions', label: '意思決定' },
  { to: '/meetings', label: '議事録' },
  { to: '/reports', label: '報告書' },
  { to: '/charter', label: '憲章/コンテキスト' },
  { to: '/methodology', label: 'Methodology' },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-brand-600 text-white grid place-items-center font-bold text-sm">
              AI
            </div>
            <div>
              <div className="text-sm text-slate-500 leading-tight">AI PMO ビューワー（中規模ケース）</div>
              <div className="font-semibold leading-tight">
                {project.name} — {project.fullName}
              </div>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end text-xs text-slate-500">
            <div>クライアント: <span className="text-slate-800 font-medium">{project.client}</span></div>
            <div>ベンダー: <span className="text-slate-800 font-medium">{project.vendor}</span></div>
            <div>基準日: <span className="text-slate-800 font-medium">{project.referenceDate}</span></div>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `whitespace-nowrap text-sm font-medium py-3 px-3 border-b-2 -mb-px transition-colors ${
                  isActive
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 text-xs text-slate-500 flex justify-between">
          <div>
            AI PMO PoC ビューワー · 仮想クライアント環境 · データソース:{' '}
            <code className="text-slate-700">case-studies/medium/client-env/</code>
          </div>
          <div>
            <a className="text-brand-600 hover:underline" href="https://github.com/keitaurano-del/ai-pmo" target="_blank" rel="noreferrer">
              GitHub: ai-pmo
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
