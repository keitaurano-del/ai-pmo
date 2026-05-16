#!/usr/bin/env tsx
/**
 * AI PMO エージェント runner
 *
 * Usage:
 *   npm run agent -- run scribe   --client medium [--input transcript.txt] [--dry-run]
 *   npm run agent -- run reporter --client medium [--dry-run]
 *   npm run agent -- list
 *   npm run agent -- --help
 *
 * dry-run モード: Claude API は呼ばれず、プロンプト・出力先のみ表示。
 */
import { parseArgs } from 'node:util';
import { scribe } from './scribe.js';
import { reporter } from './reporter.js';
import { Agent } from './types.js';
import { repoRel } from './lib/io.js';

const agents: Record<string, Agent> = {
  scribe,
  reporter,
};

const { values, positionals } = parseArgs({
  options: {
    client: { type: 'string' },
    input: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
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
  npm run agent -- run <agent> --client <slug> [--input <file>] [--dry-run]

エージェント:
${Object.values(agents).map((a) => `  ${a.name.padEnd(10)} — ${a.description}`).join('\n')}

Examples:
  npm run agent -- list
  npm run agent -- run scribe --client medium --dry-run
  npm run agent -- run scribe --client medium --input /tmp/transcript.txt
  npm run agent -- run reporter --client medium --dry-run
  npm run agent -- run reporter --client medium
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

  console.log(`\n🤖 ${agent.name}-agent 実行${dryRun ? ' (dry-run)' : ''}`);
  console.log(`   client: ${values.client}`);
  if (values.input) console.log(`   input:  ${values.input}`);
  console.log('');

  const result = await agent.run({
    clientSlug: values.client!,
    inputFile: values.input,
    dryRun,
  });

  if (dryRun) {
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
