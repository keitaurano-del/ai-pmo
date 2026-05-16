#!/usr/bin/env bash
# Obsidian vault (master) → ai-pmo/docs/ への一方向同期。
# Obsidian 側でナレッジを更新したら本スクリプトを叩いて git commit する。

set -euo pipefail

SRC="${OBSIDIAN_AI_PMO_SRC:-$HOME/projects/obsidian-vault/30-Projects/ai-pmo}"
DEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/docs"

if [[ ! -d "$SRC" ]]; then
  echo "[sync] source not found: $SRC" >&2
  exit 1
fi

mkdir -p "$DEST_DIR"

rsync -av --delete \
  --exclude '.obsidian' \
  --exclude '.trash' \
  --exclude '.DS_Store' \
  "$SRC/" "$DEST_DIR/"

cat > "$DEST_DIR/README.md" <<'EOF'
# docs/ — Obsidian vault からの同期コピー

このディレクトリは `obsidian-vault/30-Projects/ai-pmo/` から `scripts/sync-from-obsidian.sh` で生成されたもの。
**直接編集しない**。編集は Obsidian 側で行い、本スクリプトを再実行すること。

最終同期元: `obsidian-vault/30-Projects/ai-pmo/`
EOF

echo "[sync] done. dest=$DEST_DIR"
