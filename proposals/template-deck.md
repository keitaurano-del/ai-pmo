---
marp: true
theme: default
size: 16:9
paginate: true
header: 'AI PMO 導入提案'
footer: '© {{ベンダー企業名}} — Confidential'
style: |
  section {
    font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif;
    background: #ffffff;
    color: #0f172a;
    font-size: 24px;
    padding: 60px 80px;
  }
  section.lead {
    background: linear-gradient(135deg, #3251f0 0%, #1d2e94 100%);
    color: #ffffff;
    text-align: center;
    justify-content: center;
  }
  section.lead h1 {
    font-size: 64px;
    border: none;
  }
  section.lead h2, section.lead p, section.lead strong {
    color: #ffffff;
  }
  h1 {
    color: #1d2e94;
    border-bottom: 4px solid #3251f0;
    padding-bottom: 10px;
    font-size: 40px;
  }
  h2 {
    color: #283fcc;
    font-size: 32px;
  }
  h3 {
    color: #1d2e94;
    font-size: 24px;
  }
  table {
    font-size: 18px;
    border-collapse: collapse;
    width: 100%;
    margin-top: 16px;
  }
  th {
    background: #eef4ff;
    color: #1d2e94;
    padding: 8px 12px;
    border: 1px solid #cbd5e1;
    text-align: left;
  }
  td {
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
  }
  code {
    background: #f1f5f9;
    color: #1d2e94;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }
  pre {
    background: #0f172a;
    color: #f8fafc;
    padding: 16px;
    border-radius: 8px;
    font-size: 0.85em;
  }
  pre code {
    background: transparent;
    color: inherit;
  }
  strong {
    color: #1d2e94;
  }
  blockquote {
    border-left: 4px solid #3251f0;
    padding-left: 16px;
    color: #475569;
    font-style: italic;
  }
  footer, header {
    color: #64748b;
    font-size: 14px;
  }
---

<!-- _class: lead -->
<!-- _footer: '' -->
<!-- _paginate: false -->

# AI PMO 導入提案

## {{クライアント企業名}} 御中

**{{ベンダー企業名}}**
{{提案日}}

---

## 本日の流れ

1. なぜ今 AI PMO か（現状認識）
2. 私たちが提案する AI PMO
3. 期待効果と KPI
4. 導入アプローチ（3 Phase）
5. 体制・スケジュール・価格
6. 事例紹介
7. 次のステップ

---

## なぜ今 AI PMO か — PMO が抱える5つの構造的課題

1. **報告業務の肥大化** — PMO 工数の 30〜40% が定型レポート作成
2. **属人化** — シニア PMO のノウハウが標準化されていない
3. **可視化のラグ** — 月次経営報告まで状況がブラックボックス
4. **PJ 横断ガバナンスの限界** — 同時並走 PJ 数の増加に追いつかない
5. **PMO ジュニア育成コスト** — 戦力化に半年〜1年

→ **AI が定型業務を担うことで、PMO は付加価値業務にシフトできる**

---

## 私たちが提案する「AI PMO」とは

**4 体の AI エージェントが、人間 PMO と協働してプロジェクト管理を実行する仕組み**

```
[ レポーター ]  進捗集約・週次/月次報告書を自動生成
[ スクライブ ]  議事録を会議終了 1 時間以内に確定
[ ウォッチャー ] 遅延・停滞・リスクを 24h 監視・自動アラート
[ トリアージャー ] 課題を分類・優先度付け・担当割当提案
```

すべての成果物は **既存ツール（Backlog / Slack / Confluence）と統合**。
新しいツールを覚える必要なし。

---

## AI PMO で実現すること

| 業務 | 現状 | AI PMO 導入後 |
|------|------|----------------|
| 週次レポート作成 | 4h / 週 / PMO 1名 | **1h / 週**（レビューのみ） |
| 議事録の確定 | 2〜3 営業日後 | **会議当日中** |
| 課題未分類滞留 | 常時 5 件以上 | **1 件以下** |
| 経営層への進捗可視化 | 月次 | **週次（リアルタイム）** |
| 課題の早期発見 | 平均 5 日 | **24 時間以内** |
| PMO ジュニアの戦力化 | 6 ヶ月 | **2 ヶ月**（AI 補助で前倒し） |

---

## 期待される ROI

### 中規模クライアント（PMO 7 名体制、年間 PJ 20 件）の想定

| 項目 | 年額 |
|------|------|
| PMO 工数削減（5名 × 50% × 800万円） | **¥20,000,000 / 年** |
| 経営判断スピード向上による機会損失削減 | **¥10,000,000 / 年**（試算） |
| **削減効果合計** | **¥30,000,000 / 年** |
| AI PMO 導入投資（初期 + 12ヶ月運用） | **¥40,000,000** |
| **2 年目以降の年次効果** | **¥30,000,000 / 年（純益）** |

→ **投資回収期間: 約 1.3 年**

---

## 導入アプローチ（3 Phase）

```
Phase 1: PoC (3ヶ月)        → 1 PJ で検証
  ↓ 卒業判定
Phase 2: 展開 (3〜9ヶ月)    → 月 3〜5 PJ へ拡大
  ↓
Phase 3: 定着 (9〜12ヶ月)    → 全社ガバナンス、PMO 役割再定義
```

各 Phase の終わりに **明示的な卒業判定** を行う。
KPI 未達なら縮退 or 終了。**コミットメントは小さく始める**。

---

## Phase 1: PoC（3ヶ月）詳細

**目的**: 1 つの PJ で AI PMO の効果を実証

| 期間 | アクティビティ |
|------|----------------|
| Week 0 (事前) | Discovery インタビュー（2週）+ 環境セットアップ（1週） |
| Week 1〜2 | データ統合（Backlog / Slack / Zoom / Box 接続） |
| Week 3 | AI 初期生成 + クライアントレビュー + キックオフ |
| Week 4〜12 | 日常運用、週次定例で AI PMO 進捗確認 |
| Week 12 | PoC 卒業判定会議 |

**価格**: ¥11〜18M（規模・連携対象数による）
**御社側工数**: 月 30〜40h（PMO 1〜2 名）

---

## Phase 2: 展開（3〜9ヶ月）

**目的**: PoC で実証した効果を **複数 PJ に展開**

- 月 3〜5 PJ ペースで段階展開
- PMO 室の役割再定義（AI 監督・付加価値業務へ）
- リスクアナリスト・ドキュメントレビュアー等の追加エージェント検討
- 経営ダッシュボード（全 PJ 横串可視化）の構築

**価格**: 月 ¥3〜6M / PJ（規模による）

---

## Phase 3: 定着（9〜12ヶ月）

**目的**: AI PMO を **御社の標準業務プロセス** として組み込む

- 全社ガバナンス確立
- KPI 監視体制の自走化
- AI PMO の運用主体を御社内チームに移管
- 弊社は **アドバイザリー契約** に切替（月 ¥1〜2M）

→ **「弊社がいなくても回る」状態を 12ヶ月で実現**

---

## 必要なデータソース連携

| 用途 | 想定システム | 連携方式 |
|------|--------------|---------|
| タスク・進捗 | Backlog / Jira | API (read) |
| コミュニケーション | Slack / Teams | Bot |
| 会議録音 | Zoom / Teams | Webhook |
| ドキュメント | Box / Confluence | API |
| 工数 | TeamSpirit | CSV |

→ **既存システムに変更を加えず、AI が「読み取る」だけで開始可能**

---

## 体制案

```
御社側                              弊社側
─────────                          ─────────
経営スポンサー  ←──────────→  プロジェクトオーナー
                                     │
PMO 室長  ←─────────────────→  Sr. コンサル
                                     │
PMO 担当（PoC 受け入れ）  ←──→  AI PMO エンジニア
                                     │
対象 PJ の PM  ←──────────→  Jr. PMO アナリスト
                                     │
                            ┌────────┴────────┐
                          AI PMO エージェント群
                  （レポーター / スクライブ / ウォッチャー / トリアージャー）
```

御社側専任工数: **月 30〜50h**
弊社側専任工数: **月 約 130h**（PoC 期間）

---

## 標準スケジュール（PoC まで）

```
契約締結
   │
   ▼ Week 1〜2
Discovery（インタビュー、ツール棚卸し、PoC PJ 選定）
   │
   ▼ Week 3
環境セットアップ（CLI で env 生成、エージェント設定）
   │
   ▼ Week 4〜6
データ統合（API 接続、初回バックフィル）
   │
   ▼ Week 7
ローンチ（初期 AI 生成、クライアントレビュー、キックオフ）
   │
   ▼ Week 8〜19（12週間）
PoC 運用
   │
   ▼ Week 19
卒業判定会議
```

**契約締結から PoC 卒業まで 約 5ヶ月**

---

## 価格（PoC 期間まとめ）

| 項目 | 金額 |
|------|------|
| Discovery（Phase 1） | ¥2〜3M |
| 環境セットアップ + データ統合（Phase 2〜3） | ¥3〜5M |
| PoC 運用 3ヶ月（Phase 5） | ¥6〜9M |
| AI API 利用料・SaaS ライセンス（実費） | 月 ¥150,000 |
| **PoC 合計** | **¥11〜18M** |

→ Phase 2 以降は月額契約に切替。**PoC で価値を実証してから本契約**。

---

## 事例紹介: 中堅 SIer × 基幹システム刷新案件

**仮想シナリオ**: 中堅 SIer（社員 300名・PMO 7名）が、大手小売向け基幹システム刷新（契約 8.4億円、14ヶ月）に AI PMO を PoC 導入

**PoC 開始 7 週時点の実績**:
- 週次レポート工数: 4h → **0.8h**（80% 削減）
- 議事録確定リードタイム: 2.5 営業日 → **当日中**
- 課題未分類滞留: 平均 5 件 → **0 件**
- PM 満足度: **4.2 / 5.0**

→ 月次経営報告で「Phase 2 拡大」が経営承認された段階

詳細デモはビューワーで確認可能: `https://ai-pmo-viewer.onrender.com`

---

## リスクと対応策

| リスク | 対応 |
|--------|------|
| 既存 PMO メンバーの抵抗 | チェンジマネジメント枠を 4 ヶ月確保、スポンサー 1on1 |
| AI 生成物の品質懸念 | 初月はダブルチェック体制、確信度低下時の自動降格 |
| クライアント先 IT 統制で外部 API NG | オンプレ AI PMO（VPC 内デプロイ）対応可 |
| PoC 期間中の PJ 自体の炎上 | AI PMO 機能を縮退するロールバック手順を常備 |
| ROI 未達 | PoC 卒業判定で **縮退・終了の自由** をクライアントが持つ |

---

## なぜ弊社か（差別化要素）

1. **PMO 専門ノウハウ** — 過去 10 年で大手〜中堅 SIer の PMO 業務を熟知
2. **AI 実装の深さ** — Claude API + Agent SDK 専門エンジニアが内製
3. **「動くデモ」での提案** — 提案当日に CLI で御社用 env を生成可能
4. **PoC ファースト** — 大型コミットを強要しない、小さく始める
5. **卒業を前提とした関係** — 12 ヶ月で自走化、依存させない

---

## 他社比較

| 観点 | 既存大手コンサル | 海外 AI PMO ツール | **弊社 AI PMO** |
|------|-------------------|---------------------|-------------------|
| 価格 | ¥100M〜（年） | $10万/年〜 | **¥11〜18M（PoC）** |
| 導入期間 | 6〜12ヶ月 | 即日（SaaS） | **5ヶ月（PoC）** |
| カスタマイズ性 | 高 | 低 | **高（コード公開）** |
| 日本語・国内ツール対応 | 高 | 低 | **高（Backlog 等対応）** |
| AI モデル選択肢 | 限定 | 限定 | **複数モデル切替可** |
| データ主権 | 要確認 | 米国 | **国内 / オンプレ対応** |

---

## 次のステップ

### Step 1: Discovery 申し込み（無償 / 60分）

御社の PMO 現状を 60 分で聞き取り、AI PMO 導入の **粗い適合度** をその場でフィードバック。

### Step 2: 簡易診断レポート（無償 / 1週間）

ヒアリング結果を基に、**「御社で AI PMO を入れた場合の試算」** を A4 5 枚程度でお渡し。

### Step 3: 正式提案 + 契約（有償）

簡易診断で「やる」となった場合のみ、本格提案 → 契約 → Phase 1 着手。

---

## 質疑応答

ご質問・ご懸念をお聞かせください。

**連絡先**:
- 営業担当: {{営業担当者名}}
- メール: {{メールアドレス}}
- 電話: {{電話番号}}

---

## 付録 A: AI 自動化マトリクス（業務別）

[詳細は `docs/deployment-playbook/automation-matrix.md` 参照]

## 付録 B: 使用 AI ツールスタック

[詳細は `docs/deployment-playbook/ai-tool-stack.md` 参照]

## 付録 C: PoC キックオフ後の標準カデンス

[詳細は `docs/deployment-playbook/05-operation.md` 参照]

## 付録 D: セキュリティ・コンプライアンス

[詳細は `docs/enterprise-considerations.md` 参照]

---

<!--
書き出し方法:
- reveal.js: pandoc -t revealjs template-deck.md -o deck.html
- Marp: marp template-deck.md -o deck.pdf
- Canva へ: 各スライド見出しをコピペで Canva スライドへ
- PowerPoint へ: marp template-deck.md -o deck.pptx
-->
