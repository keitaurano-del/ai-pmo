/**
 * intake-agent: クライアント支給資料（PDF / md / txt）を読み込み、
 * Claude の文書理解で client-env の初期データを一括生成。
 *
 *   npm run agent -- run intake --client xxx --input rfp.pdf --input requirements.md
 *   npm run agent -- run intake --client xxx --input rfp.pdf --dry-run
 *   npm run agent -- run intake --client xxx --input rfp.pdf --force  # 既存ファイルを上書き
 */
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'node:fs';
import { extname, basename } from 'node:path';
import { Agent, AgentRunOpts, AgentResult } from './types.js';
import { exists, repoRel, readAgentPrompt } from './lib/io.js';
import { EXTRACT_JSON_SCHEMA, parseExtractedJson } from './lib/extract.js';
import { writeAllSections } from './lib/writers.js';

export const intake: Agent = {
  name: 'intake',
  description: 'クライアント支給資料 (PDF/md/txt) を読み込み、client-env を一括初期生成',
  async run(opts: AgentRunOpts): Promise<AgentResult> {
    const inputs = parseInputs(opts);
    if (inputs.length === 0) {
      throw new Error(
        '--input <file> を 1 つ以上指定してください（複数可、PDF/md/txt 対応）',
      );
    }

    const agentPromptDoc = safeReadAgentPrompt('intake');

    const system = [
      'あなたは AI PMO の Intake 担当エージェントです。',
      '',
      'クライアント企業から提供された資料（RFP / 提案書 / キックオフ資料 / 既存議事録 / 要件定義書 等）を読み込み、',
      'AI PMO が運用するための **client-env 初期データ** を構造化して返してください。',
      '',
      agentPromptDoc ? `\n## 役割定義（agents/intake-agent.md より）\n\n${agentPromptDoc}\n` : '',
      '',
      '## あなたが抽出すべきもの',
      '- プロジェクト憲章（背景・目的・スコープ・マイルストーン・成功基準・初期リスク）',
      '- ステークホルダー（クライアント側 / ベンダー側それぞれ）',
      '- WBS（フェーズ・大タスク・主要サブタスクの 2〜3 階層）',
      '- リスク台帳（資料中で言及された懸念・想定リスク）',
      '- 意思決定ログ（既に下されている決定事項があれば）',
      '- 用語集（資料中の固有用語・略語）',
      '',
      '## 重要な原則',
      '- **資料に書かれていないことは捏造しない**。空欄や TBD で残し、notes に「要ヒアリング」と書く。',
      '- 数値・固有名詞は資料から正確に引用する。',
      '- 日付は YYYY-MM-DD に正規化。',
      '- WBS の ID は階層構造（1, 1.1, 1.1.1 形式）。',
      '- リスク ID は R-001 形式、意思決定 ID は D-001 形式、マイルストーン ID は M1 形式で連番。',
      '',
      EXTRACT_JSON_SCHEMA,
    ].join('\n');

    const userContent = buildUserContent(inputs);
    const promptPreview = renderPromptPreview(system, inputs);

    if (opts.dryRun) {
      return {
        outputs: [],
        promptPreview,
        notes: [
          'dry-run: Claude API は呼ばれていません。',
          `入力ファイル: ${inputs.map((i) => i.name).join(', ')}`,
          `合計 ${inputs.length} ファイル / ${(totalBytes(inputs) / 1024).toFixed(1)} KB`,
          `client-env/<7+セクション> に書き出される予定（charter / stakeholders / wbs / risks / glossary / decisions / intake-notes）。`,
        ],
      };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY が未設定。--dry-run で内容のみ確認するか、export ANTHROPIC_API_KEY=sk-ant-... してください。');
    }
    const client = new Anthropic({ apiKey });

    const res = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 8000,
      system,
      messages: [{ role: 'user', content: userContent }],
    });
    const text = res.content
      .filter((b) => b.type === 'text')
      .map((b) => ('text' in b ? b.text : ''))
      .join('\n');

    const extracted = parseExtractedJson(text);
    const results = writeAllSections(extracted, {
      clientSlug: opts.clientSlug,
      generatedBy: 'intake-agent',
      force: Boolean((opts as any).force),
    });

    return {
      outputs: results.map((r) => ({ path: r.path, bytes: r.bytes, preview: '' })),
      promptPreview,
      usage: { input_tokens: res.usage.input_tokens, output_tokens: res.usage.output_tokens },
      notes: extracted.notes.length > 0 ? [
        `📝 AI が ${extracted.notes.length} 件の「要ヒアリング項目」を検出。`,
        `→ case-studies/${opts.clientSlug}/client-env/00-context/intake-notes.md を参照`,
      ] : [],
    };
  },
};

interface InputFile {
  name: string;
  ext: string;
  bytes: Buffer | string;
  isPdf: boolean;
}

function parseInputs(opts: AgentRunOpts): InputFile[] {
  // --input は parseArgs で 1 つしか取れないが、CLI で複数渡された場合は array になる想定
  const raw = (opts as any).inputFiles ?? (opts.inputFile ? [opts.inputFile] : []);
  return (raw as string[]).map((p) => {
    if (!exists(p)) throw new Error(`入力ファイルが見つかりません: ${p}`);
    const ext = extname(p).toLowerCase();
    const isPdf = ext === '.pdf';
    return {
      name: basename(p),
      ext,
      bytes: isPdf ? readFileSync(p) : readFileSync(p, 'utf-8'),
      isPdf,
    };
  });
}

function buildUserContent(inputs: InputFile[]): Anthropic.MessageParam['content'] {
  const blocks: Anthropic.MessageParam['content'] = [];
  blocks.push({
    type: 'text',
    text: `以下、${inputs.length} 件のクライアント支給資料を添付します。これらを読み込み、AI PMO の client-env 初期データを構造化 JSON で返してください。`,
  } as any);
  for (const inp of inputs) {
    if (inp.isPdf) {
      blocks.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: (inp.bytes as Buffer).toString('base64'),
        },
        title: inp.name,
      } as any);
    } else {
      blocks.push({
        type: 'text',
        text: `\n\n## ファイル: ${inp.name}\n\n${inp.bytes as string}`,
      } as any);
    }
  }
  blocks.push({
    type: 'text',
    text: '\n\n上記資料に基づき、定義した JSON スキーマに沿って構造化データを返してください。資料中の固有名詞・数値は正確に引用、不明点は notes に記載。',
  } as any);
  return blocks;
}

function renderPromptPreview(system: string, inputs: InputFile[]): string {
  return [
    '[SYSTEM 先頭]',
    system.slice(0, 400),
    '...',
    '',
    '[USER content blocks]',
    `- text: "以下、${inputs.length} 件のクライアント支給資料を添付します..."`,
    ...inputs.map(
      (i) =>
        `- ${i.isPdf ? 'document(PDF)' : 'text'}: ${i.name} (${i.isPdf ? `${(i.bytes as Buffer).length} bytes` : `${(i.bytes as string).length} 文字`})`,
    ),
    '- text: "上記資料に基づき、JSON で構造化データを返してください..."',
  ].join('\n');
}

function totalBytes(inputs: InputFile[]): number {
  return inputs.reduce((sum, i) => sum + (i.isPdf ? (i.bytes as Buffer).length : Buffer.byteLength(i.bytes as string)), 0);
}

function safeReadAgentPrompt(name: string): string {
  try {
    return readAgentPrompt(name);
  } catch {
    return '';
  }
}
