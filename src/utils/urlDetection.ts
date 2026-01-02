import type { URLInfo, URLServiceType } from '../types/urlPreview';

// テキストからURLを抽出する
export function extractURLs(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

// SlackのメッセージURLを検出する
// 形式: https://{workspace}.slack.com/archives/{channel_id}/p{timestamp}
// 例: https://example.slack.com/archives/C1234567890/p1234567890123456
function isSlackURL(url: string): boolean {
  return /https:\/\/[^\/]+\.slack\.com\/archives\/[^\/]+\/p\d+/.test(url);
}

// GitHubのURL (将来実装)
function isGitHubURL(url: string): boolean {
  return url.includes('github.com');
}

// JiraのURL (将来実装)
function isJiraURL(url: string): boolean {
  return url.includes('atlassian.net') || url.includes('jira');
}

// URLのサービスタイプを判定する
export function detectURLType(url: string): URLServiceType {
  if (isSlackURL(url)) return 'slack';
  if (isGitHubURL(url)) return 'github';
  if (isJiraURL(url)) return 'jira';
  return 'unknown';
}

// テキストからURLとそのタイプの配列を取得する
export function detectURLsInText(text: string): URLInfo[] {
  const urls = extractURLs(text);
  return urls.map(url => ({
    url,
    type: detectURLType(url)
  }));
}

// SlackのURLからメッセージ情報をパースする
export interface SlackURLParts {
  workspace: string;
  channelId: string;
  timestamp: string;
}

export function parseSlackURL(url: string): SlackURLParts | null {
  const match = url.match(/https:\/\/([^\/]+)\.slack\.com\/archives\/([^\/]+)\/p(\d+)/);
  if (!match) return null;

  const [, workspace, channelId, timestampRaw] = match;

  // Slackのタイムスタンプは p1234567890123456 の形式で、実際のタイムスタンプは 1234567890.123456
  const timestamp = `${timestampRaw.slice(0, 10)}.${timestampRaw.slice(10)}`;

  return {
    workspace,
    channelId,
    timestamp
  };
}
