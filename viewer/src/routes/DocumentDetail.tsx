import { Link, useParams } from 'react-router-dom';
import { getCase } from '@/lib/data';
import { Markdown } from '@/lib/markdown';

interface Props {
  kind: 'meeting' | 'report';
}

export default function DocumentDetail({ kind }: Props) {
  const { slug, caseSlug } = useParams();
  const c = getCase(caseSlug);
  const list = kind === 'meeting' ? c.meetings : c.reports;
  const doc = list.find((d) => d.slug === slug);
  const backTo = kind === 'meeting' ? `/${c.slug}/meetings` : `/${c.slug}/reports`;
  const backLabel = kind === 'meeting' ? '議事録一覧へ' : '報告書一覧へ';

  if (!doc) {
    return (
      <div className="card p-5">
        <p>ドキュメントが見つかりませんでした。</p>
        <Link to={backTo} className="text-brand-600 hover:underline">
          ← {backLabel}
        </Link>
      </div>
    );
  }

  return (
    <article className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs text-slate-500">
          {doc.date && <span className="font-mono text-brand-700 mr-2">{doc.date}</span>}
          <code className="text-slate-500">{doc.filename}</code>
        </div>
        <div className="flex items-center gap-3 no-print">
          <button
            onClick={() => window.print()}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            title="PDF として保存"
          >
            🖨 印刷/PDF
          </button>
          <Link to={backTo} className="text-sm text-brand-600 hover:underline">
            ← {backLabel}
          </Link>
        </div>
      </div>
      <div className="card p-6">
        <Markdown source={doc.body} />
      </div>
    </article>
  );
}
