const phases = [
  {
    num: '01',
    name: 'Discovery',
    duration: '1〜2週間',
    human: 100,
    desc: '経営層・PMO 室・既存ツール棚卸し → 対象 PJ 選定',
    deliverables: ['Discovery 報告書', 'PoC PJ 選定書', 'ベースライン KPI'],
  },
  {
    num: '02',
    name: '環境セットアップ',
    duration: '1週間',
    human: 30,
    desc: 'CLI で case-studies/<client>/ 一発生成 → エージェント設定',
    deliverables: ['client-env/ スケルトン (18ファイル)', 'エージェント設定', 'シークレット管理'],
  },
  {
    num: '03',
    name: 'データ統合',
    duration: '2〜3週間',
    human: 50,
    desc: 'Backlog / Slack / Zoom / Box の API 接続、定期ジョブ設定',
    deliverables: ['接続済データパイプライン', '同期ジョブ', '初回バックフィル'],
  },
  {
    num: '04',
    name: 'ローンチ',
    duration: '1週間',
    human: 40,
    desc: 'AI が PJ 全成果物の初稿を一気に生成 → クライアントレビュー → キックオフ',
    deliverables: ['WBS/憲章/課題/議事録/報告書一式', 'キックオフ議事録', '運用ルール'],
  },
  {
    num: '05',
    name: '運用',
    duration: '継続（PoC 3ヶ月）',
    human: 20,
    desc: '日次/週次/月次の運用カデンス。KPI 監視 → 卒業判定',
    deliverables: ['週次/月次成果物', 'KPI 実績', '卒業判定資料'],
  },
];

const toolStack = [
  { layer: 'コア AI', tools: ['Claude API (Opus 4.7)', 'Whisper API'], purpose: 'エージェント本体・音声認識' },
  { layer: '開発', tools: ['Claude Code', 'TypeScript', 'Vite'], purpose: 'リポ実装・自動生成' },
  { layer: 'オーケストレーション', tools: ['n8n', 'GitHub Actions'], purpose: '定期ジョブ・イベント駆動' },
  { layer: 'SaaS 連携', tools: ['MCP サーバー', '各 SaaS API'], purpose: 'Backlog/Slack/Zoom/Box' },
  { layer: '配信', tools: ['Slack', 'Confluence', '専用ビューワー(Render)'], purpose: 'クライアント向け可視化' },
  { layer: 'シークレット', tools: ['Doppler', '1Password'], purpose: 'API キー管理' },
];

const automationMatrix = [
  { category: 'A. 進捗管理・可視化', l4: 50, l3: 50, lower: 0, reduction: '70〜80%' },
  { category: 'B. 課題・リスク管理', l4: 30, l3: 40, lower: 30, reduction: '50〜60%' },
  { category: 'C. ドキュメント管理', l4: 50, l3: 30, lower: 20, reduction: '60〜70%' },
  { category: 'D. 会議・コミュニケーション', l4: 30, l3: 40, lower: 30, reduction: '40〜50%' },
  { category: 'E. コスト・リソース管理', l4: 0, l3: 30, lower: 70, reduction: '20〜30%' },
  { category: 'F. 品質・標準化', l4: 0, l3: 0, lower: 100, reduction: '10〜20%' },
];

const buildTimeline = [
  { step: 1, time: '5分', task: 'リポ骨組み: ai-pmo リポ作成、ディレクトリ設計、CLAUDE.md/README', tool: 'Claude Code' },
  { step: 2, time: '5分', task: 'Obsidian → docs/ 同期スクリプト', tool: 'Claude Code' },
  { step: 3, time: '10分', task: '仮想会社（アクロス・システムズ × M-Mart）の設計創作', tool: 'Claude Code' },
  { step: 4, time: '15分', task: 'PJ 憲章・WBS・スケジュール（md + csv）生成', tool: 'Claude Code' },
  { step: 5, time: '30分', task: '議事録・課題・リスク・週次/月次報告書を整合性持って生成', tool: 'Claude Code' },
  { step: 6, time: '15分', task: '4 エージェント定義（reporter / scribe / watcher / triager）', tool: 'Claude Code' },
  { step: 7, time: '30分', task: 'ビューワー実装（React + Vite + Tailwind SPA）', tool: 'Claude Code' },
  { step: 8, time: '20分', task: 'Render Static Site 設定 + Bootstrap CLI 実装', tool: 'Claude Code' },
];

