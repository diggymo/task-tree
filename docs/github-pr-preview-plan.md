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
  state: 'open' | 'closed';
  merged: boolean;
  user: GitHubUser;  // 作成者
  assignee: GitHubUser | null;  // アサイナー
  created_at: string;
  repository: string;  // "owner/repo"
  url: string;
}

// URLPreviewData型を更新
export type URLPreviewData = SlackMessagePreview | GitHubPullRequestPreview;
```

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
```rust
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
    pub merged: bool,
    pub user: GitHubUser,
    pub assignee: Option<GitHubUser>,
    pub created_at: String,
    pub html_url: String,
}

#[tauri::command]
async fn fetch_github_pr(
    owner: String,
    repo: String,
    number: u32,
) -> Result<GitHubPullRequest, String> {
    let token = env::var("GITHUB_TOKEN")
        .map_err(|_| "GITHUB_TOKEN環境変数が設定されていません".to_string())?;

    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/pulls/{}", owner, repo, number);

    let response = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", token))
        .header("User-Agent", "TaskTree-App")
        .header("Accept", "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| format!("リクエストエラー: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("GitHub APIエラー: {}", response.status()));
    }

    let pr: GitHubPullRequest = response
        .json()
        .await
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
  const statusColor = data.merged ? '#8250df' : data.state === 'open' ? '#1a7f37' : '#cf222e';
  const statusText = data.merged ? 'Merged' : data.state === 'open' ? 'Open' : 'Closed';

  return (
    <div className="github-pr-preview">
      <div className="github-pr-header">
        <svg height="16" width="16" viewBox="0 0 16 16">
          <path fill="currentColor" d="M..."/>  {/* GitHub icon */}
        </svg>
        <span className="github-pr-title-label">Pull Request</span>
        <span className="github-pr-status" style={{ color: statusColor }}>
          {statusText}
        </span>
      </div>
      <div className="github-pr-body">
        <h3 className="github-pr-title">#{data.number} {data.title}</h3>
        <div className="github-pr-user">
          <img
            src={displayUser.avatar_url}
            alt={displayUser.login}
            className="github-pr-avatar"
          />
          <span className="github-pr-username">
            {data.assignee ? `👤 ${displayUser.login}` : `✍️ ${displayUser.login}`}
          </span>
        </div>
        <div className="github-pr-meta">
          <span className="github-pr-repo">{data.repository}</span>
        </div>
      </div>
      <style>{/* スタイル */}</style>
    </div>
  );
};
```

### 5. useURLPreviewフックの更新 (`src/hooks/useURLPreview.ts`)
```typescript
const fetchGitHubPR = useCallback(async (url: string): Promise<URLPreviewData | null> => {
  const parts = parseGitHubPRURL(url);
  if (!parts) {
    throw new Error('Invalid GitHub PR URL');
  }

  const response = await invoke<GitHubPullRequestResponse>('fetch_github_pr', {
    owner: parts.owner,
    repo: parts.repo,
    number: parts.number
  });

  return {
    type: 'github',
    title: response.title,
    number: response.number,
    state: response.state as 'open' | 'closed',
    merged: response.merged,
    user: response.user,
    assignee: response.assignee,
    created_at: response.created_at,
    repository: `${parts.owner}/${parts.repo}`,
    url: response.html_url
  };
}, []);

// fetchPreview関数内
if (type === 'slack') {
  data = await fetchSlackMessage(url);
} else if (type === 'github') {
  data = await fetchGitHubPR(url);
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

## 環境変数設定

### GitHub Personal Access Token
スコープ: `repo` (プライベートリポジトリにアクセスする場合)、`public_repo` (パブリックリポジトリのみの場合)

```bash
# macOS/Linux
export GITHUB_TOKEN="ghp_your_token_here"

# Windows (PowerShell)
$env:GITHUB_TOKEN="ghp_your_token_here"
```

## 実装順序
1. 型定義の拡張
2. URL検出ロジックの追加
3. Tauriコマンドの実装
4. GitHubプレビューコンポーネントの作成
5. useURLPreviewフックの更新
6. URLPreviewコンポーネントの更新
7. README更新（環境変数設定方法）
8. テスト

## デザイン方針
- GitHub公式のカラースキームを参考にする
- ステータス（Open/Closed/Merged）を色で区別
- アバター画像を円形で表示
- Slackプレビューと統一感のあるデザイン
