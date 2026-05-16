import { useState } from 'react';
import { Markdown } from '@/lib/markdown';
import { apiAvailable, putFile, getFile } from '@/lib/api';

interface Props {
  caseSlug: string;
  relPath: string; // e.g. "04-meetings/2026-05-11_weekly.md"
  initialBody: string;
  onSaved?: (newBody: string) => void;
}

export function EditableMarkdown({ caseSlug, relPath, initialBody, onSaved }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialBody);
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onEdit = () => {
    setDraft(body);
    setEditing(true);
  };

  const onCancel = () => {
    setDraft(body);
    setEditing(false);
    setErr(null);
  };

  const onSave = async () => {
    setSaving(true);
    setErr(null);
    try {
      await putFile(caseSlug, relPath, draft);
      // 保存後、サーバから最新を再取得（フッタ・タイムスタンプを反映）
      const fresh = await getFile(caseSlug, relPath);
      setBody(fresh);
      setDraft(fresh);
      setEditing(false);
      setSavedAt(new Date().toLocaleTimeString('ja-JP'));
      onSaved?.(fresh);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  if (!apiAvailable) {
    return <Markdown source={body} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 no-print">
        <div className="text-xs text-slate-500">
          ✏️ 編集可能 · <code>{relPath}</code>
          {savedAt && <span className="ml-3 text-emerald-600">✓ 保存済 {savedAt}</span>}
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={onCancel}
                disabled={saving}
                className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="text-sm px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300"
              >
                {saving ? '保存中…' : '💾 保存'}
              </button>
            </>
          ) : (
            <button
              onClick={onEdit}
              className="text-sm px-3 py-1.5 rounded-lg border border-brand-300 bg-white text-brand-700 hover:bg-brand-50"
            >
              ✏️ 編集
            </button>
          )}
        </div>
      </div>
      {err && (
        <div className="card p-3 bg-rose-50 border-rose-200 text-rose-800 text-sm">
          ❌ 保存失敗: {err}
        </div>
      )}
      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full font-mono text-sm border border-slate-300 rounded-lg p-3 min-h-[600px] focus:outline-none focus:ring-2 focus:ring-brand-400"
          spellCheck={false}
        />
      ) : (
        <Markdown source={body} />
      )}
    </div>
  );
}
