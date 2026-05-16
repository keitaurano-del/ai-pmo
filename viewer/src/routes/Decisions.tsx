import { decisionDocs } from '@/lib/data';
import { Markdown } from '@/lib/markdown';

export default function Decisions() {
  const doc = decisionDocs[0];
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">意思決定ログ</h1>
        <p className="text-sm text-slate-500">scribe-agent + triager-agent が議事録・Slack から抽出 · 人間が承認</p>
      </div>
      {doc && (
        <div className="card p-6">
          <Markdown source={doc.body} />
        </div>
      )}
    </div>
  );
}