export default function Methodology() {
  return (
    <div className="space-y-8">
      <section>
        <div className="text-xs uppercase tracking-wide text-brand-700 font-semibold">Methodology</div>
        <h1 className="text-2xl font-bold mt-1">AI PMO はどう構築するか</h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl">
          クライアントの PJ に AI PMO を導入する全工程と、本検証環境（中規模ケース）をどう作ったかの実績を公開しています。
          コンサル提案時の参考資料、社内オンボーディング、AI PMO の透明性確保にお使いください。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">導入 5 フェーズ</h2>
        <div className="grid md:grid-cols-5 gap-3">
          {phases.map((p) => (
            <div key={p.num} className="card p-4 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-brand-600 font-mono">{p.num}</div>
                <span className="badge badge-slate">{p.duration}</span>
              </div>
              <div className="font-semibold mt-2">{p.name}</div>
              <p className="text-xs text-slate-600 mt-2 flex-1">{p.desc}</p>
              <div className="mt-3">
                <div className="text-xs text-slate-500 mb-1">人間の関与: {p.human}%</div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full ${p.human >= 70 ? 'bg-rose-500' : p.human >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${p.human}%` }}
                  />
                </div>
              </div>
              <ul className="mt-3 text-xs text-slate-600 list-disc pl-4 space-y-0.5">
                {p.deliverables.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">
          詳細プレイブック:{' '}
          <a
            href="https://github.com/keitaurano-del/ai-pmo/tree/main/docs/deployment-playbook"
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 hover:underline"
          >
            docs/deployment-playbook/ on GitHub
          </a>
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">AI / ツールスタック</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="text-left px-3 py-2 font-semibold w-40">レイヤ</th>
                <th className="text-left px-3 py-2 font-semibold">ツール</th>
                <th className="text-left px-3 py-2 font-semibold">用途</th>
              </tr>
            </thead>
            <tbody>
              {toolStack.map((t) => (
                <tr key={t.layer} className="border-t border-slate-100">
                  <td className="px-3 py-3 font-semibold">{t.layer}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {t.tools.map((tool) => (
                        <span key={tool} className="badge badge-blue">{tool}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{t.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          詳細・コスト試算:{' '}
          <a
            href="https://github.com/keitaurano-del/ai-pmo/blob/main/docs/deployment-playbook/ai-tool-stack.md"
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 hover:underline"
          >
            ai-tool-stack.md
          </a>
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">自動化マトリクス（業務別）</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">業務カテゴリ</th>
                <th className="text-center px-3 py-2 font-semibold">L4 完全自動</th>
                <th className="text-center px-3 py-2 font-semibold">L3 AI 主導</th>
                <th className="text-center px-3 py-2 font-semibold">L2 以下</th>
                <th className="text-right px-3 py-2 font-semibold">工数削減目安</th>
              </tr>
            </thead>
            <tbody>
              {automationMatrix.map((r) => (
                <tr key={r.category} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium">{r.category}</td>
                  <td className="px-3 py-2 text-center">
                    {r.l4 > 0 ? <span className="badge badge-emerald">{r.l4}%</span> : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {r.l3 > 0 ? <span className="badge badge-blue">{r.l3}%</span> : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {r.lower > 0 ? <span className="badge badge-slate">{r.lower}%</span> : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-semibold text-emerald-700">{r.reduction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          PMO 全体での工数削減期待値: <span className="font-semibold text-slate-700">50〜60%</span>
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">本デモ環境の構築実績（透明性のため公開）</h2>
        <div className="card p-5">
          <p className="text-sm text-slate-600 mb-4">
            このビューワーが見せている <code className="bg-slate-100 px-1 rounded">case-studies/medium/</code> 検証環境は、
            Claude Code (Opus 4.7) と人間（凜・Keita）の協働で <strong>合計 2 時間弱</strong>で構築されました。
            各工程の実績：
          </p>
          <ol className="space-y-2">
            {buildTimeline.map((t) => (
              <li key={t.step} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                <span className="text-brand-600 font-mono font-bold w-6">{t.step}</span>
                <span className="text-xs text-slate-500 font-mono w-16 mt-0.5">{t.time}</span>
                <span className="flex-1 text-sm">{t.task}</span>
                <span className="badge badge-blue text-xs">{t.tool}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 pt-4 border-t border-slate-200 text-sm text-slate-700">
            <strong>本番クライアント環境</strong>では、Discovery と統合作業が加わるため約 5 ヶ月。
            ただし「箱を作る」工程は CLI 化済みで、提案当日に即実演可能。
          </div>
        </div>
      </section>

      <section className="card p-6 bg-gradient-to-br from-brand-50 to-white">
        <h2 className="text-lg font-bold mb-2">CLI による「動くデモ」</h2>
        <p className="text-sm text-slate-700 mb-3">
          クライアント提案の場で、その会社用の AI PMO 環境を 1 コマンドで生成できます：
        </p>
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{`$ npm run init -- --interactive
? クライアント slug: spring-foods
? クライアント正式社名: 春日フーズ株式会社
? 規模: medium
✓ case-studies/spring-foods/README.md
✓ case-studies/spring-foods/company-profile.md
✓ ... (18 ファイル)

✅ 完了！ 18 ファイル, 18.4 KB`}</code>
        </pre>
        <p className="text-xs text-slate-500 mt-3">
          CLI 詳細:{' '}
          <a
            href="https://github.com/keitaurano-del/ai-pmo/blob/main/scripts/README.md"
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 hover:underline"
          >
            scripts/README.md
          </a>
        </p>
      </section>
    </div>
  );
}
