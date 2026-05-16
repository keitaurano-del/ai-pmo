import { useParams } from 'react-router-dom';
import { getCase } from '@/lib/data';
import { Markdown } from '@/lib/markdown';
import { EmptyState } from '@/components/EmptyState';

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    done: 'bg-emerald-500',
    at_risk: 'bg-amber-500',
    planned: 'bg-slate-300',
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${map[status] ?? 'bg-slate-300'}`} />;
}

export default function Schedule() {
  const { caseSlug } = useParams();
  const c = getCase(caseSlug);
  const { schedule, milestones } = c;
  const doc = schedule[0];

  if (!doc && !milestones) {
    return (
      <EmptyState
        title="スケジュール未生成"
        description="このケースのマスタースケジュールはまだ生成されていません。"
        hint="reporter-agent が WBS から週次再生成します。"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">マスタースケジュール</h1>
        <p className="text-sm text-slate-500">reporter-agent が週次更新</p>
      </div>

      {milestones && (
        <div className="card p-5">
          <h2 className="font-semibold mb-4">マイルストーン一覧</h2>
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
        </div>
      )}

      {doc && (
        <div className="card p-6">
          <Markdown source={doc.body} />
        </div>
      )}
    </div>
  );
}
