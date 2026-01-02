# TaskTree

ビジュアルタスク管理のためのデスクトップアプリケーション。

![Tauri](https://img.shields.io/badge/Tauri-2.x-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)

## 機能

- ツリー構造でタスクを視覚的に管理
- ドラッグ&ドロップでタスクの並び替え
- キーボードショートカットによる高速操作
- キャンバスのパン・ズーム
- データの自動保存・インポート/エクスポート
- **URLプレビュー**: タスクにURLを貼ると自動的に追加情報を表示
  - 現在対応: Slack メッセージ
  - 今後対応予定: GitHub, Jira など

## セットアップ

### 前提条件

- Node.js 18+
- pnpm
- Rust (Tauri開発用)

### インストール

```bash
pnpm install
```

## 開発

### URLプレビュー機能の設定

Slack メッセージのプレビューを表示するには、Slack Bot トークンが必要です：

1. [Slack API](https://api.slack.com/apps)でアプリを作成
2. Bot Token Scopes に `channels:history` と `groups:history` を追加
3. ワークスペースにインストール
4. 環境変数 `SLACK_BOT_TOKEN` を設定

```bash
# macOS/Linux
export SLACK_BOT_TOKEN="xoxb-your-token-here"

# Windows (PowerShell)
$env:SLACK_BOT_TOKEN="xoxb-your-token-here"
```

### 開発サーバー起動

```bash
# フロントエンドのみ (Vite dev server)
pnpm dev

# Tauri開発モード (フロントエンド + Rustバックエンド)
pnpm tauri dev
```

## ビルド

```bash
# フロントエンドビルド
pnpm build

# デスクトップアプリのビルド
pnpm tauri build
```

## キーボードショートカット

| キー | 動作 |
|------|------|
| `Enter` | 兄弟タスクを追加 |
| `Tab` / 行頭でスペース | 子タスクを追加 |
| `Shift+Tab` | 親タスクにフォーカス |
| `Backspace` (空タスク) | タスクを削除 |
| `↑` / `↓` | 兄弟タスク間を移動 |
| `Cmd/Ctrl+スクロール` | ズーム |
| `Cmd/Ctrl+ドラッグ` | パン |

## 技術スタック

- **フロントエンド**: React + TypeScript + Vite
- **バックエンド**: Rust + Tauri 2.x
- **データ保存**: JSON (AppData)

## ライセンス

MIT
