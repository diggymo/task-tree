# GitHub Pull Request プレビュー実装計画

## 概要
GitHubのPull RequestのURLを貼ると、PRタイトル・アサイナー（または作成者）・プロフィール画像を表示する機能を実装する。

## 表示内容
- PRタイトル
- アサイナーの名前とアバター画像（アサイナーがいない場合は作成者）
- PRのステータス（Open/Closed/Merged）
- 作成日時

## URL形式
```
https://github.com/{owner}/{repo}/pull/{number}
例: https://github.com/facebook/react/pull/12345
```

## 実装ファイル

### 1. 型定義の拡張 (`src/types/urlPreview.ts`)
```typescript
export interface GitHubUser {
  login: string;
  avatar_url: string;
}

export interface GitHubPullRequestPreview {
  type: 'github';
  title: string;
  number: number;
  state: 'open' | 'closed' | 'merged';
  isDraft: boolean;  // ドラフトPRかどうか
  user: GitHubUser;  // 作成者
  assignee: GitHubUser | null;  // アサイナー（最初の1人）
  created_at: string;
  repository: string;  // "owner/repo"
  url: string;
}

// URLPreviewData型を更新
export type URLPreviewData = SlackMessagePreview | GitHubPullRequestPreview;
```

**注**: `gh pr view`コマンドは`state`が"MERGED"の場合も返すため、3つの状態を扱います。

### 2. URL検出ロジックの拡張 (`src/utils/urlDetection.ts`)
```typescript
// GitHub PR URLのパース
export interface GitHubPRURLParts {
  owner: string;
  repo: string;
  number: number;
}

export function parseGitHubPRURL(url: string): GitHubPRURLParts | null {
  const match = url.match(/https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
  if (!match) return null;

  const [, owner, repo, numberStr] = match;
  return {
    owner,
    repo,
    number: parseInt(numberStr, 10)
  };
}

// isGitHubURL関数を更新
function isGitHubURL(url: string): boolean {
  return /https:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/\d+/.test(url);
}
```

### 3. Tauriコマンド (`src-tauri/src/lib.rs`)

`gh` CLIコマンドを使用してPR情報を取得します。これにより：
- GitHub CLIの認証をそのまま利用可能
- 環境変数の設定が不要
- より信頼性の高い認証方法

```rust
use std::process::Command;

#[derive(Debug, Serialize, Deserialize)]
pub struct GitHubUser {
    pub login: String,
    pub avatar_url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitHubPullRequest {
    pub title: String,
    pub number: u32,
    pub state: String,
    #[serde(rename = "isDraft")]
    pub is_draft: bool,
    pub author: GitHubUser,
    pub assignees: Vec<GitHubUser>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    pub url: String,
}

#[tauri::command]
async fn fetch_github_pr(
    owner: String,
    repo: String,
    number: u32,
) -> Result<GitHubPullRequest, String> {
    // gh pr view コマンドを実行
    let output = Command::new("gh")
        .args([
            "pr", "view",
            &number.to_string(),
            "--repo", &format!("{}/{}", owner, repo),
            "--json", "title,number,state,isDraft,author,assignees,createdAt,url"
        ])
        .output()
        .map_err(|e| format!("gh コマンド実行エラー: {}. gh CLIがインストールされているか確認してください。", e))?;

    if !output.status.success() {
        let error_message = String::from_utf8_lossy(&output.stderr);
        return Err(format!("gh コマンドエラー: {}", error_message));
    }

    let stdout = String::from_utf8(output.stdout)
        .map_err(|e| format!("出力のパースエラー: {}", e))?;

    let pr: GitHubPullRequest = serde_json::from_str(&stdout)
        .map_err(|e| format!("JSONパースエラー: {}", e))?;

    Ok(pr)
}
```

