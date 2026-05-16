import { Link, useParams } from 'react-router-dom';
import { getCase } from '@/lib/data';
import { EmptyState } from '@/components/EmptyState';

export default function Reports() {
  const { caseSlug } = useParams();
  const c = getCase(caseSlug);
  const { reports } = c;

  if (reports.length === 0) {
    return (
      <EmptyState
        title="報告書なし"
        description="このケースの報告書はまだ生成されていません。"
        hint="reporter-agent が週次（月曜）/ 月次（月初）に自動生成します。"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">報告書</h1>
        <p className="text-sm text-slate-500">reporter-agent が週次（月曜）・月次（月初）に生成 · PMO → PM 承認</p>
      </div>
      <div className="card divide-y divide-slate-100">
        {reports.map((r) => (
          <Link
            key={r.slug}
            to={`/${c.slug}/reports/${r.slug}`}
            className="block hover:bg-slate-50 px-5 py-4 transition-colors"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-mono text-brand-700">{r.date}</div>
                <div className="font-medium mt-1 truncate">{r.title}</div>
              </div>
              <span className="text-slate-400">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
