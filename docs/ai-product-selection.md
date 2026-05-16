---
type: project
created: 2026-05-15
project: ai-pmo
tags: [ai-pmo, llm, tech-selection]
---

# 企業に入れる AI 製品の選定論点

「AI PMO」と一口に言っても、どの AI（基盤モデル・エージェント基盤・SaaS）を顧客環境に入れるかで設計が変わる。本ドキュメントは選定フレームのたたき台。

---

## 1. 選定軸

| 軸 | 内容 |
|----|----|
| **基盤 LLM** | Claude / GPT / Gemini / Llama / 国産（Sakana/Stockmark 等） |
| **デプロイ形態** | クラウド API / Azure OpenAI / Bedrock / Vertex / オンプレ・プライベートクラウド |
| **エージェント実行基盤** | Claude Agent SDK / LangGraph / Mastra / Dify / 独自実装 |
| **連携ツール** | Jira / Backlog / Redmine / Notion / Slack / Teams / Box / SharePoint |
| **UI 層** | チャット UI / 既存ツール埋め込み / ダッシュボード / 専用アプリ |

---

## 2. 基盤 LLM 比較（PJ 管理ユースケース観点）

| モデル | 強み | 弱み | PMO 適性 |
|-------|----|----|------|
| Claude (Anthropic) | 長文理解・コーディング・安全性 | 日本語の固有名詞・敬語にクセ | ◎ ドキュメントレビュー、コード絡みの PJ |
| GPT (OpenAI) | エコシステム成熟・ツール連携 | プライバシー懸念で敬遠する企業多い | ○ 中小規模で汎用に |
| Gemini (Google) | Workspace 統合 | 業務利用実績まだ少 | ○ Google Workspace 企業 |
| Azure OpenAI | 法人ガバナンス・契約 | モデル更新が遅延気味 | ◎ 大企業・コンプラ厳格 |
| Bedrock | マルチモデル選択可・AWS 統合 | 設計負荷高 | ○ AWS 主軸の企業 |
| 国産 LLM | データ越境問題なし | 性能・実績まだ限定 | △ 規制業種の選択肢 |

**推奨デフォルト**: Claude (via Bedrock / Vertex / Anthropic API)。日本市場では「Azure OpenAI」がコンプラ的に通しやすいので両建て提案。

---

## 3. 顧客タイプ別の組み合わせ案

| 顧客タイプ | 基盤 LLM | デプロイ | エージェント基盤 | UI |
|--------|------|------|-----------|----|
| 小規模スタートアップ | Claude API 直 | Anthropic クラウド | Claude Agent SDK | Slack bot + Notion |
| 中規模 (一般) | Claude (Bedrock) | AWS Bedrock | LangGraph / 独自 | 専用 Web + Slack |
| 中規模 (Microsoft 軸) | GPT (Azure) | Azure OpenAI | Semantic Kernel | Teams 統合 |
| 大規模 (規制厳格) | Claude (Bedrock) + 国産 LLM 補完 | プライベート VPC | 独自基盤 | 既存社内ポータル統合 |
| 大規模 (Google 軸) | Gemini | Vertex AI | Vertex Agent Builder | Workspace 統合 |

---

## 4. 選定時のチェックリスト

- [ ] 顧客が既に契約している AI ベンダーは何か
- [ ] データを国外に出してよいか（リージョン制約）
- [ ] 業界規制（金融・医療・公共）の追加要件は（→ [[enterprise-considerations]]）
- [ ] 既存ツール（Jira/Backlog 等）との連携可否
- [ ] 社内のセキュリティ部門の承認プロセス
- [ ] 価格レンジ（モデル単価 × 想定利用量、[[pricing]] と連動）
- [ ] サポート・SLA 要件

---

## 5. 次のアクション

- [ ] 各 LLM の最新価格・性能ベンチマーク調査
- [ ] Bedrock / Azure OpenAI / Vertex の法人契約条項比較
- [ ] 国内事例での採用 LLM 傾向リサーチ（→ [[competitors-research]]）

---

## 関連

- [[README|プロジェクトホーム]]
- [[enterprise-considerations]]
- [[pmo-roles-map]]
