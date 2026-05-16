import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCase, WbsRow } from '@/lib/data';
import { EmptyState } from '@/components/EmptyState';
import { exportWbs } from '@/lib/exporters';

type ViewMode = 'tree' | 'table';

function statusBadge(status: string) {
  const map: Record<string, string> = {
    done: 'badge-emerald',
    in_progress: 'badge-blue',
    at_risk: 'badge-amber',
    not_started: 'badge-slate',
  };
  const label: Record<string, string> = {
    done: '完了',
    in_progress: '進行中',
    at_risk: '遅延注意',
    not_started: '未着手',
  };
  return <span className={`badge ${map[status] ?? 'badge-slate'}`}>{label[status] ?? status}</span>;
}

function ProgressBar({ pct, status }: { pct: number; status: string }) {
  const color =
    status === 'at_risk'
      ? 'bg-amber-500'
      : status === 'done'
        ? 'bg-emerald-500'
        : 'bg-brand-500';
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function TreeNode({ row }: { row: WbsRow }) {
  const [open, setOpen] = useState(row.depth < 2);
  const has = row.children.length > 0;
  return (
    <li>
      <div
        className="flex items-center gap-3 py-2 border-b border-slate-100 hover:bg-slate-50 px-2 rounded"
        style={{ paddingLeft: `${row.depth * 16 + 8}px` }}
      >
        <button
          className={`text-xs w-4 ${has ? 'text-slate-500' : 'text-transparent'}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="toggle"
        >
          {has ? (open ? '▾' : '▸') : '·'}
        </button>
        <span className="font-mono text-xs text-slate-500 w-12">{row.wbs_id}</span>
        <span className="font-medium flex-1 min-w-0 truncate">{row.name}</span>
        <span className="text-xs text-slate-500 hidden md:inline w-24 truncate">{row.owner}</span>
        <span className="text-xs text-slate-500 hidden md:inline w-24 font-mono">{row.planned_end}</span>
        <div className="w-24 hidden lg:flex items-center gap-2">
          <ProgressBar pct={row.progress_pct} status={row.status} />
          <span className="text-xs text-slate-500 w-8 text-right">{row.progress_pct}%</span>
        </div>
        <div className="w-20 text-right">{statusBadge(row.status)}</div>
      </div>
      {has && open && (
        <ul>
          {row.children.map((c) => (
            <TreeNode key={c.wbs_id} row={c} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function WBS() {
  const { caseSlug } = useParams();
  const c = getCase(caseSlug);
  const { wbsTree, wbsFlat } = c;

  const [mode, setMode] = useState<ViewMode>('tree');
  const [filter, setFilter] = useState<string>('all');

  if (wbsFlat.length === 0) {
    return (
      <EmptyState
        title="WBS データなし"
        description="このケースには WBS データが取り込まれていません。"
        hint="reporter-agent が Backlog から定期同期するか、wbs.csv に直接記入してください。"
      />
    );
  }

  const filtered = wbsFlat.filter((r) => (filter === 'all' ? true : r.status === filter));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">WBS</h1>
          <p className="text-sm text-slate-500">全 {wbsFlat.length} 行 · reporter-agent が週次更新</p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <button
            onClick={() => exportWbs(c)}
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
          <div className="inline-flex rounded-lg border border-slate-200 bg-white overflow-hidden">
            <button
              className={`px-3 py-1.5 text-sm ${mode === 'tree' ? 'bg-brand-600 text-white' : 'text-slate-700'}`}
              onClick={() => setMode('tree')}
            >
              ツリー
            </button>
            <button
              className={`px-3 py-1.5 text-sm ${mode === 'table' ? 'bg-brand-600 text-white' : 'text-slate-700'}`}
              onClick={() => setMode('table')}
            >
              テーブル
            </button>
          </div>
          {mode === 'table' && (
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
            >
              <option value="all">全ステータス</option>
              <option value="in_progress">進行中</option>
              <option value="at_risk">遅延注意</option>
              <option value="done">完了</option>
              <option value="not_started">未着手</option>
            </select>
          )}
        </div>
      </div>

      {mode === 'tree' ? (
        <div className="card p-3">
          <div className="flex items-center gap-3 py-2 px-2 text-xs text-slate-500 font-semibold border-b border-slate-200">
            <span className="w-4" />
            <span className="w-12">ID</span>
            <span className="flex-1">タスク名</span>
            <span className="w-24 hidden md:inline">担当</span>
            <span className="w-24 hidden md:inline">計画終了</span>
            <span className="w-24 hidden lg:inline">進捗</span>
            <span className="w-20 text-right">状態</span>
          </div>
          <ul>
            {wbsTree.map((r) => (
              <TreeNode key={r.wbs_id} row={r} />
            ))}
          </ul>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">ID</th>
                <th className="text-left px-3 py-2 font-semibold">タスク名</th>
                <th className="text-left px-3 py-2 font-semibold">担当</th>
                <th className="text-left px-3 py-2 font-semibold">計画開始</th>
                <th className="text-left px-3 py-2 font-semibold">計画終了</th>
                <th className="text-left px-3 py-2 font-semibold">進捗</th>
                <th className="text-left px-3 py-2 font-semibold">状態</th>
                <th className="text-left px-3 py-2 font-semibold">Backlog</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.wbs_id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono text-xs">{r.wbs_id}</td>
                  <td className="px-3 py-2" style={{ paddingLeft: `${r.depth * 12 + 12}px` }}>
                    {r.name}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{r.owner}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-600">{r.planned_start}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-600">{r.planned_end}</td>
                  <td className="px-3 py-2 w-32">
                    <div className="flex items-center gap-2">
                      <ProgressBar pct={r.progress_pct} status={r.status} />
                      <span className="text-xs text-slate-500 w-8 text-right">{r.progress_pct}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">{statusBadge(r.status)}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-500">{r.backlog_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
