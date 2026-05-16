// AI PMO ビューワー用 バックエンド API
//
// 役割:
//   - case-studies/<slug>/client-env/ 配下のファイル CRUD
//   - クライアント資料のアップロード + intake-agent 起動
//   - 課題 / リスクの構造化編集
//
// 起動: npm run dev (http://localhost:3001)
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve, basename, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const CASE_ROOT = join(REPO_ROOT, 'case-studies');
const PORT = Number(process.env.PORT ?? 3001);

const app = express();

app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '2mb' }));
app.use(express.text({ type: 'text/*', limit: '2mb' }));

const upload = multer({
  dest: join(tmpdir(), 'ai-pmo-uploads'),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
});

// ─── ヘルパー ─────────────────────────────────────────

function safeCasePath(slug: string, ...parts: string[]): string | null {
  if (!/^[a-z0-9][a-z0-9-_]*$/i.test(slug)) return null;
  const abs = normalize(join(CASE_ROOT, slug, 'client-env', ...parts));
  if (!abs.startsWith(CASE_ROOT)) return null; // path traversal block
  return abs;
}

function listCases(): string[] {
  if (!existsSync(CASE_ROOT)) return [];
  return readdirSync(CASE_ROOT).filter((d) => {
    const p = join(CASE_ROOT, d);
    return statSync(p).isDirectory() && existsSync(join(p, 'client-env'));
  });
}

function listClientEnvFiles(slug: string): Array<{ path: string; bytes: number; modified: string }> {
  const root = join(CASE_ROOT, slug, 'client-env');
  if (!existsSync(root)) return [];
  const out: Array<{ path: string; bytes: number; modified: string }> = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir)) {
      const abs = join(dir, e);
      const s = statSync(abs);
      if (s.isDirectory()) walk(abs);
      else if (s.isFile() && !e.startsWith('.')) {
        out.push({
          path: abs.replace(root + '/', ''),
          bytes: s.size,
          modified: s.mtime.toISOString(),
        });
      }
    }
  };
  walk(root);
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

// ─── ルート ───────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, repoRoot: REPO_ROOT, caseRoot: CASE_ROOT });
});

app.get('/api/cases', (_req, res) => {
  const slugs = listCases();
  res.json({
    cases: slugs.map((slug) => ({
      slug,
      files: listClientEnvFiles(slug).length,
    })),
  });
});

app.get('/api/cases/:slug/files', (req, res) => {
  const slug = req.params.slug;
  if (!safeCasePath(slug)) return res.status(400).json({ error: 'invalid slug' });
  res.json({ slug, files: listClientEnvFiles(slug) });
});

app.get('/api/cases/:slug/files/*splat', (req, res) => {
  const slug = req.params.slug;
  const rel = (Array.isArray((req.params as any).splat) ? (req.params as any).splat.join('/') : (req.params as any).splat) as string;
  const abs = safeCasePath(slug, rel);
  if (!abs || !existsSync(abs) || !statSync(abs).isFile()) {
    return res.status(404).json({ error: 'not found' });
  }
  res.type('text/plain').send(readFileSync(abs, 'utf-8'));
});

app.put('/api/cases/:slug/files/*splat', (req, res) => {
  const slug = req.params.slug;
  const rel = (Array.isArray((req.params as any).splat) ? (req.params as any).splat.join('/') : (req.params as any).splat) as string;
  const abs = safeCasePath(slug, rel);
  if (!abs) return res.status(400).json({ error: 'invalid path' });

  const content = typeof req.body === 'string' ? req.body : req.body?.content;
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'body must be {content: string} or raw text/plain' });
  }

  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content, 'utf-8');
  const s = statSync(abs);
  res.json({ ok: true, path: rel, bytes: s.size, modified: s.mtime.toISOString() });
});

app.delete('/api/cases/:slug/files/*splat', (req, res) => {
  const slug = req.params.slug;
  const rel = (Array.isArray((req.params as any).splat) ? (req.params as any).splat.join('/') : (req.params as any).splat) as string;
  const abs = safeCasePath(slug, rel);
  if (!abs || !existsSync(abs)) return res.status(404).json({ error: 'not found' });
  const { unlinkSync } = require('node:fs');
  unlinkSync(abs);
  res.json({ ok: true });
});

// ─── アップロード + intake-agent ──────────────────────

app.post('/api/cases/:slug/upload', upload.array('files', 10), async (req, res) => {
  const slug = req.params.slug;
  if (!safeCasePath(slug)) return res.status(400).json({ error: 'invalid slug' });
  if (!Array.isArray(req.files) || req.files.length === 0) {
    return res.status(400).json({ error: 'no files uploaded' });
  }

  const dryRun = req.query.dryRun === 'true';
  const force = req.query.force === 'true';
  const filePaths = (req.files as Express.Multer.File[]).map((f) => f.path);
  const fileNames = (req.files as Express.Multer.File[]).map((f) => f.originalname);

  // intake-agent CLI を子プロセスで起動
  const args = [
    'run',
    'agent',
    '--',
    'run',
    'intake',
    '--client',
    slug,
    ...filePaths.flatMap((p) => ['--input', p]),
    ...(dryRun ? ['--dry-run'] : []),
    ...(force ? ['--force'] : []),
  ];

  try {
    const { stdout, stderr, code } = await runChild('npm', args, REPO_ROOT);
    res.json({
      ok: code === 0,
      exitCode: code,
      uploaded: fileNames,
      dryRun,
      stdout: stdout.slice(-3000),
      stderr: stderr.slice(-1000),
    });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

// ─── ヘルパー: 子プロセス実行 ──────────────────────

function runChild(
  cmd: string,
  args: string[],
  cwd: string,
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    const child = spawn(cmd, args, { cwd, env });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (b) => (stdout += b.toString()));
    child.stderr.on('data', (b) => (stderr += b.toString()));
    child.on('error', reject);
    child.on('close', (code) => resolve({ stdout, stderr, code: code ?? -1 }));
  });
}

// ─── エラーハンドラ ───────────────────────────────────

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[error]', err);
  res.status(500).json({ error: err?.message ?? 'internal error' });
});

app.listen(PORT, () => {
  console.log(`🤖 AI PMO API listening on http://localhost:${PORT}`);
  console.log(`   REPO_ROOT: ${REPO_ROOT}`);
  console.log(`   CASE_ROOT: ${CASE_ROOT}`);
  console.log(`   ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'set' : 'NOT set (intake は dry-run のみ可)'}`);
});
