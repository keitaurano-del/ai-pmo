import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const REPO_ROOT = resolve(import.meta.dirname, '..', '..', '..');

export function casePath(clientSlug: string, ...rel: string[]): string {
  return join(REPO_ROOT, 'case-studies', clientSlug, 'client-env', ...rel);
}

export function caseRoot(clientSlug: string): string {
  return join(REPO_ROOT, 'case-studies', clientSlug);
}

export function repoRel(absPath: string): string {
  return absPath.replace(REPO_ROOT + '/', '');
}

export function readFile(absPath: string): string {
  return readFileSync(absPath, 'utf-8');
}

export function writeFile(absPath: string, content: string): void {
  mkdirSync(dirname(absPath), { recursive: true });
  writeFileSync(absPath, content, 'utf-8');
}

export function exists(absPath: string): boolean {
  return existsSync(absPath);
}

export function listFiles(dir: string, pattern?: RegExp): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    if (statSync(abs).isFile() && (!pattern || pattern.test(entry))) out.push(abs);
  }
  return out.sort();
}

export function readMany(absPaths: string[]): Array<{ path: string; body: string }> {
  return absPaths.map((p) => ({ path: p, body: readFileSync(p, 'utf-8') }));
}

export function agentPromptPath(agent: string): string {
  return join(REPO_ROOT, 'agents', `${agent}-agent.md`);
}

export function readAgentPrompt(agent: string): string {
  const p = agentPromptPath(agent);
  if (!existsSync(p)) {
    throw new Error(`Agent prompt not found: ${repoRel(p)}`);
  }
  return readFileSync(p, 'utf-8');
}
