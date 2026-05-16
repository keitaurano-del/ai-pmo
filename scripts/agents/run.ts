#!/usr/bin/env tsx
/**
 * AI PMO エージェント runner
 *
 * Usage:
 *   npm run agent -- run scribe    --client medium [--input transcript.txt] [--dry-run]
 *   npm run agent -- run reporter  --client medium [--dry-run]
 *   npm run agent -- run intake    --client xxx --input rfp.pdf [--input req.md] [--force] [--dry-run]
 *   npm run agent -- run discovery --client xxx [--dry-run]
 *   npm run agent -- list
 *   npm run agent -- --help
 *
 * dry-run モード: Claude API は呼ばれず、プロンプト・出力先のみ表示。
 */
import { parseArgs } from 'node:util';
import { scribe } from './scribe.js';
import { reporter } from './reporter.js';
import { intake } from './intake.js';
import { discovery } from './discovery.js';
import { Agent } from './types.js';
import { repoRel } from './lib/io.js';

const agents: Record<string, Agent> = {
  intake,
  discovery,
  scribe,
  reporter,
};

const { values, positionals } = parseArgs({
  options: {
    client: { type: 'string' },
    input: { type: 'string', multiple: true },
    'dry-run': { type: 'boolean', default: false },
    force: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
  allowPositionals: true,
  strict: true,
});

if (values.help || positionals.length === 0) {
  console.log(`
🤖 AI PMO エージェント runner

Usage:
  npm run agent -- list
  npm run agent -- run <agent> --client <slug> [--input <file>...] [--dry-run] [--force]

エージェント:
${Object.values(agents).map((a) => `  ${a.name.padEnd(12)} ${a.description}`).join('\n')}

データ投入フロー:
  1. intake     クライアント資料 (PDF/md/txt) → 構造化 client-env 初期生成
  2. discovery  PM/PMO ヒアリング → 構造化 client-env 初期生成
  3. scribe     会議 transcript → 議事録
  4. reporter   既存成果物を集約 → 週次報告書

Examples:
  npm run agent -- run intake    --client acme --input rfp.pdf --input proposal.md --dry-run
  npm run agent -- run discovery --client acme --dry-run
  npm run agent -- run scribe    --client medium --dry-run
  npm run agent -- run reporter  --client medium --dry-run

オプション:
  --dry-run    API を呼ばずプロンプトと出力先のみ表示（要 API キーなし）
  --force      既存ファイルを上書き（デフォルトは _draft.md として並列保存）
  --input      入力ファイル（複数指定可、intake のみ複数対応）
`);
  process.exit(0);
}

const [cmd, agentName] = positionals;

if (cmd === 'list') {
  console.log('\n登録エージェント:\n');
  for (const a of Object.values(agents)) {
    console.log(`  ${a.name.padEnd(12)} ${a.description}`);
  }
  console.log('');
  process.exit(0);
}

if (cmd !== 'run') {
  console.error(`❌ 不明なコマンド: ${cmd}（'run' または 'list' を指定）`);
  process.exit(1);
}

if (!agentName || !(agentName in agents)) {
  console.error(`❌ 不明なエージェント: ${agentName ?? '(未指定)'}`);
  console.error(`   利用可能: ${Object.keys(agents).join(', ')}`);
  process.exit(1);
}

if (!values.client) {
  console.error('❌ --client <slug> が必須');
  process.exit(1);
}

async function main() {
  const agent = agents[agentName];
  const dryRun = values['dry-run'] ?? false;
  const force = values.force ?? false;
  const inputs = (values.input as string[] | undefined) ?? [];

  console.log(`\n🤖 ${agent.name}-agent 実行${dryRun ? ' (dry-run)' : ''}`);
  console.log(`   client: ${values.client}`);
  if (inputs.length > 0) console.log(`   inputs: ${inputs.join(', ')}`);
  if (force) console.log(`   force:  on (既存ファイル上書き)`);
  console.log('');

  const result = await agent.run({
    clientSlug: values.client!,
    inputFile: inputs[0],
    inputFiles: inputs,
    dryRun,
    force,
  } as any);

  if (dryRun || result.outputs.length === 0) {
    console.log('📝 プロンプトプレビュー:');
    console.log('─'.repeat(60));
    console.log(result.promptPreview);
    console.log('─'.repeat(60));
    if (result.notes) {
      console.log('\n📋 ノート:');
      for (const n of result.notes) console.log(`   - ${n}`);
    }
  } else {
    console.log('✅ 生成完了:');
    for (const o of result.outputs) {
      console.log(`   ${repoRel(o.path)} (${(o.bytes / 1024).toFixed(1)} KB)`);
      if (o.preview) {
        console.log('\n   プレビュー (先頭 300 字):');
        console.log('   ' + o.preview.split('\n').slice(0, 8).join('\n   '));
      }
    }
    if (result.notes && result.notes.length > 0) {
      console.log('\n📋 ノート:');
      for (const n of result.notes) console.log(`   - ${n}`);
    }
    if (result.usage) {
      const cost =
        (result.usage.input_tokens * 15) / 1_000_000 + (result.usage.output_tokens * 75) / 1_000_000;
      console.log(`\n💰 API 使用: input ${result.usage.input_tokens} / output ${result.usage.output_tokens} tokens (~$${cost.toFixed(4)})`);
    }
  }
  console.log('');
}

main().catch((e) => {
  console.error('\n❌ エラー:', e instanceof Error ? e.message : e);
  process.exit(1);
});
