# viewer/ — AI PMO ビューワー

`case-studies/medium/client-env/` の仮想クライアント環境を可視化する SPA。

## スタック

- React 18 + TypeScript
- Vite 5（ビルド時に親ディレクトリの md / csv を `import.meta.glob` で取り込み）
- React Router 6
- Tailwind CSS 3
- react-markdown + remark-gfm
- papaparse（CSV パース）

## ローカル開発

```bash
cd viewer
npm install
npm run dev      # http://localhost:5173
```

## ビルド & プレビュー

```bash
npm run build    # dist/ に出力
npm run preview  # http://localhost:4173
```

## デプロイ (Render Static Site)

リポジトリ root の `render.yaml` を Blueprint として読ませる：

1. Render ダッシュボード → **New +** → **Blueprint**
2. `keitaurano-del/ai-pmo` を選択
3. 自動で `ai-pmo-viewer` Static Site が作成される
4. main ブランチへの push で自動デプロイ
5. PR にはプレビュー URL が自動付与される

ビルド設定（render.yaml に記載済）：
- rootDir: `viewer`
- buildCommand: `npm ci && npm run build`
- staticPublishPath: `./dist`
- SPA fallback: `/*` → `/index.html`

## 画面一覧

| パス | 内容 |
|------|------|
| `/` | ダッシュボード（PJ 概要 + KPI + マイルストーン + High 課題 + 重点リスク） |
| `/wbs` | WBS（ツリー / テーブル切替、ステータスフィルタ、進捗バー） |
| `/schedule` | マスタースケジュール（マイルストーン + Markdown） |
| `/issues` | 課題管理表（優先度・カテゴリフィルタ、テーブル + 詳細展開） |
| `/risks` | リスク台帳（重点監視カード + 全文展開） |
| `/decisions` | 意思決定ログ |
| `/meetings` | 議事録一覧 |
| `/meetings/:slug` | 議事録詳細 |
| `/reports` | 報告書一覧 |
| `/reports/:slug` | 報告書詳細 |
| `/charter` | プロジェクト憲章 / ステークホルダー / 用語集（タブ切替） |

## データソース

ビルド時に以下を取り込み（変更したら再ビルド必要）：

- `../case-studies/medium/client-env/01-charter/*.md`
- `../case-studies/medium/client-env/00-context/*.md`
- `../case-studies/medium/client-env/02-wbs/*.{md,csv}`
- `../case-studies/medium/client-env/03-schedule/*.md`
- `../case-studies/medium/client-env/04-meetings/*.md`
- `../case-studies/medium/client-env/05-issues/*.{md,csv}`
- `../case-studies/medium/client-env/06-risks/*.md`
- `../case-studies/medium/client-env/07-reports/*.md`
- `../case-studies/medium/client-env/08-decisions/*.md`

その他の固定メタ（プロジェクト名・KPI 集計・リスクカード）は `src/lib/data.ts` 内で定義。
