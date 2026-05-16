import { useState } from 'react';
import { charter, contexts } from '@/lib/data';
import { Markdown } from '@/lib/markdown';

type Tab = 'charter' | 'stakeholders' | 'glossary';

export default function Charter() {
  const [tab, setTab] = useState<Tab>('charter');
  const charterDoc = charter[0];
  const stakeholdersDoc = contexts.find((d) => d.slug === 'stakeholders');
  const glossaryDoc = contexts.find((d) => d.slug === 'glossary');

  const current =
    tab === 'charter' ? charterDoc : tab === 'stakeholders' ? stakeholdersDoc : glossaryDoc;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">プロジェクト憲章 / コンテキスト</h1>
        <p className="text-sm text-slate-500">人間が作成・管理。AI PMO は読み込みコンテキストとして利用</p>
      </div>
      <div className="inline-flex rounded-lg border border-slate-200 bg-white overflow-hidden">
        {(
          [
            ['charter', 'プロジェクト憲章'],
            ['stakeholders', 'ステークホルダー'],
            ['glossary', '用語集'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            className={`px-4 py-1.5 text-sm ${tab === k ? 'bg-brand-600 text-white' : 'text-slate-700'}`}
            onClick={() => setTab(k)}
          >
            {label}
          </button>
        ))}
      </div>
      {current ? (
        <div className="card p-6">
          <Markdown source={current.body} />
        </div>
      ) : (
        <div className="card p-5 text-slate-500">未登録</div>
      )}
    </div>
  );
}
