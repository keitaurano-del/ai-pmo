/**
 * discovery-agent: PM/PMO に対話形式でヒアリングし、回答を構造化して client-env に展開。
 * 既存資料が薄いクライアント向け。
 *
 *   npm run agent -- run discovery --client xxx
 *   npm run agent -- run discovery --client xxx --dry-run  # 質問のみ表示、AI 呼ばず
 */
import Anthropic from '@anthropic-ai/sdk';
import { Agent, AgentRunOpts, AgentResult } from './types.js';
import { EXTRACT_JSON_SCHEMA, parseExtractedJson } from './lib/extract.js';
import { writeAllSections } from './lib/writers.js';
import { ask } from '../lib/prompt.js';

interface Question {
  key: string;
  prompt: string;
  hint?: string;
  optional?: boolean;
}

const QUESTIONS: Question[] = [
  { key: 'client_name', prompt: 'クライアント企業の正式社名は？', hint: '例: 株式会社 M-Mart' },
  { key: 'industry', prompt: '業種は？', hint: '例: 小売・流通' },
  { key: 'project_name', prompt: 'プロジェクトの正式名は？', hint: '例: 基幹システム刷新（NEXUS-RTL）' },
  { key: 'background', prompt: 'プロジェクトの背景・経緯を 2〜3 行で。', hint: 'なぜこの PJ が立ち上がったか' },
  { key: 'objectives', prompt: '主要な目的を 3 つまで（; 区切り）。', hint: '例: 商品マスタ拡張; リアルタイム在庫連携; 経営ダッシュボード' },
  { key: 'scope_in', prompt: 'スコープに含むもの（; 区切り）。' },
  { key: 'scope_out', prompt: 'スコープに含まないもの（; 区切り）。', optional: true },
  { key: 'period_start', prompt: 'プロジェクト開始日（YYYY-MM-DD）。' },
  { key: 'cutover_date', prompt: 'カットオーバー予定日（YYYY-MM-DD）。' },
  { key: 'contract_value', prompt: '契約金額（任意）。', optional: true },
  { key: 'pm_name', prompt: 'PM の氏名は？' },
  { key: 'sponsor_name', prompt: '経営スポンサーの氏名・役職は？', hint: '例: 田所 浩二 CIO' },
  { key: 'business_owner', prompt: 'クライアント側の業務オーナーは？', hint: '例: 営業企画部 西野 麻衣 部長' },
  { key: 'phases', prompt: '主要フェーズを順に（; 区切り）。', hint: '例: 要件定義; 基本設計; 詳細設計; 開発; 結合テスト; カットオーバー' },
  { key: 'top_risks', prompt: '現時点で見えている主要リスクを 3 つまで（; 区切り）。', optional: true },
  { key: 'tools', prompt: '使用ツール（Backlog/Slack/Box 等、; 区切り）。', optional: true },
  { key: 'glossary', prompt: '固有用語・略語を「用語=意味; 用語=意味」形式で（任意）。', optional: true },
];

export const discovery: Agent = {
  name: 'discovery',
  description: '対話型ヒアリング (PM/PMO 向け) → 構造化 client-env を生成',
  async run(opts: AgentRunOpts): Promise<AgentResult> {
    console.log('\n📋 Discovery セッション開始（質問は ' + QUESTIONS.length + ' 項目、空欄で skip 可）\n');

    const answers: Record<string, string> = {};
    for (const q of QUESTIONS) {
      const hint = q.optional ? '（任意）' : '';
      const promptText = q.hint ? `${q.prompt}${hint}\n  hint: ${q.hint}\n  ` : `${q.prompt}${hint}`;
      const a = await ask(promptText);
      answers[q.key] = a;
    }

    console.log('\n✅ ヒアリング完了。AI に渡して構造化します...\n');

    const system = [
      'あなたは AI PMO の Discovery 担当エージェントです。',
      '',
      'PM / PMO に対するインタビュー回答を受け取り、AI PMO が運用するための **client-env 初期データ** を構造化して返してください。',
      '',
      '## 重要な原則',
      '- 回答が空欄や不十分な項目は notes に「要追加ヒアリング: ...」と記載し、捏造しない。',
      '- 回答から推測できる範囲で初期 WBS を 2〜3 階層で起こす（典型的なフェーズ構成）。',
      '- リスクは回答 + 一般的な PJ リスクから 3〜5 件提案。捏造でなく「Phase X で典型的なリスクとして識別される」と注記する。',
      '- 日付は YYYY-MM-DD に正規化。',
      '- WBS の ID は階層構造（1, 1.1, 1.1.1 形式）。',
      '',
      EXTRACT_JSON_SCHEMA,
    ].join('\n');

    const userText = [
      '## Discovery インタビュー回答',
      '',
      ...QUESTIONS.map((q) => `**${q.prompt}**\n→ ${answers[q.key] || '(回答なし)'}`).join('\n\n').split('\n'),
      '',
      '## 指示',
      '上記の回答を統合し、定義された JSON スキーマに沿って構造化データを返してください。',
      '不明点・補完が必要な箇所は notes フィールドに「要追加ヒアリング: ...」と明記。',
    ].join('\n');

    const promptPreview = [
      '[SYSTEM 先頭]',
      system.slice(0, 300),
      '...',
      '',
      '[USER 先頭]',
      userText.slice(0, 600),
      '...',
    ].join('\n');

    if (opts.dryRun) {
      return {
        outputs: [],
        promptPreview,
        notes: [
          'dry-run: Claude API は呼ばれていません。',
          `${QUESTIONS.length} 件の質問に回答を取得`,
          'AI 呼び出し時は client-env 全セクションが生成されます',
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
      messages: [{ role: 'user', content: userText }],
    });
    const text = res.content
      .filter((b) => b.type === 'text')
      .map((b) => ('text' in b ? b.text : ''))
      .join('\n');

    const extracted = parseExtractedJson(text);
    const results = writeAllSections(extracted, {
      clientSlug: opts.clientSlug,
      generatedBy: 'discovery-agent',
      force: Boolean((opts as any).force),
    });

    return {
      outputs: results.map((r) => ({ path: r.path, bytes: r.bytes })),
      promptPreview,
      usage: { input_tokens: res.usage.input_tokens, output_tokens: res.usage.output_tokens },
      notes: extracted.notes.length > 0 ? [
        `📝 AI が ${extracted.notes.length} 件の「要追加ヒアリング項目」を検出。`,
        `→ case-studies/${opts.clientSlug}/client-env/00-context/intake-notes.md を参照`,
      ] : [],
    };
  },
};
