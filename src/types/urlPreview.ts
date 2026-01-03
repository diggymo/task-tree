// URLプレビューのサービスタイプ
export type URLServiceType = 'slack' | 'github' | 'jira' | 'unknown';

// Slackメッセージのプレビューデータ
export interface SlackMessagePreview {
  type: 'slack';
  user: string;
  text: string;
  timestamp: string;
  channel?: string;
  teamDomain?: string;
}

// GitHubユーザー情報
export interface GitHubUser {
  login: string;
  avatar_url: string;
}

// GitHub Pull Requestのプレビューデータ
export interface GitHubPullRequestPreview {
  type: 'github';
  title: string;
  number: number;
  state: 'open' | 'closed' | 'merged';
  isDraft: boolean;
  user: GitHubUser; // 作成者
  assignee: GitHubUser | null; // アサイナー（最初の1人）
  created_at: string;
  repository: string; // "owner/repo"
  url: string;
}

// 将来的に他のサービスのプレビューデータを追加
// export interface JiraPreview { ... }

// URLプレビューの統合型
export type URLPreviewData = SlackMessagePreview | GitHubPullRequestPreview;

// URLプレビューの状態
export interface URLPreviewState {
  loading: boolean;
  data: URLPreviewData | null;
  error: string | null;
}

// URL情報
export interface URLInfo {
  url: string;
  type: URLServiceType;
}
