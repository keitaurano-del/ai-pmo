import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCase } from '@/lib/data';
import { Markdown } from '@/lib/markdown';
import { EmptyState } from '@/components/EmptyState';
import { exportRisks } from '@/lib/exporters';

export default function Risks() {
  const { caseSlug } = useParams();
  const c = getCase(caseSlug);
  const { risks, riskDocs } = c;

  const [showFull, setShowFull] = useState(false);
  const fullDoc = riskDocs[0];

  if (!risks && !fullDoc) {
    return (
      <EmptyState
        title="リスクデータなし"
        description="このケースにはリスクデータが取り込まれていません。"
        hint="watcher-agent が議事録 / Slack から予兆検知、または risk-register.md に直接記入してください。"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">リスク台帳</h1>
          <p className="text-sm text-slate-500">
            watcher-agent が予兆検知 · PMO 担当が週次レビュー · 室長が週次承認
          </p>
        </div>
        <div className="flex items-center gap-3 no-print">
          {risks && (
            <button
              onClick={() => exportRisks(c)}
              className="text-sm px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50"
            >
              📊 Excel
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          >
            🖨 印刷/PDF
          </button>
        </div>
      </div>

      {risks && (
        <div className="grid md:grid-cols-2 gap-4">
          {risks.map((r) => (
            <div
              key={r.id}
              className={`card p-5 border-l-4 ${
                r.tone === 'red' ? 'border-l-rose-500' : 'border-l-amber-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge ${r.tone === 'red' ? 'badge-red' : 'badge-amber'}`}>
                  {r.score}
                </span>
                <span className="font-mono text-xs text-slate-500">{r.id}</span>
                <span className="ml-auto text-xs text-slate-500">P:{r.p} / I:{r.i}</span>
              </div>
              <div className="font-semibold">{r.title}</div>
              <dl className="mt-3 text-sm space-y-2">
                <div>
                  <dt className="text-xs font-semibold text-slate-500">トリガー</dt>
                  <dd className="text-slate-700">{r.trigger}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-500">対応策</dt>
                  <dd className="text-slate-700">{r.countermeasure}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-500">エスカレーション先</dt>
                  <dd className="text-slate-700">{r.escalation}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}

      {fullDoc && (
        <div className="card p-5">
          <button
            className="text-sm text-brand-600 hover:underline"
            onClick={() => setShowFull((v) => !v)}
          >
            {showFull ? '▾' : '▸'} リスク台帳全文を表示（軽度監視・クローズ済・予兆ログ含む）
          </button>
          {showFull && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <Markdown source={fullDoc.body} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
