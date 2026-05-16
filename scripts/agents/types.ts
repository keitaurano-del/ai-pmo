/**
 * AI PMO エージェントの共通インタフェース。
 * 各エージェントは context を読み、prompt を組み立て、Claude API を呼んで成果物を書き出す。
 */

export interface AgentRunOpts {
  clientSlug: string;
  inputFile?: string; // optional: --input で渡される入力ファイル
  dryRun: boolean;
}

export interface AgentResult {
  outputs: Array<{ path: string; bytes: number; preview?: string }>;
  promptPreview: string;
  usage?: { input_tokens: number; output_tokens: number };
  notes?: string[];
}

export interface Agent {
  name: string;
  description: string;
  run(opts: AgentRunOpts): Promise<AgentResult>;
}
