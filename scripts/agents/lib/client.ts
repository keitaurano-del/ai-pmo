import Anthropic from '@anthropic-ai/sdk';

/**
 * Claude API クライアントの薄いラッパー。
 * ANTHROPIC_API_KEY が未設定でも import エラーにならないよう、初期化を遅延させる。
 */

const DEFAULT_MODEL = 'claude-opus-4-7';
const SMALL_MODEL = 'claude-haiku-4-5-20251001';

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY が設定されていません。\n' +
        '  export ANTHROPIC_API_KEY=sk-ant-... してから再実行するか、--dry-run で実行内容のみ確認してください。',
    );
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

export interface CompleteOpts {
  system: string;
  user: string;
  model?: 'opus' | 'haiku';
  maxTokens?: number;
}

export interface CompleteResult {
  text: string;
  usage: { input_tokens: number; output_tokens: number };
}

export async function complete(opts: CompleteOpts): Promise<CompleteResult> {
  const client = getClient();
  const model = opts.model === 'haiku' ? SMALL_MODEL : DEFAULT_MODEL;
  const res = await client.messages.create({
    model,
    max_tokens: opts.maxTokens ?? 4096,
    system: opts.system,
    messages: [{ role: 'user', content: opts.user }],
  });
  const text = res.content
    .filter((b) => b.type === 'text')
    .map((b) => ('text' in b ? b.text : ''))
    .join('\n');
  return { text, usage: { input_tokens: res.usage.input_tokens, output_tokens: res.usage.output_tokens } };
}
