# Phase 3: データ統合（2〜3週間）

## 目的

AI PMO エージェントが **クライアントの実データを読み書き** できるよう、
各 SaaS との API 接続・同期ジョブ・初回バックフィルを完了させる。

## 期間

- 標準: 2〜3週間（接続対象数に比例）
- 通常 4〜6 SaaS で 10〜15 営業日

## 担当

- **AI PMO エンジニア 1.5名**
- クライアント側: 情シス担当（API キー発行）

## 連携対象（標準セット）

| # | システム | 目的 | 接続方式 | 工数目安 |
|---|----------|------|---------|----------|
| 1 | Backlog / Jira | タスク・進捗 read | REST API | 2 日 |
| 2 | Slack | 投稿監視・通知配信 | Bot Token + Events API | 2 日 |
| 3 | Zoom | 会議録音・字幕 | Webhook | 1 日 |
| 4 | Box / Google Drive | ドキュメント read | OAuth | 2 日 |
| 5 | Confluence / Notion | レポート配信 write | API | 2 日 |
| 6 | TeamSpirit / 工数 | CSV エクスポート手動 | 手動運用 | 0.5 日 |

合計接続作業: **約 9.5 日**（並列化で 5〜7 営業日に圧縮可能）

## 標準フロー

### Week 1: API キー発行・接続テスト

#### Day 1〜2: API キー / OAuth クライアント発行

クライアント情シスに依頼するもの一覧：

- Backlog: スペース管理者からアプリ API キー発行
- Slack: ワークスペース管理者から Bot App 作成、必要な scope 付与（`channels:history`, `chat:write`, `files:read` 等）
- Zoom: 管理者から Webhook 用 App 作成
- Box: 管理者から OAuth クライアント発行
- Confluence: スペース権限 + API トークン
- TeamSpirit: 月次 CSV 出力フロー確認

→ Doppler / 1Password に登録

#### Day 3〜4: 接続テストスクリプト実行

各 SaaS への疎通を確認する Node スクリプトを順次実行：

```bash
npm run integration:test -- --service backlog --client spring-foods
npm run integration:test -- --service slack --client spring-foods
...
```

接続成功すると `client-env/00-context/integrations.md` の **状態** が「接続済」に更新される。

#### Day 5: MCP サーバー設定（任意）

公式 MCP サーバーが提供されている SaaS については、AI エージェントから直接ツール呼び出し可能：

- GitHub MCP
- Notion MCP
- Slack MCP（コミュニティ）

MCP 化することで、AI エージェントの実装コードが大幅削減（カスタム API クライアント不要）。

### Week 2: 初回バックフィル + 同期ジョブ設定

#### Day 6〜8: 初回バックフィル

過去データを AI PMO の管理対象に取り込む：

- Backlog: 過去 6ヶ月分のチケット
- Slack: 過去 1ヶ月分の対象チャンネル投稿
- Box: PJ フォルダ配下の全ドキュメント
- Zoom: 過去 1ヶ月の会議録音（同意取得済の範囲）

→ 取り込んだデータを基に AI が **過去 1ヶ月の振り返りレポート** を生成
→ クライアントとレビューして AI の理解度を確認

#### Day 9〜11: 同期ジョブ設定

定期同期ジョブを cron / n8n / Zapier で設定：

| ジョブ | 頻度 | トリガー |
|--------|------|---------|
| backlog_sync | 15分 | cron */15 * * * * |
| slack_listen | 常駐 | Slack Events API |
| zoom_minutes | イベント | Zoom Webhook |
| weekly_report_gen | 週次 | 月曜 06:00 JST |
| monthly_report_gen | 月次 | 月初 06:00 JST |
| daily_issue_triage | 日次 | 18:00 JST |

n8n（OSS）を推奨。Docker 1コマンドで起動可能、UI で可視管理。

#### Day 12〜13: 監視 + アラート設定

- ジョブ失敗時の Slack 通知（#ai-pmo-alerts チャンネル）
- API レート制限の監視
- AI 生成物の確信度低下アラート

### Week 3 (前半): 統合テスト + バッファ

#### Day 14〜15: エンドツーエンドテスト

- 模擬会議を Zoom で開催 → 議事録自動生成 → Slack 通知 までを通しテスト
- 模擬課題を Backlog に起票 → 自動トリアージ → 担当通知 までを通しテスト
- 週次レポート手動トリガー → 出力品質確認

## 落とし穴と対処

| 落とし穴 | 対処 |
|----------|------|
| API レート制限に引っかかる | 同期頻度を下げる、キャッシュ層を入れる |
| 顧客先 IT 統制で外部 API NG | オンプレ AI PMO サーバー（VPC 内デプロイ）を提案 |
| Slack の Bot 招待を全チャンネルで取れない | 公開チャンネル絞り込み + DM での週次サマリ配信に切替 |
| Zoom の字幕精度が低い | 録音ファイル + Whisper API で再認識 |
| Confluence の権限階層が複雑 | レポート配信先を Slack DM + ファイル添付に変更 |

## チェックリスト

- [ ] 全 SaaS で API キー発行 + Doppler 登録完了
- [ ] 接続テスト全件 PASS
- [ ] 初回バックフィル完了
- [ ] 同期ジョブ稼働開始
- [ ] 監視アラート設定完了
- [ ] E2E テスト PASS
- [ ] クライアント情シスとの連携完了確認 MTG

## アウトプット

- 接続済の AI PMO データパイプライン
- 過去データを使った初回振り返りレポート
- n8n / cron で動く定期同期ジョブ
- 監視・アラート基盤

## 次フェーズへ

✅ 全データパイプライン稼働
✅ AI が過去データから現状を把握済
✅ クライアントが「動き始めた」感覚を持っている

→ **Phase 4: ローンチ** へ。
