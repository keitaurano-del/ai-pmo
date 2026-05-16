import Papa from 'papaparse';

// すべての case-studies/*/client-env/ 配下を build 時にバンドルし、case slug ごとに振り分ける

const allMeetings = import.meta.glob('../../../case-studies/*/client-env/04-meetings/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const allReports = import.meta.glob('../../../case-studies/*/client-env/07-reports/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const allCharter = import.meta.glob('../../../case-studies/*/client-env/01-charter/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const allContext = import.meta.glob('../../../case-studies/*/client-env/00-context/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const allSchedule = import.meta.glob('../../../case-studies/*/client-env/03-schedule/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const allWbsMd = import.meta.glob('../../../case-studies/*/client-env/02-wbs/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const allRisk = import.meta.glob('../../../case-studies/*/client-env/06-risks/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const allIssueMd = import.meta.glob('../../../case-studies/*/client-env/05-issues/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const allDecision = import.meta.glob('../../../case-studies/*/client-env/08-decisions/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const allWbsCsv = import.meta.glob('../../../case-studies/*/client-env/02-wbs/*.csv', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const allIssuesCsv = import.meta.glob('../../../case-studies/*/client-env/05-issues/*.csv', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const caseReadme = import.meta.glob('../../../case-studies/*/README.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const companyProfile = import.meta.glob('../../../case-studies/*/company-profile.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function extractSlug(path: string): string {
  const m = path.match(/case-studies\/([^/]+)\//);
  return m ? m[1] : 'unknown';
}

function groupBySlug(map: Record<string, string>): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const [path, body] of Object.entries(map)) {
    const slug = extractSlug(path);
    if (!out[slug]) out[slug] = {};
    out[slug][path] = body;
  }
  return out;
}

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

function loadWbs(csvByPath: Record<string, string>): WbsRow[] {
  const raw = Object.values(csvByPath)[0];
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

function flattenWbs(tree: WbsRow[]): WbsRow[] {
  const out: WbsRow[] = [];
  const walk = (rows: WbsRow[]) => {
    rows.forEach((r) => {
      out.push(r);
      walk(r.children);
    });
  };
  walk(tree);
  return out;
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

function loadIssues(csvByPath: Record<string, string>): IssueRow[] {
  const raw = Object.values(csvByPath)[0];
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

export interface ProjectMeta {
  name: string;
  fullName: string;
  client: string;
  vendor: string;
  pm: string;
  pmoLead: string;
  pmoOps: string;
  phase: string;
  pocStart: string;
  pocEnd: string;
  cutover: string;
  referenceDate: string;
  contractValue: string;
  industry: string;
  sizeSegment: string;
}

export interface KpiCard {
  label: string;
  value: string;
  delta: string;
  tone: 'good' | 'warn' | 'neutral';
  sub: string;
}

export interface Milestone {
  id: string;
  name: string;
  date: string;
  status: 'done' | 'at_risk' | 'planned';
}

export interface RiskCard {
  id: string;
  title: string;
  p: string;
  i: string;
  score: string;
  tone: 'red' | 'amber';
  trigger: string;
  countermeasure: string;
  escalation: string;
}

export interface CaseData {
  slug: string;
  displayName: string;
  isDemo: boolean; // true なら medium のような rich データ持ち
  project: ProjectMeta;
  meetings: MdDoc[];
  reports: MdDoc[];
  charter: MdDoc[];
  contexts: MdDoc[];
  schedule: MdDoc[];
  wbsDocs: MdDoc[];
  riskDocs: MdDoc[];
  issueDocs: MdDoc[];
  decisionDocs: MdDoc[];
  wbsTree: WbsRow[];
  wbsFlat: WbsRow[];
  issues: IssueRow[];
  kpis?: KpiCard[];
  milestones?: Milestone[];
  risks?: RiskCard[];
}

// ─── medium ケース固定メタデータ ───────────────────────
const mediumExtra: Partial<CaseData> = {
  kpis: [
    { label: '全体進捗（重み付）', value: '22%', delta: '+1.8pt', tone: 'good', sub: '計画 24% / 差 -2pt' },
    { label: '要件定義フェーズ進捗', value: '90%', delta: '+2pt', tone: 'good', sub: 'M2: 2026-05-30 予定' },
    { label: 'オープン課題', value: '14', delta: '-2', tone: 'good', sub: 'High 2 / Mid 6 / Low 6' },
    { label: '重点監視リスク', value: '1', delta: '+0', tone: 'warn', sub: 'R-007 販促系遅延' },
    { label: '週次報告書 作成工数', value: '0.8h/週', delta: '-3.2h', tone: 'good', sub: '目標: 1h 以下' },
    { label: '議事録 確定リードタイム', value: '4h', delta: '-2.0d', tone: 'good', sub: '目標: 当日中' },
  ],
  milestones: [
    { id: 'M1', name: 'PJ 開始', date: '2026-02-01', status: 'done' },
    { id: 'M2', name: '要件定義完了', date: '2026-05-30', status: 'at_risk' },
    { id: 'M3', name: '基本設計完了', date: '2026-08-15', status: 'planned' },
    { id: 'M4', name: '詳細設計完了', date: '2026-09-30', status: 'planned' },
    { id: 'M5', name: '開発完了', date: '2026-11-30', status: 'planned' },
    { id: 'M6', name: '結合テスト完了', date: '2026-12-25', status: 'planned' },
    { id: 'M7', name: 'パラレル稼働開始', date: '2026-11-01', status: 'planned' },
    { id: 'M8', name: 'カットオーバー', date: '2027-01-04', status: 'planned' },
    { id: 'M9', name: '安定稼働確認', date: '2027-03-31', status: 'planned' },
  ],
  risks: [
    {
      id: 'R-007',
      title: '販促系要件定義の遅延がクリティカルパスに波及',
      p: '高',
      i: '高',
      score: 'High×High',
      tone: 'red',
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
      tone: 'amber',
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
      tone: 'amber',
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
      tone: 'amber',
      trigger: '業務ヒアリングで仕様未確定箇所が積み残ること',
      countermeasure: 'M-Mart 退職 OB を業務委託で確保（4月から月8時間）',
      escalation: 'M-Mart 牧野部長',
    },
  ],
};

const mediumProject: ProjectMeta = {
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
  industry: '受託システム開発（SIer）',
  sizeSegment: 'medium',
};

// README.md から簡易メタデータを抽出
function parseReadmeMeta(readmeBody: string, slug: string): Partial<ProjectMeta> {
  const meta: Partial<ProjectMeta> = {};
  const lines = readmeBody.split('\n');
  for (const line of lines) {
    const m = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/);
    if (!m) continue;
    const key = m[1].trim();
    const value = m[2].trim();
    if (value === '内容' || value === '---' || value.includes('---')) continue;
    if (key === 'クライアント' || key === '社名') meta.client = value;
    if (key === '業種') meta.industry = value;
    if (key === '規模セグメント' || key === '規模') meta.sizeSegment = value;
    if (key === 'ベンダー（御社）' || key === 'ベンダー') meta.vendor = value;
    if (key === 'PM') meta.pm = value;
    if (key === 'PoC 期間') {
      const [s, e] = value.split('〜').map((x) => x.trim());
      if (s) meta.pocStart = s;
      if (e) meta.pocEnd = e;
    }
    if (key === 'カットオーバー予定') meta.cutover = value;
    if (key.startsWith('プロジェクト')) {
      const parts = value.split('—').map((x) => x.trim());
      if (parts.length >= 2) {
        meta.name = parts[0];
        meta.fullName = parts[1];
      }
    }
  }
  if (!meta.client) meta.client = slug;
  return meta;
}

// case slug → CaseData の組み立て
function buildCase(slug: string): CaseData {
  const meetingsMap = groupBySlug(allMeetings)[slug] ?? {};
  const reportsMap = groupBySlug(allReports)[slug] ?? {};
  const charterMap = groupBySlug(allCharter)[slug] ?? {};
  const contextMap = groupBySlug(allContext)[slug] ?? {};
  const scheduleMap = groupBySlug(allSchedule)[slug] ?? {};
  const wbsMap = groupBySlug(allWbsMd)[slug] ?? {};
  const riskMap = groupBySlug(allRisk)[slug] ?? {};
  const issueMdMap = groupBySlug(allIssueMd)[slug] ?? {};
  const decisionMap = groupBySlug(allDecision)[slug] ?? {};
  const wbsCsvMap = groupBySlug(allWbsCsv)[slug] ?? {};
  const issuesCsvMap = groupBySlug(allIssuesCsv)[slug] ?? {};
  const readmeMap = groupBySlug(caseReadme)[slug] ?? {};
  const profileMap = groupBySlug(companyProfile)[slug] ?? {};

  const wbsTree = loadWbs(wbsCsvMap);
  const wbsFlat = flattenWbs(wbsTree);
  const issues = loadIssues(issuesCsvMap);

  const isDemo = slug === 'medium';

  let project: ProjectMeta;
  if (isDemo) {
    project = mediumProject;
  } else {
    const readmeBody = Object.values(readmeMap)[0] ?? '';
    const meta = parseReadmeMeta(readmeBody, slug);
    project = {
      name: meta.name ?? slug.toUpperCase(),
      fullName: meta.fullName ?? '',
      client: meta.client ?? slug,
      vendor: meta.vendor ?? 'アクロス・システムズ株式会社',
      pm: meta.pm ?? '未設定',
      pmoLead: '未設定',
      pmoOps: '未設定',
      phase: 'Phase 1 — セットアップ',
      pocStart: meta.pocStart ?? '',
      pocEnd: meta.pocEnd ?? '',
      cutover: meta.cutover ?? '',
      referenceDate: '',
      contractValue: '未確定',
      industry: meta.industry ?? '',
      sizeSegment: meta.sizeSegment ?? 'medium',
    };
  }

  const displayName = Object.values(profileMap)[0]
    ? toDoc(Object.keys(profileMap)[0], Object.values(profileMap)[0]).title.replace(/^クライアント企業プロファイル\s*—\s*/, '')
    : project.client;

  return {
    slug,
    displayName,
    isDemo,
    project,
    meetings: collectDocs(meetingsMap),
    reports: collectDocs(reportsMap),
    charter: collectDocs(charterMap),
    contexts: collectDocs(contextMap),
    schedule: collectDocs(scheduleMap),
    wbsDocs: collectDocs(wbsMap),
    riskDocs: collectDocs(riskMap),
    issueDocs: collectDocs(issueMdMap),
    decisionDocs: collectDocs(decisionMap),
    wbsTree,
    wbsFlat,
    issues,
    ...(isDemo ? mediumExtra : {}),
  };
}

// 全 case を発見
const ALL_SLUGS = Array.from(new Set(Object.keys(caseReadme).map(extractSlug))).sort((a, b) => {
  // medium を先頭、それ以外 alpha
  if (a === 'medium') return -1;
  if (b === 'medium') return 1;
  return a.localeCompare(b);
});

export const cases: Record<string, CaseData> = Object.fromEntries(
  ALL_SLUGS.map((slug) => [slug, buildCase(slug)]),
);

export const caseList = ALL_SLUGS.map((slug) => ({
  slug,
  displayName: cases[slug].displayName,
  isDemo: cases[slug].isDemo,
}));

export const DEFAULT_CASE = 'medium';

export function getCase(slug: string | undefined): CaseData {
  if (!slug || !cases[slug]) return cases[DEFAULT_CASE];
  return cases[slug];
}
