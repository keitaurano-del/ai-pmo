# scripts/agents/ — AI PMO エージェント実装

`agents/<agent>-agent.md` のプロンプト仕様を、実際に Claude API で動かす TypeScript 実装。

## 実装済みエージェント

| 名前 | 入力 | 出力 |
|------|------|------|
| `scribe` | 会議 transcript (txt) | `client-env/04-meetings/YYYY-MM-DD_generated.md` |
| `reporter` | （case の全成果物を自動収集） | `client-env/07-reports/YYYY-Wnn_weekly-report.md` |

未実装（agents/ にプロンプトのみ）: `watcher`, `triager`

## 使い方

```bash
# 登録エージェント一覧
npm run agent -- list

# scribe を dry-run（API キー不要、プロンプトと出力先のみ表示）
npm run agent -- run scribe --client medium --dry-run

# scribe を本実行（要 ANTHROPIC_API_KEY）
export ANTHROPIC_API_KEY=sk-ant-...
npm run agent -- run scribe --client medium --input /tmp/zoom-transcript.txt

# reporter を本実行（case の全成果物から週次レポート生成）
npm run agent -- run reporter --client medium

# ヘルプ
npm run agent -- --help
```

## ファイル構成

```
scripts/agents/
├── README.md
├── run.ts                  # CLI エントリポイント (npm run agent)
├── types.ts                # Agent 共通型
├── scribe.ts               # scribe-agent 実装
├── reporter.ts             # reporter-agent 実装
└── lib/
    ├── client.ts           # Claude API クライアント（遅延初期化）
    └── io.ts               # ファイルパス・読み書きヘルパ
```

## 動作モード

### dry-run（推奨：開発・デモ時）
- `--dry-run` フラグを付ける
- Claude API は呼ばれない
- プロンプト（先頭 500 字）と出力先パスを表示
- API キー不要、課金なし

### 本実行
- `ANTHROPIC_API_KEY` 環境変数が必要
- Claude Opus 4.7 (default) で生成
- 生成物を実ファイルに書き込み
- 1 回あたりの目安: input 5,000 tokens + output 2,000 tokens 程度（reporter は約 $0.20）

## 入力ファイルの渡し方

scribe は `--input` で transcript ファイルを指定可：

```bash
# Zoom から DL した字幕ファイルなど
npm run agent -- run scribe --client medium --input ~/Downloads/zoom-2026-05-15.vtt
```

`--input` 省略時は **内蔵サンプル transcript**（M-Mart 週次定例の模擬）を使う、デモ用。

## エージェント追加方法

1. `agents/<name>-agent.md` にプロンプト仕様を書く（このリポの既存例を参考）
2. `scripts/agents/<name>.ts` を作成、`Agent` interface を満たす
3. `scripts/agents/run.ts` の `agents` レジストリに追加
4. `npm run agent -- list` で表示確認

## 本番運用への展開

CLI 実装をベースに、以下のラッパーを作って定期実行できる：

- **GitHub Actions**: 月曜 06:00 JST に `npm run agent -- run reporter --client xxx` を cron 実行
- **n8n**: Zoom Webhook → `npm run agent -- run scribe --client xxx --input ...` を起動
- **MCP サーバー**: 既存 SaaS との接続を MCP に寄せ、エージェントから tool 呼び出し

詳細は `docs/deployment-playbook/03-integration.md` を参照。
