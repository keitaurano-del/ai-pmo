# scripts/ — AI PMO ツール群

リポ root から `npm run` で叩く。

## bootstrap-client.ts

新規クライアント環境を `case-studies/<slug>/` 配下に一発生成する CLI。
クライアント提案時の **動くデモ** としても使える（生成過程をその場で見せられる）。

### 使い方

```bash
# 対話モード（初めて触る人向け）
npm run init -- --interactive

# 引数指定で一発生成
npm run init -- \
  --slug spring-foods \
  --name "春日フーズ株式会社" \
  --industry "食品製造" \
  --size medium \
  --vendor "アクロス・システムズ株式会社" \
  --project-name "SAKURA" \
  --project-full-name "受発注システム刷新プロジェクト" \
  --pm "山田 太郎"

# 何ができるか先に見たい（書き込まない）
npm run init -- --slug demo --name "デモ株式会社" --dry-run

# ヘルプ
npm run init -- --help
```

### 生成されるもの

```
case-studies/<slug>/
├── README.md                          # 設定サマリ + 次のアクション
├── company-profile.md                 # 企業プロファイル（要ヒアリング埋め）
├── ai-pmo-deployment.md               # AI PMO 導入計画
└── client-env/
    ├── README.md
    ├── 00-context/
    │   ├── stakeholders.md
    │   ├── glossary.md
    │   └── integrations.md            # データソース接続設計
    ├── 01-charter/project-charter.md
    ├── 02-wbs/{wbs.md, wbs.csv}
    ├── 03-schedule/master-schedule.md
    ├── 04-meetings/_template.md
    ├── 05-issues/{issues.csv, issue-tracker.md}
    ├── 06-risks/risk-register.md
    ├── 07-reports/{_weekly-template.md, _monthly-template.md}
    └── 08-decisions/decision-log.md
```

18 ファイル, 約 18 KB。

### テンプレ変数

| 変数 | 用途 | デフォルト |
|------|------|------------|
| `{{client_slug}}` | kebab-case 識別子 | （必須） |
| `{{client_name}}` | クライアント正式社名 | （必須） |
| `{{client_industry}}` | 業種 | 製造業 |
| `{{size_segment}}` | small / medium / large | medium |
| `{{vendor_name}}` | ベンダー名（御社） | アクロス・システムズ株式会社 |
| `{{project_name}}` | プロジェクト略称 | SAKURA |
| `{{project_full_name}}` | プロジェクト正式名 | 基幹システム刷新プロジェクト |
| `{{pm_name}}` | PM 氏名 | 山田 太郎 |
| `{{poc_start}}` | PoC 開始日 | 本日 |
| `{{poc_end}}` | PoC 終了日 | 3ヶ月後 |
| `{{cutover_date}}` | カットオーバー予定 | 10ヶ月後 |
| `{{reference_date}}` | 基準日 | 本日 |
| `{{generated_at}}` | 生成日時 ISO | 自動 |

`scripts/templates/` 配下のファイル名・内容に `{{var}}` 形式で記述すれば自動置換される。

### テンプレ追加・変更の流れ

1. `scripts/templates/` 配下にファイルを追加（`.tmpl` 拡張子）
2. プレースホルダは `{{snake_case}}` で記述
3. 新しい変数を使うなら `bootstrap-client.ts` の `vars` に追加

## sync-from-obsidian.sh

Obsidian vault (`30-Projects/ai-pmo/`) を `docs/` に rsync するシンプルスクリプト。

```bash
npm run sync:obsidian
```
