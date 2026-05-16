import { useParams } from 'react-router-dom';
import { getCase } from '@/lib/data';
import { Markdown } from '@/lib/markdown';
import { EmptyState } from '@/components/EmptyState';

export default function Decisions() {
  const { caseSlug } = useParams();
  const c = getCase(caseSlug);
  const doc = c.decisionDocs[0];

  if (!doc) {
    return (
      <EmptyState
        title="意思決定ログなし"
        description="このケースの意思決定はまだ記録されていません。"
        hint="scribe-agent + triager-agent が議事録 / Slack から抽出します。"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">意思決定ログ</h1>
        <p className="text-sm text-slate-500">scribe-agent + triager-agent が議事録・Slack から抽出 · 人間が承認</p>
      </div>
      <div className="card p-6">
        <Markdown source={doc.body} />
      </div>
    </div>
  );
}