### 4. GitHubプレビューコンポーネント (`src/components/previews/GitHubPRPreview.tsx`)
```typescript
import React from 'react';
import type { GitHubPullRequestPreview } from '../../types/urlPreview';

interface GitHubPRPreviewProps {
  data: GitHubPullRequestPreview;
}

const GitHubPRPreview: React.FC<GitHubPRPreviewProps> = ({ data }) => {
  const displayUser = data.assignee || data.user;

  // ステータスに応じた色とテキスト
  const getStatusStyle = () => {
    if (data.state === 'merged') {
      return { color: '#8250df', text: 'Merged', icon: '✓' };
    }
    if (data.state === 'closed') {
      return { color: '#cf222e', text: 'Closed', icon: '✕' };
    }
    if (data.isDraft) {
      return { color: '#6e7781', text: 'Draft', icon: '◐' };
    }
    return { color: '#1a7f37', text: 'Open', icon: '●' };
  };

  const status = getStatusStyle();

  return (
    <div className="github-pr-preview">
      <div className="github-pr-header">
        <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"/>
        </svg>
        <span className="github-pr-label">Pull Request</span>
        <span className="github-pr-status" style={{ color: status.color }}>
          {status.icon} {status.text}
        </span>
      </div>
      <div className="github-pr-body">
        <div className="github-pr-title">#{data.number} {data.title}</div>
        <div className="github-pr-user">
          <img
            src={displayUser.avatar_url}
            alt={displayUser.login}
            className="github-pr-avatar"
          />
          <div className="github-pr-user-info">
            <span className="github-pr-username">{displayUser.login}</span>
            <span className="github-pr-user-role">
              {data.assignee ? 'Assignee' : 'Author'}
            </span>
          </div>
        </div>
        <div className="github-pr-repo">{data.repository}</div>
      </div>
      <style>{`
        .github-pr-preview {
          margin-top: 8px;
          background: linear-gradient(145deg, #0d1117 0%, #161b22 100%);
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 12px;
          font-size: 13px;
          max-width: 100%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        .github-pr-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #21262d;
          color: #c9d1d9;
        }

        .github-pr-label {
          font-weight: 600;
          font-size: 12px;
          flex: 1;
        }

        .github-pr-status {
          font-weight: 600;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .github-pr-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .github-pr-title {
          color: #f0f6fc;
          font-weight: 600;
          font-size: 14px;
          line-height: 1.4;
          word-break: break-word;
        }

        .github-pr-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .github-pr-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #30363d;
        }

        .github-pr-user-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .github-pr-username {
          color: #58a6ff;
          font-weight: 600;
          font-size: 13px;
        }

        .github-pr-user-role {
          color: #8b949e;
          font-size: 11px;
        }

        .github-pr-repo {
          color: #8b949e;
          font-size: 11px;
          font-family: ui-monospace, monospace;
        }
      `}</style>
    </div>
  );
};

export default GitHubPRPreview;
```

### 5. GitHub PR取得フック (`src/hooks/useGitHubPR.ts`) - 新規ファイル

GitHub PR情報取得ロジックを独立したフックとして分離：

```typescript
import { useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { parseGitHubPRURL } from '../utils/urlDetection';
import type { GitHubPullRequestPreview } from '../types/urlPreview';

interface GitHubUser {
  login: string;
  avatar_url: string;
}

interface GitHubPRResponse {
  title: string;
  number: number;
  state: string;
  isDraft: boolean;
  author: GitHubUser;
  assignees: GitHubUser[];
  createdAt: string;
  url: string;
}

export function useGitHubPR() {
  const fetchGitHubPR = useCallback(async (url: string): Promise<GitHubPullRequestPreview> => {
    const parts = parseGitHubPRURL(url);
    if (!parts) {
      throw new Error('Invalid GitHub PR URL');
    }

    const response = await invoke<GitHubPRResponse>('fetch_github_pr', {
      owner: parts.owner,
      repo: parts.repo,
      number: parts.number
    });

    // アサイナーがいればそれを、いなければ作成者を表示
    const displayUser = response.assignees.length > 0
      ? response.assignees[0]
      : response.author;

    return {
      type: 'github',
      title: response.title,
      number: response.number,
      state: response.state.toLowerCase() as 'open' | 'closed' | 'merged',
      isDraft: response.isDraft,
      user: response.author,
      assignee: response.assignees.length > 0 ? response.assignees[0] : null,
      created_at: response.createdAt,
      repository: `${parts.owner}/${parts.repo}`,
      url: response.url
    };
  }, []);

  return { fetchGitHubPR };
}
```

### 6. useURLPreviewフックの更新 (`src/hooks/useURLPreview.ts`)
```typescript
import { useGitHubPR } from './useGitHubPR';

export function useURLPreview(url: string | null, type: string) {
  // ... 既存のコード ...
  const { fetchGitHubPR } = useGitHubPR();

  const fetchPreview = useCallback(async (url: string, type: string) => {
    setState({ loading: true, data: null, error: null });

    try {
      let data: URLPreviewData | null = null;

      if (type === 'slack') {
        data = await fetchSlackMessage(url);
      } else if (type === 'github') {
        data = await fetchGitHubPR(url);
      }
      // 将来的に他のサービスをここに追加

      if (data) {
        setState({ loading: false, data, error: null });
      } else {
        setState({ loading: false, data: null, error: 'Unsupported URL type' });
      }
    } catch (error) {
      console.error('Failed to fetch URL preview:', error);
      setState({
        loading: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [fetchSlackMessage, fetchGitHubPR]);

  // ... 残りのコード ...
}
```

### 6. URLPreviewコンポーネントの更新 (`src/components/URLPreview.tsx`)
```typescript
import GitHubPRPreview from './previews/GitHubPRPreview';

// render部分
if (data.type === 'slack') {
  return <SlackMessagePreview data={data as SlackMessagePreviewData} />;
}
if (data.type === 'github') {
  return <GitHubPRPreview data={data as GitHubPullRequestPreview} />;
}
```

## Tauri設定の更新

### capabilities/default.json の更新

`gh`コマンドの実行を許可するため、capabilities設定を更新：

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default permissions for the application",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "dialog:default",
    "fs:default",
    {
      "identifier": "shell:allow-execute",
      "allow": [
        {
          "name": "gh",
          "cmd": "gh",
          "args": [
            "pr", "view", { "validator": "\\d+" },
            "--repo", { "validator": "[\\w-]+/[\\w-]+" },
            "--json", "title,number,state,isDraft,author,assignees,createdAt,url"
          ],
          "sidecar": false
        }
      ]
    }
  ]
}
```

**重要**: `validator`を使ってコマンド引数を制限し、セキュリティを確保します。

### 代替案: std::process::Commandを使う場合

Tauri 2.xの`shell`プラグインを使わず、Rust標準の`std::process::Command`を直接使う方法もあります（上記の実装例）。この場合：

- capabilities設定は不要
- Rustコード内で直接コマンドを実行
- より柔軟だが、セキュリティ責任が増える

## 前提条件

### GitHub CLI (`gh`)のインストールと認証

ユーザーのマシンに`gh` CLIがインストールされ、認証されている必要があります：

```bash
# インストール (macOS)
brew install gh

