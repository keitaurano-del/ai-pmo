#!/usr/bin/env tsx
/**
 * AI PMO クライアント環境ブートストラッパー
 *
 *   npm run init -- --slug spring-foods --name "春日フーズ株式会社" --size medium
 *   npm run init -- --interactive
 *   npm run init -- --slug demo --name "デモ株式会社" --dry-run
 */
import { parseArgs } from 'node:util';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { renderDirectory, Vars } from './lib/render.js';
import { ask, askChoice } from './lib/prompt.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const TEMPLATE_DIR = resolve(__dirname, 'templates');

const { values } = parseArgs({
  options: {
    slug: { type: 'string' },
    name: { type: 'string' },
    size: { type: 'string' },
    industry: { type: 'string' },
    vendor: { type: 'string' },
    'project-name': { type: 'string' },
    'project-full-name': { type: 'string' },
    pm: { type: 'string' },
    interactive: { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
    force: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
  strict: true,
});

if (values.help) {
  console.log(`
🤖 AI PMO クライアント環境ブートストラッパー

Usage:
  npm run init -- [options]

Options:
  --slug <kebab-case>           クライアント識別子（例: spring-foods）
  --name <name>                 クライアント正式社名
  --size <small|medium|large>   規模セグメント (default: medium)
  --industry <industry>         業種
  --vendor <name>               ベンダー名 (default: アクロス・システムズ株式会社)
  --project-name <name>         プロジェクト略称（例: SAKURA）
  --project-full-name <name>    プロジェクト正式名
  --pm <name>                   PM 氏名
  --interactive                 未指定項目を対話で入力
  --dry-run                     ファイルを書かずに生成内容を表示
  --force                       既存ファイルを上書き
  --help                        このヘルプを表示

Examples:
  npm run init -- --interactive
  npm run init -- --slug spring-foods --name "春日フーズ株式会社" --size medium --industry "食品製造"
  npm run init -- --slug demo --name "デモ株式会社" --dry-run
`);
  process.exit(0);
}

async function main() {
  console.log('\n🤖 AI PMO クライアント環境ブートストラッパー\n');

  // 必須項目を確保
  let slug = values.slug;
  let name = values.name;
  let size = (values.size ?? 'medium') as 'small' | 'medium' | 'large';
  let industry = values.industry;
  let vendor = values.vendor;
  let projectName = values['project-name'];
  let projectFullName = values['project-full-name'];
  let pmName = values.pm;

  const interactive = values.interactive || !slug || !name;

  if (interactive) {
    if (!slug) slug = await ask('クライアント slug (kebab-case)', 'demo-client');
    if (!name) name = await ask('クライアント正式社名', 'デモ株式会社');
    if (!values.size) size = await askChoice('規模', ['small', 'medium', 'large'], 'medium');
    if (!industry) industry = await ask('業種', '製造業');
    if (!vendor) vendor = await ask('ベンダー名（御社）', 'アクロス・システムズ株式会社');
    if (!projectName) projectName = await ask('プロジェクト略称（英大文字）', 'SAKURA');
    if (!projectFullName)
      projectFullName = await ask('プロジェクト正式名', '基幹システム刷新プロジェクト');
    if (!pmName) pmName = await ask('PM 氏名', '山田 太郎');
  }

  // デフォルト埋め
  slug ??= 'demo-client';
  name ??= 'デモ株式会社';
  industry ??= '製造業';
  vendor ??= 'アクロス・システムズ株式会社';
  projectName ??= 'SAKURA';
  projectFullName ??= '基幹システム刷新プロジェクト';
  pmName ??= '山田 太郎';

  // 派生変数
  const today = new Date().toISOString().slice(0, 10);
  const monthLater = addMonths(today, 3);
  const cutover = addMonths(today, 10);

  const vars: Vars = {
    client_slug: slug,
    client_name: name,
    client_industry: industry,
    client_size: size,
    size_segment: size,
    vendor_name: vendor,
    project_name: projectName,
    project_full_name: projectFullName,
    pm_name: pmName,
    pmo_lead: '森下 美咲（PMO 室長）',
    pmo_ops: '久野 蓮（PMO シニア）',
    poc_start: today,
    poc_end: monthLater,
    cutover_date: cutover,
    reference_date: today,
    contract_value: '未確定',
    phase_name: 'Phase 1 — PoC',
    generated_at: new Date().toISOString(),
  };

  const destDir = resolve(REPO_ROOT, 'case-studies', slug);

  if (existsSync(destDir) && !values.force && !values['dry-run']) {
    console.error(`❌ 既に ${destDir} が存在します。--force で上書きするか slug を変えてください。`);
    process.exit(1);
  }

  console.log(`📋 設定内容`);
  console.log(`  slug:          ${vars.client_slug}`);
  console.log(`  クライアント:  ${vars.client_name}`);
  console.log(`  業種:          ${vars.client_industry}`);
  console.log(`  規模:          ${vars.size_segment}`);
  console.log(`  ベンダー:      ${vars.vendor_name}`);
  console.log(`  プロジェクト:  ${vars.project_name} — ${vars.project_full_name}`);
  console.log(`  PM:            ${vars.pm_name}`);
  console.log(`  基準日:        ${vars.reference_date}`);
  console.log(`  生成先:        ${destDir}`);
  console.log(values['dry-run'] ? `\n🔍 dry-run モード — ファイルは作成しません\n` : '');

  const results = renderDirectory({
    templateDir: TEMPLATE_DIR,
    destDir,
    vars,
    dryRun: values['dry-run'],
    force: values.force,
  });

  let createdCount = 0;
  let skippedCount = 0;
  let totalBytes = 0;
  for (const r of results) {
    const relPath = r.destPath.replace(REPO_ROOT + '/', '');
    if (r.skipped) {
      console.log(`  ⏭  ${relPath} (既存、スキップ)`);
      skippedCount++;
    } else {
      console.log(`  ✓ ${relPath} (${r.bytes} bytes)`);
      createdCount++;
      totalBytes += r.bytes;
    }
  }

  console.log(`\n✅ 完了！ ${createdCount} ファイル, ${(totalBytes / 1024).toFixed(1)} KB`);
  if (skippedCount > 0) console.log(`   ${skippedCount} ファイルはスキップ（--force で上書き可）`);

  if (!values['dry-run']) {
    console.log(`\n📍 次のステップ:`);
    console.log(`  1. cat case-studies/${slug}/README.md`);
    console.log(`  2. 業務要件 / 体制 / マイルストーンを company-profile.md と project-charter.md に追記`);
    console.log(`  3. データソース（Backlog / Slack / Box）の認証情報を 00-context/integrations.md に設定`);
    console.log(`  4. AI エージェント初期実行（reporter / scribe / watcher / triager）`);
    console.log(`  5. ビューワーで確認: cd viewer && npm run dev\n`);
  }
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

main().catch((e) => {
  console.error('❌ エラー:', e instanceof Error ? e.message : e);
  process.exit(1);
});
