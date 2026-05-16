import { Link } from 'react-router-dom';
import { meetings } from '@/lib/data';

export default function Meetings() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">議事録</h1>
        <p className="text-sm text-slate-500">scribe-agent が会議終了 1 時間以内に生成 · 立花サブPM レビュー</p>
      </div>
      <div className="card divide-y divide-slate-100">
        {meetings.map((m) => (
          <Link
            key={m.slug}
            to={`/meetings/${m.slug}`}
            className="block hover:bg-slate-50 px-5 py-4 transition-colors"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-mono text-brand-700">{m.date}</div>
                <div className="font-medium mt-1 truncate">{m.title}</div>
              </div>
              <span className="text-slate-400">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
