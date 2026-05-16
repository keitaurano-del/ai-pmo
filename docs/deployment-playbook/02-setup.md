# Phase 2: 環境セットアップ（1週間）

## 目的

クライアント PJ 用の **AI PMO 作業環境（リポジトリ・フォルダ構造・エージェント設定）** を立ち上げる。
データ統合（Phase 3）の前に「箱」を作るフェーズ。

## 期間

- 標準: 5営業日
- うち実作業: 1日（CLI 実行）+ 4日（カスタマイズ・レビュー）

## 担当

- **AI PMO エンジニア 1名**（主担当）
- **Jr. PMO アナリスト 0.5名**（テンプレ調整）

## 標準フロー

### Day 1: リポジトリ準備 + CLI 実行

ai-pmo リポを clone（または同一リポ内に case-studies/ として追加）して、CLI で環境生成：

```bash
git clone https://github.com/keitaurano-del/ai-pmo.git
cd ai-pmo
npm install
npm run init -- --interactive
```

対話形式で以下を入力：
- クライアント slug（例: `spring-foods`）
- 社名（例: `春日フーズ株式会社`）
- 業種
- 規模（small / medium / large）
- プロジェクト略称・正式名
- PM 氏名

→ **`case-studies/<slug>/` 配下に 18 ファイルが 1 秒未満で生成される。**

### Day 2: 企業プロファイルと PJ 憲章の埋め込み

CLI が生成した雛形に、Phase 1 Discovery で集めた情報を埋める：

- `company-profile.md` — 企業基本情報・既存ツール・スポンサー
- `client-env/01-charter/project-charter.md` — PJ 概要・マイルストーン・成功基準
- `client-env/00-context/stakeholders.md` — クライアント側 + ベンダー側 全ステークホルダー
- `client-env/00-context/glossary.md` — PJ 固有用語（重要！ AI の表記揺れ防止）

**AI 活用**: Discovery レポートを Claude に食わせて初稿を生成（70〜80% 完成度）、人間が確認・修正。

### Day 3: AI エージェント設定

`agents/` 配下のエージェント定義を、対象 PJ 用にカスタマイズ：

- **reporter-agent**: 報告書配信先 / 報告書テンプレ / KPI 定義
- **scribe-agent**: 議事録テンプレ / 機密度フィルタ / 配信ルール
- **watcher-agent**: 検知パターン（業界・チームで異なる Slack 警戒語、停滞日数閾値）
- **triager-agent**: カテゴリマスタ / 優先度判定ルール

エージェント設定は `client-env/00-context/agents-config.yml` に集約（Phase 3 で本格設定）。

### Day 4: シークレット管理基盤の整備

各 SaaS の API キー等を **クライアントごとに独立した名前空間** で管理：

- **推奨**: Doppler または 1Password Secrets Automation
- Doppler の場合: プロジェクト `ai-pmo-<slug>` を作成
- 環境変数命名規則: `{{client_slug}}_{{service}}_token` (例: `spring_foods_backlog_token`)
- アクセス権: AI PMO エンジニアのみ + クライアント側 1 名（緊急時の停止用）

### Day 5: ビューワーセットアップ + 内部レビュー

- ビューワー（`viewer/`）に新しいクライアントを追加
- ローカルで `npm run dev` してフォルダ構造とテンプレ品質を確認
- 必要に応じて Render Static Site を 1 つ追加デプロイ（クライアント専用 URL）
  - URL: `https://ai-pmo-<slug>.onrender.com`
  - パスワード保護（Render の Authentication 機能）でクライアントとのみ共有

内部レビューを行い、Phase 3 移行可否を判定。

## チェックリスト

- [ ] `case-studies/<slug>/` 生成完了
- [ ] company-profile.md / project-charter.md 埋め込み完了
- [ ] stakeholders.md / glossary.md 確定
- [ ] エージェント定義カスタマイズ
- [ ] シークレット管理基盤稼働
- [ ] ビューワーで構造確認
- [ ] クライアントとの 30分レビュー会で確認

## 標準工数

| 作業 | 工数 |
|------|------|
| CLI 実行 | 0.1h |
| プロファイル埋め | 4h（AI 下書き 1h + 人間 3h） |
| エージェント設定 | 6h |
| シークレット基盤 | 2h |
| ビューワー追加 | 2h |
| 内部レビュー | 2h |
| **計** | **約 16h** |

→ Phase 1 と Phase 2 だけで **約 50h** の人件費が発生。
   標準価格 ¥3〜5M はここまでをカバー。

## アウトプット一覧

- `case-studies/<slug>/` 完全な「箱」
- AI エージェント設定ファイル
- シークレット管理プロジェクト（Doppler 等）
- クライアント専用ビューワー URL（任意）

## 次フェーズへ

✅ クライアントから API キー発行プロセスの承諾
✅ Backlog / Slack 等の管理者権限の確認
✅ Phase 3 統合の対象システム最終確定

→ **Phase 3: データ統合** へ。
