import { NavLink, Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { caseList, getCase, DEFAULT_CASE } from '@/lib/data';

export default function Layout() {
  const { caseSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const current = getCase(caseSlug ?? DEFAULT_CASE);
  const isMethodology = location.pathname.startsWith('/methodology');

  const nav = [
    { to: `/${current.slug}`, label: 'ダッシュボード', end: true },
    { to: `/${current.slug}/wbs`, label: 'WBS' },
    { to: `/${current.slug}/schedule`, label: 'スケジュール' },
    { to: `/${current.slug}/issues`, label: '課題' },
    { to: `/${current.slug}/risks`, label: 'リスク' },
    { to: `/${current.slug}/decisions`, label: '意思決定' },
    { to: `/${current.slug}/meetings`, label: '議事録' },
    { to: `/${current.slug}/reports`, label: '報告書' },
    { to: `/${current.slug}/charter`, label: '憲章/コンテキスト' },
    { to: '/methodology', label: 'Methodology' },
  ];

  const onCaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSlug = e.target.value;
    // 現在 sub-page にいる場合、できれば同じ sub-page に遷移
    if (isMethodology) {
      navigate(`/${newSlug}`);
      return;
    }
    const segments = location.pathname.split('/').filter(Boolean);
    const subPath = segments.length > 1 ? segments.slice(1).join('/') : '';
    navigate(subPath ? `/${newSlug}/${subPath}` : `/${newSlug}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-brand-600 text-white grid place-items-center font-bold text-sm">
              AI
            </div>
            <div>
              <div className="text-sm text-slate-500 leading-tight">AI PMO ビューワー</div>
              <div className="font-semibold leading-tight">
                {current.project.name}
                {current.project.fullName ? ` — ${current.project.fullName}` : ''}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end text-xs text-slate-500">
              <div>クライアント: <span className="text-slate-800 font-medium">{current.project.client}</span></div>
              <div>ベンダー: <span className="text-slate-800 font-medium">{current.project.vendor}</span></div>
              {current.project.referenceDate && (
                <div>基準日: <span className="text-slate-800 font-medium">{current.project.referenceDate}</span></div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <label htmlFor="case-select" className="text-slate-500 text-xs">ケース:</label>
              <select
                id="case-select"
                value={isMethodology ? '' : current.slug}
                onChange={onCaseChange}
                className="border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-sm min-w-[180px]"
              >
                {isMethodology && <option value="">(Methodology)</option>}
                {caseList.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.slug === 'medium' ? '★ ' : ''}{c.displayName} ({c.slug})
                  </option>
                ))}
              </select>
            </div>
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
        <div className="max-w-7xl mx-auto px-6 py-4 text-xs text-slate-500 flex justify-between flex-wrap gap-2">
          <div>
            AI PMO ビューワー · {caseList.length} ケース読み込み済 · データソース:{' '}
            <code className="text-slate-700">case-studies/{current.slug}/client-env/</code>
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
