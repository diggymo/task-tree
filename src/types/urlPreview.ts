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

// 将来的に他のサービスのプレビューデータを追加
// export interface GitHubPreview { ... }
// export interface JiraPreview { ... }

// URLプレビューの統合型
export type URLPreviewData = SlackMessagePreview;

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
