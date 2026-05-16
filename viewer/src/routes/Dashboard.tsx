import { Link } from 'react-router-dom';
import { project, kpis, milestones, issues, risks, meetings, reports } from '@/lib/data';

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    done: 'bg-emerald-500',
    at_risk: 'bg-amber-500',
    planned: 'bg-slate-300',
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${map[status] ?? 'bg-slate-300'}`} />;
}

export default function Dashboard() {
  const highIssues = issues.filter((i) => i.priority === 'High' && i.status !== 'Closed');
  const openIssues = issues.filter((i) => i.status !== 'Closed');
  const latestMeeting = meetings[0];
  const latestReport = reports[0];

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wide text-brand-700 font-semibold">プロジェクト概要</div>
            <h1 className="text-2xl font-bold mt-1">{project.name} — {project.fullName}</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-3xl">
              中堅 SIer {project.vendor} が、{project.client} 向けの基幹システム刷新案件を遂行中。
              本 PJ を AI PMO PoC（{project.pocStart} 〜 {project.pocEnd}）の対象としており、
              本ビューワーは 4 体の AI PMO エージェントが運用する成果物を可視化する。
            </p>
          </div>
          <div className="text-sm text-right space-y-0.5">
            <div><span className="text-slate-500">PM:</span> <span className="font-medium">{project.pm}</span></div>
            <div><span className="text-slate-500">PMO 室長:</span> <span className="font-medium">{project.pmoLead}</span></div>
            <div><span className="text-slate-500">PMO 担当:</span> <span className="font-medium">{project.pmoOps}</span></div>
            <div><span className="text-slate-500">契約金額:</span> <span className="font-medium">{project.contractValue}</span></div>
            <div><span className="text-slate-500">カットオーバー:</span> <span className="font-medium">{project.cutover}</span></div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">KPI スナップショット (基準日 {project.referenceDate})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((k) => (
            <div key={k.label} className="card p-4">
              <div className="text-xs text-slate-500 leading-tight">{k.label}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="text-2xl font-bold">{k.value}</div>
                <div className={`text-xs font-medium ${k.tone === 'good' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {k.delta}
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-1">{k.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">マイルストーン</h2>
            <Link to="/schedule" className="text-xs text-brand-600 hover:underline">スケジュール詳細 →</Link>
          </div>
          <ul className="space-y-2">
            {milestones.map((m) => (
              <li key={m.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <StatusDot status={m.status} />
                  <span className="text-slate-500 font-mono w-8">{m.id}</span>
                  <span className="font-medium">{m.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-mono text-xs">{m.date}</span>
                  <span
                    className={`badge ${
                      m.status === 'done'
                        ? 'badge-emerald'
                        : m.status === 'at_risk'
                          ? 'badge-amber'
                          : 'badge-slate'
                    }`}
                  >
                    {m.status === 'done' ? '完了' : m.status === 'at_risk' ? '要注意' : '計画中'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">High 課題 ({highIssues.length})</h2>
            <Link to="/issues" className="text-xs text-brand-600 hover:underline">全{openIssues.length}件 →</Link>
          </div>
          <ul className="space-y-3">
            {highIssues.map((i) => (
              <li key={i.issue_id} className="border-l-4 border-rose-500 pl-3">
                <div className="flex items-center gap-2">
                  <span className="badge badge-red">{i.priority}</span>
                  <span className="text-xs font-mono text-slate-500">{i.issue_id}</span>
                </div>
                <div className="text-sm font-medium mt-1">{i.title}</div>
                <div className="text-xs text-slate-500 mt-1">
                  期限 {i.due_date} · 担当 {i.owner}
                </div>
              </li>
            ))}
            {highIssues.length === 0 && (
              <li className="text-sm text-slate-500">現在 High 課題はなし</li>
            )}
          </ul>
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">重点監視リスク</h2>
            <Link to="/risks" className="text-xs text-brand-600 hover:underline">全リスク →</Link>
          </div>
          <ul className="space-y-3">
            {risks.slice(0, 3).map((r) => (
              <li key={r.id} className="text-sm">
                <div className="flex items-center gap-2">
                  <span className={`badge ${r.tone === 'red' ? 'badge-red' : 'badge-amber'}`}>{r.score}</span>
                  <span className="text-xs font-mono text-slate-500">{r.id}</span>
                </div>
                <div className="font-medium mt-1">{r.title}</div>
                <div className="text-xs text-slate-500 mt-1">対応: {r.countermeasure}</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold mb-3">最新ドキュメント</h2>
          <div className="space-y-3">
            {latestReport && (
              <Link to={`/reports/${latestReport.slug}`} className="block hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg">
                <div className="text-xs text-brand-700 font-semibold">最新 報告書 · {latestReport.date}</div>
                <div className="text-sm font-medium mt-0.5">{latestReport.title}</div>
              </Link>
            )}
            {latestMeeting && (
              <Link to={`/meetings/${latestMeeting.slug}`} className="block hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg">
                <div className="text-xs text-brand-700 font-semibold">最新 議事録 · {latestMeeting.date}</div>
                <div className="text-sm font-medium mt-0.5">{latestMeeting.title}</div>
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
