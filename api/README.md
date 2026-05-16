# api/ — AI PMO ビューワー用バックエンド

viewer から呼ばれるファイル CRUD + アップロード API。Express + tsx。

## エンドポイント

| Method | パス | 用途 |
|--------|------|------|
| GET | `/api/health` | ヘルスチェック |
| GET | `/api/cases` | 全 case slug + ファイル数 |
| GET | `/api/cases/:slug/files` | case のファイル一覧 |
| GET | `/api/cases/:slug/files/*` | ファイル取得（text/plain） |
| PUT | `/api/cases/:slug/files/*` | ファイル更新（body: `{content: string}` or raw text/plain） |
| DELETE | `/api/cases/:slug/files/*` | ファイル削除 |
| POST | `/api/cases/:slug/upload?dryRun=true&force=true` | 資料アップロード → intake-agent 起動 |

## 起動

```bash
cd api
npm install
npm run dev    # http://localhost:3001
```

API キーを設定すると intake の本実行も可：

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

## viewer 開発時の連携

```bash
# Terminal 1
cd api && npm run dev

# Terminal 2
cd viewer && npm run dev
# → http://localhost:5173 (viewer は VITE_API_URL=http://localhost:3001 を参照)
```

## デプロイ (Render Web Service)

`render.yaml` に `ai-pmo-api` Web Service を追加して Blueprint で連携：

```yaml
- type: web
  name: ai-pmo-api
  runtime: node
  rootDir: api
  buildCommand: npm install
  startCommand: npm start
  envVars:
    - key: ANTHROPIC_API_KEY
      sync: false   # Render dashboard で手動設定
    - key: PORT
      value: 3001
```

書き込み先（case-studies/）は **Render の Persistent Disk** にマウントが必要。
無料プランは ephemeral なので、本番運用は Standard プラン以上で disk を有効化。

## セキュリティ注意

- 現状認証なし（dev/demo 用）
- 本番運用時は Cloudflare Access / Auth0 / Render Auth0 連携などで保護
- path traversal は server.ts の `safeCasePath` で防御
