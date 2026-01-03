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
  - 現在対応: Slack メッセージ、GitHub Pull Request
  - 今後対応予定: Jira など

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

#### Slack メッセージプレビュー

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

#### GitHub Pull Request プレビュー

GitHub Pull Requestのプレビューを表示するには、GitHub CLI (`gh`)が必要です：

```bash
# インストール (macOS)
brew install gh

# インストール (Windows)
winget install GitHub.cli

# インストール (Linux - Debian/Ubuntu)
sudo apt install gh

# 認証
gh auth login
```

認証が完了すれば、環境変数の設定は不要です。`gh`コマンドが自動的に認証情報を使用します。

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
