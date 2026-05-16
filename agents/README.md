# agents/ — AI PMO エージェント定義

各エージェントの役割・I/O・プロンプト雛形を1ファイル1エージェントで管理。
実装段階では Claude API or Claude Code subagent として呼び出される想定。

## エージェント一覧（Phase 1 MVP）

| ファイル | エージェント名 | 主機能 |
|----------|----------------|--------|
| [reporter-agent.md](./reporter-agent.md) | レポーター | 進捗集約・WBS更新・週次/月次報告書作成 |
| [scribe-agent.md](./scribe-agent.md) | スクライブ | 議事録生成・決定事項抽出 |
| [watcher-agent.md](./watcher-agent.md) | ウォッチャー | 遅延・停滞検知・課題自動起票・リスク予兆 |
| [triager-agent.md](./triager-agent.md) | トリアージャー | 課題分類・優先度付け・担当者割当提案 |

## Phase 2 以降の追加候補

- リスクアナリスト（risk-analyst-agent）
- オーケストレーター（pmo-orchestrator-agent）
- ドキュメントレビュアー（doc-reviewer-agent）
- コミュニケーター（communicator-agent）

詳細は `docs/pmo-roles-map.md` を参照。

## 共通仕様

各エージェントファイルは以下のセクションを持つ：

1. **役割** — 1行サマリ
2. **入力（読み取り対象）** — 何を見るか
3. **出力（書き込み対象）** — 何をどこに書くか
4. **トリガー** — どのタイミングで起動するか
5. **プロンプト雛形** — system / user メッセージのスケルトン
6. **人間レビューの観点** — どこを人が確認すべきか
