import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCase } from '@/lib/data';
import { Markdown } from '@/lib/markdown';
import { EmptyState } from '@/components/EmptyState';

type Tab = 'charter' | 'stakeholders' | 'glossary' | 'integrations';

export default function Charter() {
  const { caseSlug } = useParams();
  const c = getCase(caseSlug);
  const [tab, setTab] = useState<Tab>('charter');
  const charterDoc = c.charter[0];
  const stakeholdersDoc = c.contexts.find((d) => d.slug === 'stakeholders');
  const glossaryDoc = c.contexts.find((d) => d.slug === 'glossary');
  const integrationsDoc = c.contexts.find((d) => d.slug === 'integrations');

  const current =
    tab === 'charter'
      ? charterDoc
      : tab === 'stakeholders'
        ? stakeholdersDoc
        : tab === 'glossary'
          ? glossaryDoc
          : integrationsDoc;

  if (!charterDoc && !stakeholdersDoc && !glossaryDoc && !integrationsDoc) {
    return (
      <EmptyState
        title="憲章・コンテキストなし"
        description="このケースのプロジェクト憲章・コンテキストはまだ作成されていません。"
        hint="01-charter/ と 00-context/ 配下に Markdown を追加してください。"
      />
    );
  }

  const tabs: Array<{ key: Tab; label: string; disabled: boolean }> = [
    { key: 'charter', label: 'プロジェクト憲章', disabled: !charterDoc },
    { key: 'stakeholders', label: 'ステークホルダー', disabled: !stakeholdersDoc },
    { key: 'glossary', label: '用語集', disabled: !glossaryDoc },
    { key: 'integrations', label: 'データ統合', disabled: !integrationsDoc },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">プロジェクト憲章 / コンテキスト</h1>
        <p className="text-sm text-slate-500">人間が作成・管理。AI PMO は読み込みコンテキストとして利用</p>
      </div>
      <div className="inline-flex rounded-lg border border-slate-200 bg-white overflow-hidden">
        {tabs.map((t) => (
          <button
            key={t.key}
            disabled={t.disabled}
            className={`px-4 py-1.5 text-sm ${
              tab === t.key
                ? 'bg-brand-600 text-white'
                : t.disabled
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-700'
            }`}
            onClick={() => !t.disabled && setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {current ? (
        <div className="card p-6">
          <Markdown source={current.body} />
        </div>
      ) : (
        <div className="card p-5 text-slate-500">このタブのドキュメントは未登録</div>
      )}
    </div>
  );
}
