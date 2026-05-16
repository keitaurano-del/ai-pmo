import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCase } from '@/lib/data';
import { Markdown } from '@/lib/markdown';
import { EmptyState } from '@/components/EmptyState';
import { exportIssues } from '@/lib/exporters';

function priorityBadge(p: string) {
  if (p === 'High') return <span className="badge badge-red">High</span>;
  if (p === 'Mid') return <span className="badge badge-amber">Mid</span>;
  if (p === 'Low') return <span className="badge badge-emerald">Low</span>;
  return <span className="badge badge-slate">{p}</span>;
}

function statusBadge(s: string) {
  if (s === 'Closed') return <span className="badge badge-slate">Closed</span>;
  if (s === 'InProgress') return <span className="badge badge-blue">In Progress</span>;
  return <span className="badge badge-amber">Open</span>;
}

export default function Issues() {
  const { caseSlug } = useParams();
  const c = getCase(caseSlug);
  const { issues, issueDocs } = c;

  const [showClosed, setShowClosed] = useState(false);
  const [priority, setPriority] = useState<'all' | 'High' | 'Mid' | 'Low'>('all');
  const [category, setCategory] = useState<string>('all');
  const [showDetail, setShowDetail] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(issues.map((i) => i.category))).sort(),
    [issues],
  );

  const filtered = issues
    .filter((i) => (showClosed ? true : i.status !== 'Closed'))
    .filter((i) => (priority === 'all' ? true : i.priority === priority))
    .filter((i) => (category === 'all' ? true : i.category === category))
    .sort((a, b) => {
      const order: Record<string, number> = { High: 0, Mid: 1, Low: 2 };
      const ap = order[a.priority] ?? 3;
      const bp = order[b.priority] ?? 3;
      if (ap !== bp) return ap - bp;
      return (a.due_date ?? '').localeCompare(b.due_date ?? '');
    });

  const stats = useMemo(() => {
    const open = issues.filter((i) => i.status !== 'Closed');
    return {
      total: issues.length,
      open: open.length,
      high: open.filter((i) => i.priority === 'High').length,
      mid: open.filter((i) => i.priority === 'Mid').length,
      low: open.filter((i) => i.priority === 'Low').length,
      closed: issues.length - open.length,
    };
  }, [issues]);

  const detailDoc = issueDocs[0];

  if (issues.length === 0) {
    return (
      <EmptyState
        title="課題データなし"
        description="このケースには課題データが取り込まれていません。"
        hint="watcher-agent が Backlog / 議事録から自動起票するか、issues.csv に直接記入してください。"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">課題管理表</h1>
          <p className="text-sm text-slate-500">
            watcher-agent + triager-agent が日次更新 · Total {stats.total}（Open {stats.open} / Closed {stats.closed}）
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap no-print">
          <button
            onClick={() => exportIssues(c)}
            className="text-sm px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50"
            title="Excel に書き出し"
          >
            📊 Excel
          </button>
          <button
            onClick={() => window.print()}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            title="ブラウザの印刷機能で PDF 保存"
          >
            🖨 印刷/PDF
          </button>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />
            Closed を含める
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as typeof priority)}
            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
          >
            <option value="all">全優先度</option>
            <option value="High">High</option>
            <option value="Mid">Mid</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
          >
            <option value="all">全カテゴリ</option>
            {categories.map((c2) => (
              <option key={c2} value={c2}>
                {c2}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="text-xs text-slate-500">Open 全体</div>
          <div className="text-2xl font-bold">{stats.open}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-500">High</div>
          <div className="text-2xl font-bold text-rose-600">{stats.high}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-500">Mid</div>
          <div className="text-2xl font-bold text-amber-600">{stats.mid}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-500">Low</div>
          <div className="text-2xl font-bold text-emerald-600">{stats.low}</div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">ID</th>
              <th className="text-left px-3 py-2 font-semibold">優先度</th>
              <th className="text-left px-3 py-2 font-semibold">状態</th>
              <th className="text-left px-3 py-2 font-semibold">カテゴリ</th>
              <th className="text-left px-3 py-2 font-semibold">タイトル</th>
              <th className="text-left px-3 py-2 font-semibold">担当</th>
              <th className="text-left px-3 py-2 font-semibold">起票日</th>
              <th className="text-left px-3 py-2 font-semibold">期限</th>
              <th className="text-left px-3 py-2 font-semibold">WBS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.issue_id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2 font-mono text-xs">{i.issue_id}</td>
                <td className="px-3 py-2">{priorityBadge(i.priority)}</td>
                <td className="px-3 py-2">{statusBadge(i.status)}</td>
                <td className="px-3 py-2 text-xs text-slate-600">{i.category}</td>
                <td className="px-3 py-2">{i.title}</td>
                <td className="px-3 py-2 text-xs text-slate-600">{i.owner}</td>
                <td className="px-3 py-2 font-mono text-xs text-slate-600">{i.opened_date}</td>
                <td className="px-3 py-2 font-mono text-xs text-slate-600">{i.due_date}</td>
                <td className="px-3 py-2 font-mono text-xs text-slate-500">{i.wbs_id || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detailDoc && (
        <div className="card p-5">
          <button
            className="text-sm text-brand-600 hover:underline"
            onClick={() => setShowDetail((v) => !v)}
          >
            {showDetail ? '▾' : '▸'} High 課題の詳細・背景を読む（issue-tracker.md）
          </button>
          {showDetail && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <Markdown source={detailDoc.body} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