# インストール (Windows)
winget install GitHub.cli

# インストール (Linux)
# https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# 認証
gh auth login
```

認証後、環境変数の設定は不要です。`gh`コマンドが自動的に認証情報を使用します。

## 実装順序
1. ✅ 実装計画の作成・更新
2. 型定義の拡張 (`src/types/urlPreview.ts`)
3. URL検出ロジックの追加 (`src/utils/urlDetection.ts`)
4. Tauriコマンドの実装 (`src-tauri/src/lib.rs`)
   - `std::process::Command`を使用
   - `fetch_github_pr`コマンド追加
   - `invoke_handler`に登録
5. GitHub PR取得フックの作成 (`src/hooks/useGitHubPR.ts`) - **新規ファイル**
6. GitHubプレビューコンポーネントの作成 (`src/components/previews/GitHubPRPreview.tsx`)
7. useURLPreviewフックの更新 (`src/hooks/useURLPreview.ts`)
   - `useGitHubPR`をインポート
   - GitHub PR取得ロジックを統合
8. URLPreviewコンポーネントの更新 (`src/components/URLPreview.tsx`)
   - `GitHubPRPreview`コンポーネントを追加
9. README更新
   - GitHub CLI (`gh`)のインストール方法追加
   - 認証方法の説明追加
10. テストと動作確認

## デザイン方針

### カラースキーム（GitHub公式準拠）
- **背景**: `#0d1117` → `#161b22` (グラデーション)
- **境界線**: `#30363d`
- **Open**: `#1a7f37` (緑)
- **Closed**: `#cf222e` (赤)
- **Merged**: `#8250df` (紫)
- **Draft**: `#6e7781` (グレー)
- **テキスト**: `#f0f6fc` (メイン), `#c9d1d9` (サブ)
- **リンク**: `#58a6ff` (青)

### レイアウト
```
┌──────────────────────────────────────┐
│ 🔀 Pull Request        ● Open       │ ← ヘッダー
├──────────────────────────────────────┤
│ #123 Add new feature for...         │ ← タイトル
│                                      │
│  [👤]  octocat                       │ ← アバター + 名前
│        Assignee / Author             │    (ロール表示)
│                                      │
│  owner/repo                          │ ← リポジトリ
└──────────────────────────────────────┘
```

### 統一感
- Slackプレビューと同じマージン・パディング・角丸を使用
- ホバー時のエフェクトは不要（静的プレビュー）
- エラー・ローディング状態のスタイルを共通化
