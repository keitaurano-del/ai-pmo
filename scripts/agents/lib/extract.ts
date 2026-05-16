/**
 * intake-agent / discovery-agent が Claude に返させる構造化データの型定義。
 * 両エージェントの出力を統一することで、writers.ts が共通的に各ファイルへ展開できる。
 */

export interface ExtractedCharter {
  project_id?: string;
  contract_value?: string;
  period_start?: string;
  period_end?: string;
  cutover_date?: string;
  background: string;
  objectives: string[];
  scope_in: string[];
  scope_out: string[];
  milestones: Array<{
    id: string;
    name: string;
    date: string;
    status: 'done' | 'in_progress' | 'planned';
  }>;
  success_criteria: Array<{ id: string; criterion: string; measurement: string }>;
  initial_risks: string[];
}

export interface ExtractedStakeholder {
  side: 'client' | 'vendor';
  role: string;
  name?: string;
  org?: string;
  engagement?: '高' | '中' | '低';
  note?: string;
}

export interface ExtractedWbsRow {
  wbs_id: string;
  parent_id?: string;
  name: string;
  owner?: string;
  planned_start?: string;
  planned_end?: string;
}

export interface ExtractedRisk {
  id: string;
  title: string;
  probability: '高' | '中' | '低';
  impact: '高' | '中' | '低';
  trigger: string;
  countermeasure: string;
  escalation?: string;
}

export interface ExtractedDecision {
  id: string;
  date: string;
  decision: string;
  decider: string;
  context: string;
}

export interface ExtractedGlossaryEntry {
  term: string;
  definition: string;
}

export interface ExtractedData {
  charter: ExtractedCharter;
  stakeholders: ExtractedStakeholder[];
  wbs: ExtractedWbsRow[];
  risks: ExtractedRisk[];
  decisions: ExtractedDecision[];
  glossary: ExtractedGlossaryEntry[];
  /** AI が抽出時に検出した不確実箇所・補完が必要な点 */
  notes: string[];
}

/**
 * Claude に渡す JSON スキーマ説明（system prompt の末尾に貼り付け）。
 * 構造化出力を強制するための明示。
 */
export const EXTRACT_JSON_SCHEMA = `
出力は以下の JSON 形式のみを返してください。説明や markdown 装飾は不要、JSON のみ。

\`\`\`json
{
  "charter": {
    "project_id": "（任意）",
    "contract_value": "（任意：例 8.4億円）",
    "period_start": "YYYY-MM-DD（任意）",
    "period_end": "YYYY-MM-DD（任意）",
    "cutover_date": "YYYY-MM-DD（任意）",
    "background": "1〜3 段落の背景",
    "objectives": ["目的1", "目的2", "..."],
    "scope_in": ["スコープ内項目1", "..."],
    "scope_out": ["スコープ外項目1", "..."],
    "milestones": [
      { "id": "M1", "name": "PJ 開始", "date": "YYYY-MM-DD", "status": "done|in_progress|planned" }
    ],
    "success_criteria": [
      { "id": "1", "criterion": "...", "measurement": "..." }
    ],
    "initial_risks": ["憲章時点で想定されるリスク1", "..."]
  },
  "stakeholders": [
    { "side": "client", "role": "経営スポンサー", "name": "..", "org": "..", "engagement": "高", "note": ".." },
    { "side": "vendor", "role": "PM", "name": "..", "org": "..", "engagement": "高", "note": ".." }
  ],
  "wbs": [
    { "wbs_id": "1", "name": "要件定義フェーズ", "owner": "..", "planned_start": "YYYY-MM-DD", "planned_end": "YYYY-MM-DD" },
    { "wbs_id": "1.1", "parent_id": "1", "name": "業務要件ヒアリング", "owner": "..", "planned_start": "..", "planned_end": ".." }
  ],
  "risks": [
    {
      "id": "R-001",
      "title": "...",
      "probability": "高|中|低",
      "impact": "高|中|低",
      "trigger": "...",
      "countermeasure": "...",
      "escalation": "..."
    }
  ],
  "decisions": [
    { "id": "D-001", "date": "YYYY-MM-DD", "decision": "...", "decider": "...", "context": "..." }
  ],
  "glossary": [
    { "term": "...", "definition": "..." }
  ],
  "notes": ["AI が抽出時に不確実だった点や補完が必要な点を列挙"]
}
\`\`\`

抽出できない項目は空配列 [] か空文字列 "" にする（null や undefined は使わない）。
日付は YYYY-MM-DD 形式に正規化する。情報が不足する場合は notes に「要ヒアリング: ...」と記載。
`;

/**
 * Claude から返ってきた文字列から JSON 部分を抽出してパース。
 * ```json ... ``` で囲まれていても抜き出す。
 */
export function parseExtractedJson(raw: string): ExtractedData {
  let s = raw.trim();
  const fenceMatch = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) s = fenceMatch[1].trim();
  // 先頭の余計な文字（"Here's the JSON:" など）を除去
  const jsonStart = s.indexOf('{');
  if (jsonStart > 0) s = s.slice(jsonStart);
  const data = JSON.parse(s);
  return normalizeExtracted(data);
}

function normalizeExtracted(d: any): ExtractedData {
  return {
    charter: {
      project_id: d.charter?.project_id ?? '',
      contract_value: d.charter?.contract_value ?? '',
      period_start: d.charter?.period_start ?? '',
      period_end: d.charter?.period_end ?? '',
      cutover_date: d.charter?.cutover_date ?? '',
      background: d.charter?.background ?? '',
      objectives: d.charter?.objectives ?? [],
      scope_in: d.charter?.scope_in ?? [],
      scope_out: d.charter?.scope_out ?? [],
      milestones: d.charter?.milestones ?? [],
      success_criteria: d.charter?.success_criteria ?? [],
      initial_risks: d.charter?.initial_risks ?? [],
    },
    stakeholders: d.stakeholders ?? [],
    wbs: d.wbs ?? [],
    risks: d.risks ?? [],
    decisions: d.decisions ?? [],
    glossary: d.glossary ?? [],
    notes: d.notes ?? [],
  };
}
