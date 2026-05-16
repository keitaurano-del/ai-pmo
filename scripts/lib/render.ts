import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

export type Vars = Record<string, string>;

export function render(template: string, vars: Vars): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    if (!(key in vars)) {
      throw new Error(`テンプレ変数 {{${key}}} が未定義`);
    }
    return vars[key];
  });
}

export interface RenderedFile {
  destPath: string;
  bytes: number;
  skipped?: boolean;
}

export function renderDirectory(opts: {
  templateDir: string;
  destDir: string;
  vars: Vars;
  dryRun?: boolean;
  force?: boolean;
}): RenderedFile[] {
  const { templateDir, destDir, vars, dryRun, force } = opts;
  const results: RenderedFile[] = [];

  function walk(dir: string) {
    for (const entry of readdirSync(dir)) {
      const abs = join(dir, entry);
      const s = statSync(abs);
      if (s.isDirectory()) {
        walk(abs);
        continue;
      }
      const rel = relative(templateDir, abs);
      // .tmpl 拡張子は除去、 _gitkeep -> .gitkeep、 _template マーカは残す
      let outRel = rel.replace(/\.tmpl$/, '');
      outRel = outRel.replace(/(^|\/)_gitkeep$/, '$1.gitkeep');
      const destPath = join(destDir, outRel);

      let content = readFileSync(abs, 'utf-8');
      if (rel.endsWith('.tmpl')) {
        content = render(content, vars);
      }

      if (dryRun) {
        results.push({ destPath, bytes: Buffer.byteLength(content), skipped: false });
        continue;
      }

      if (existsSync(destPath) && !force) {
        results.push({ destPath, bytes: 0, skipped: true });
        continue;
      }

      mkdirSync(dirname(destPath), { recursive: true });
      writeFileSync(destPath, content, 'utf-8');
      results.push({ destPath, bytes: Buffer.byteLength(content) });
    }
  }

  walk(templateDir);
  return results;
}
