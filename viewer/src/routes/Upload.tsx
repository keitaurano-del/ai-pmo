import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCase } from '@/lib/data';
import { apiAvailable, uploadFiles, UploadResult } from '@/lib/api';

export default function Upload() {
  const { caseSlug } = useParams();
  const c = getCase(caseSlug);
  const [files, setFiles] = useState<File[]>([]);
  const [dryRun, setDryRun] = useState(true);
  const [force, setForce] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!apiAvailable) {
    return (
      <div className="card p-6 border-amber-300 bg-amber-50">
        <h1 className="text-lg font-bold text-amber-900">アップロード機能はサーバー連携モード専用</h1>
        <p className="text-sm text-amber-800 mt-2">
          現在の viewer は <strong>静的サイト（read-only）</strong> として動作中。
          アップロード機能を有効化するには、別途バックエンド API（<code>api/</code>）を起動し、
          viewer の環境変数 <code>VITE_API_URL=http://localhost:3001</code> を設定してください。
        </p>
        <pre className="bg-white border border-amber-200 rounded p-3 mt-3 text-xs overflow-x-auto">
{`# Terminal 1
cd api && npm install && npm run dev

# Terminal 2 (viewer)
VITE_API_URL=http://localhost:3001 npm run dev`}
        </pre>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;
    setBusy(true);
    setErr(null);
    setResult(null);
    try {
      const r = await uploadFiles(c.slug, files, { dryRun, force });
      setResult(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">資料アップロード → intake-agent</h1>
        <p className="text-sm text-slate-500">
          クライアント支給資料（PDF / Markdown / テキスト）をアップロードすると、AI PMO が client-env 配下の
          憲章 / WBS / ステークホルダー / リスク / 用語集 を一括生成します。
        </p>
      </div>

      <form onSubmit={onSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">
            ファイル選択（PDF / .md / .txt、複数可、最大 30MB/ファイル）
          </label>
          <input
            type="file"
            multiple
            accept=".pdf,.md,.txt"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="block w-full text-sm border border-slate-300 rounded-lg p-2 bg-white"
          />
          {files.length > 0 && (
            <ul className="mt-3 text-sm text-slate-600 space-y-1">
              {files.map((f) => (
                <li key={f.name}>
                  📄 {f.name} <span className="text-slate-400">({(f.size / 1024).toFixed(1)} KB)</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
            <span>dry-run（API キー不要、出力プレビューのみ）</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} />
            <span>force（既存ファイル上書き）</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={busy || files.length === 0}
          className="px-5 py-2 rounded-lg bg-brand-600 text-white font-medium disabled:bg-brand-300 hover:bg-brand-700"
        >
          {busy ? '⏳ 処理中…' : `🚀 intake-agent 実行（${dryRun ? 'dry-run' : '本実行'}）`}
        </button>
      </form>

      {err && (
        <div className="card p-4 bg-rose-50 border-rose-200 text-rose-800">
          ❌ エラー: {err}
        </div>
      )}

      {result && (
        <div className={`card p-5 ${result.ok ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}>
          <h2 className="font-semibold mb-2">
            {result.ok ? '✅ 実行成功' : '⚠️ 実行失敗'}
            {result.dryRun && <span className="ml-2 badge badge-amber">dry-run</span>}
          </h2>
          <div className="text-sm space-y-2">
            <div>アップロードファイル: {result.uploaded.join(', ')}</div>
            <div>exit code: <code>{result.exitCode}</code></div>
          </div>
          {result.stdout && (
            <details className="mt-3" open={!result.ok}>
              <summary className="cursor-pointer text-sm font-medium">stdout</summary>
              <pre className="mt-2 bg-slate-900 text-slate-100 p-3 rounded overflow-x-auto text-xs whitespace-pre-wrap">{result.stdout}</pre>
            </details>
          )}
          {result.stderr && (
            <details className="mt-3" open>
              <summary className="cursor-pointer text-sm font-medium text-rose-700">stderr</summary>
              <pre className="mt-2 bg-slate-900 text-rose-200 p-3 rounded overflow-x-auto text-xs whitespace-pre-wrap">{result.stderr}</pre>
            </details>
          )}
          {result.ok && !result.dryRun && (
            <p className="mt-3 text-sm">
              ✨ <strong>client-env/</strong> が更新されました。各セクション（WBS / 課題 / リスク 等）を確認してください。
              <br />
              <span className="text-xs text-slate-600">※ 反映を見るには viewer を再ビルド or リロード（dev サーバーは hot reload）</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
