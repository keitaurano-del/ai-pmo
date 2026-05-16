import Papa from 'papaparse';

// すべて build 時に bundle される (import.meta.glob with eager + raw)
const meetingMd = import.meta.glob('../../../case-studies/medium/client-env/04-meetings/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const reportMd = import.meta.glob('../../../case-studies/medium/client-env/07-reports/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const charterMd = import.meta.glob('../../../case-studies/medium/client-env/01-charter/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const contextMd = import.meta.glob('../../../case-studies/medium/client-env/00-context/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const scheduleMd = import.meta.glob('../../../case-studies/medium/client-env/03-schedule/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const wbsMd = import.meta.glob('../../../case-studies/medium/client-env/02-wbs/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const riskMd = import.meta.glob('../../../case-studies/medium/client-env/06-risks/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const issueMd = import.meta.glob('../../../case-studies/medium/client-env/05-issues/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const decisionMd = import.meta.glob('../../../case-studies/medium/client-env/08-decisions/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const wbsCsvRaw = import.meta.glob('../../../case-studies/medium/client-env/02-wbs/*.csv', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const issuesCsvRaw = import.meta.glob('../../../case-studies/medium/client-env/05-issues/*.csv', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const caseRootMd = import.meta.glob('../../../case-studies/medium/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export interface MdDoc {
  slug: string;
  filename: string;
  title: string;
  date: string | null;
  body: string;
}

function toDoc(path: string, body: string): MdDoc {
  const filename = path.split('/').pop() ?? path;
  const slug = filename.replace(/\.md$/, '');
  const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2}|\d{4}-W\d{2}|\d{4}-\d{2})/);
  const date = dateMatch ? dateMatch[1] : null;
  const titleLine = body.split('\n').find((l) => l.startsWith('# '));
  const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : slug;
  return { slug, filename, title, date, body };
}

function collectDocs(map: Record<string, string>): MdDoc[] {
  return Object.entries(map)
    .map(([p, body]) => toDoc(p, body))
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}

export const meetings = collectDocs(meetingMd);
export const reports = collectDocs(reportMd);
export const charter = collectDocs(charterMd);
export const contexts = collectDocs(contextMd);
export const schedule = collectDocs(scheduleMd);
export const wbsDocs = collectDocs(wbsMd);
export const riskDocs = collectDocs(riskMd);
export const issueDocs = collectDocs(issueMd);
export const decisionDocs = collectDocs(decisionMd);
export const caseRootDocs = collectDocs(caseRootMd);

export interface WbsRow {
  wbs_id: string;
  parent_id: string;
  name: string;
  owner: string;
  planned_start: string;
  planned_end: string;
  actual_start: string;
  actual_end: string;
  progress_pct: number;
  status: string;
  depends_on: string;
  backlog_id: string;
  depth: number;
  children: WbsRow[];
}

function parseCsv<T extends Record<string, string>>(raw: string): T[] {
  const parsed = Papa.parse<T>(raw, {
    header: true,
    skipEmptyLines: true,
    transform: (v) => v.trim(),
  });
  return parsed.data;
}

function loadWbs(): WbsRow[] {
  const raw = Object.values(wbsCsvRaw)[0];
  if (!raw) return [];
  const rows = parseCsv<Record<string, string>>(raw).map((r) => ({
    wbs_id: r.wbs_id,
    parent_id: r.parent_id ?? '',
    name: r.name,
    owner: r.owner ?? '',
    planned_start: r.planned_start ?? '',
    planned_end: r.planned_end ?? '',
    actual_start: r.actual_start ?? '',
    actual_end: r.actual_end ?? '',
    progress_pct: Number(r.progress_pct || 0),
    status: r.status ?? '',
    depends_on: r.depends_on ?? '',
    backlog_id: r.backlog_id ?? '',
    depth: r.wbs_id.split('.').length - 1,
    children: [] as WbsRow[],
  }));
  const map = new Map<string, WbsRow>();
  rows.forEach((r) => map.set(r.wbs_id, r));
  const roots: WbsRow[] = [];
  rows.forEach((r) => {
    if (r.parent_id && map.has(r.parent_id)) {
      map.get(r.parent_id)!.children.push(r);
    } else {
      roots.push(r);
    }
  });
  return roots;
}

export interface IssueRow {
  issue_id: string;
  title: string;
  priority: 'High' | 'Mid' | 'Low' | string;
  status: string;
  category: string;
  opened_date: string;
  due_date: string;
  owner: string;
  reporter: string;
  wbs_id: string;
  backlog_id: string;
}

function loadIssues(): IssueRow[] {
  const raw = Object.values(issuesCsvRaw)[0];
  if (!raw) return [];
  const rows = parseCsv<Record<string, string>>(raw);
  return rows.map((r) => ({
    issue_id: r.issue_id,
    title: r.title,
    priority: r.priority,
    status: r.status,
    category: r.category,
    opened_date: r.opened_date,
    due_date: r.due_date,
    owner: r.owner,
    reporter: r.reporter,
    wbs_id: r.wbs_id ?? '',
    backlog_id: r.backlog_id ?? '',
  }));
}

export const wbsTree = loadWbs();
export const wbsFlat = (() => {
  const out: WbsRow[] = [];
  const walk = (rows: WbsRow[]) => {
    rows.forEach((r) => {
      out.push(r);
      walk(r.children);
    });
  };
  walk(wbsTree);
  return out;
})();

export const issues = loadIssues();

// プロジェクト基本メタデータ
export const project = {
  name: 'NEXUS-RTL',
  fullName: 'M-Mart 基幹システム刷新プロジェクト',
  client: '株式会社 M-Mart',
  vendor: 'アクロス・システムズ株式会社',
  pm: '岡本 雅彦',
  pmoLead: '森下 美咲（PMO 室長）',
  pmoOps: '久野 蓮（PMO シニア）',
  phase: 'Phase 1 — 要件定義',
  pocStart: '2026-04-01',
  pocEnd: '2026-06-30',
  cutover: '2027-01-04',
  referenceDate: '2026-05-15',
  contractValue: '8.4億円',
};

export const kpis = [
  { label: '全体進捗（重み付）', value: '22%', delta: '+1.8pt', tone: 'good' as const, sub: '計画 24% / 差 -2pt' },
  { label: '要件定義フェーズ進捗', value: '90%', delta: '+2pt', tone: 'good' as const, sub: 'M2: 2026-05-30 予定' },
  { label: 'オープン課題', value: '14', delta: '-2', tone: 'good' as const, sub: 'High 2 / Mid 6 / Low 6' },
  { label: '重点監視リスク', value: '1', delta: '+0', tone: 'warn' as const, sub: 'R-007 販促系遅延' },
  { label: '週次報告書 作成工数', value: '0.8h/週', delta: '-3.2h', tone: 'good' as const, sub: '目標: 1h 以下' },
  { label: '議事録 確定リードタイム', value: '4h', delta: '-2.0d', tone: 'good' as const, sub: '目標: 当日中' },
];

export const milestones = [
  { id: 'M1', name: 'PJ 開始', date: '2026-02-01', status: 'done' },
  { id: 'M2', name: '要件定義完了', date: '2026-05-30', status: 'at_risk' },
  { id: 'M3', name: '基本設計完了', date: '2026-08-15', status: 'planned' },
  { id: 'M4', name: '詳細設計完了', date: '2026-09-30', status: 'planned' },
  { id: 'M5', name: '開発完了', date: '2026-11-30', status: 'planned' },
  { id: 'M6', name: '結合テスト完了', date: '2026-12-25', status: 'planned' },
  { id: 'M7', name: 'パラレル稼働開始', date: '2026-11-01', status: 'planned' },
  { id: 'M8', name: 'カットオーバー', date: '2027-01-04', status: 'planned' },
  { id: 'M9', name: '安定稼働確認', date: '2027-03-31', status: 'planned' },
];

export const risks = [
  {
    id: 'R-007',
    title: '販促系要件定義の遅延がクリティカルパスに波及',
    p: '高',
    i: '高',
    score: 'High×High',
    tone: 'red' as const,
    trigger: 'ISS-024 が 5/16 までに完了しないこと',
    countermeasure: 'M-Mart 西野部長との週次レビュー枠を固定化、岡本 PM 直接フォロー',
    escalation: '矢島本部長',
  },
  {
    id: 'R-009',
    title: 'M-Mart 情シスのセキュリティ方針未確定',
    p: '中',
    i: '高',
    score: 'Mid×High',
    tone: 'amber' as const,
    trigger: 'ISS-031 が 5/14 すり合わせ会で方針合意できないこと',
    countermeasure: '真壁アーキが事前に複数選択肢を整理して持ち込み、その場で意思決定を促す',
    escalation: 'M-Mart 田所 CIO',
  },
  {
    id: 'R-005',
    title: 'Java エンジニア要員確保（10月開発フェーズ開始時）',
    p: '中',
    i: '高',
    score: 'Mid×High',
    tone: 'amber' as const,
    trigger: '6月末までに 12名体制が見えないこと',
    countermeasure: '社内アサイン交渉 + 外部 SES 候補 3社と事前接触',
    escalation: '矢島本部長 / 三田村営業部長',
  },
  {
    id: 'R-008',
    title: '既存基幹（COBOL）の暗黙仕様逆引き困難',
    p: '高',
    i: '中',
    score: 'High×Mid',
    tone: 'amber' as const,
    trigger: '業務ヒアリングで仕様未確定箇所が積み残ること',
    countermeasure: 'M-Mart 退職 OB を業務委託で確保（4月から月8時間）',
    escalation: 'M-Mart 牧野部長',
  },
];
