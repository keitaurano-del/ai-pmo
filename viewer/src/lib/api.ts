/**
 * バックエンド API クライアント。
 * VITE_API_URL が設定されていれば、サーバー連携モードで動作（編集・アップロード可能）。
 * 未設定なら read-only（静的サイト）モード。
 */
const API_URL = import.meta.env.VITE_API_URL || '';

export const apiAvailable = Boolean(API_URL);

export async function getFile(slug: string, relPath: string): Promise<string> {
  const r = await fetch(`${API_URL}/api/cases/${slug}/files/${relPath}`);
  if (!r.ok) throw new Error(`getFile failed: ${r.status}`);
  return r.text();
}

export interface SaveResult {
  ok: boolean;
  path: string;
  bytes: number;
  modified: string;
}

export async function putFile(slug: string, relPath: string, content: string): Promise<SaveResult> {
  const r = await fetch(`${API_URL}/api/cases/${slug}/files/${relPath}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!r.ok) throw new Error(`putFile failed: ${r.status} ${await r.text()}`);
  return r.json();
}

export interface UploadResult {
  ok: boolean;
  exitCode: number;
  uploaded: string[];
  dryRun: boolean;
  stdout: string;
  stderr: string;
}

export async function uploadFiles(slug: string, files: File[], opts: { dryRun?: boolean; force?: boolean } = {}): Promise<UploadResult> {
  const form = new FormData();
  for (const f of files) form.append('files', f);
  const qs = new URLSearchParams();
  if (opts.dryRun) qs.set('dryRun', 'true');
  if (opts.force) qs.set('force', 'true');
  const r = await fetch(`${API_URL}/api/cases/${slug}/upload${qs.toString() ? '?' + qs : ''}`, {
    method: 'POST',
    body: form,
  });
  if (!r.ok) throw new Error(`upload failed: ${r.status} ${await r.text()}`);
  return r.json();
}
