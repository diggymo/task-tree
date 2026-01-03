import React, { useMemo } from 'react';
import { detectURLsInText } from '../utils/urlDetection';
import { useURLPreview } from '../hooks/useURLPreview';
import SlackMessagePreview from './previews/SlackMessagePreview';
import GitHubPRPreview from './previews/GitHubPRPreview';
import type { SlackMessagePreview as SlackMessagePreviewData, GitHubPullRequestPreview } from '../types/urlPreview';

interface URLPreviewProps {
  text: string;
}

const URLPreview: React.FC<URLPreviewProps> = ({ text }) => {
  // テキストから最初のサポートされているURLを取得
  const urlInfo = useMemo(() => {
    const urls = detectURLsInText(text);
    // SlackとGitHubに対応
    const supportedUrl = urls.find(u => u.type === 'slack' || u.type === 'github');
    return supportedUrl || null;
  }, [text]);

  const { loading, data, error } = useURLPreview(
    urlInfo?.url || null,
    urlInfo?.type || 'unknown'
  );

  if (!urlInfo || urlInfo.type === 'unknown') {
    return null;
  }

  if (loading) {
    return (
      <div className="url-preview-loading">
        <div className="loading-spinner"></div>
        <span>プレビューを読み込み中...</span>
        <style>{`
          .url-preview-loading {
            margin-top: 8px;
            padding: 12px;
            background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
            border: 1px solid #475569;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: #94a3b8;
          }

          .loading-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid #475569;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="url-preview-error">
        <span>⚠️ プレビューの取得に失敗しました</span>
        <div className="error-message">{error}</div>
        <style>{`
          .url-preview-error {
            margin-top: 8px;
            padding: 12px;
            background: linear-gradient(145deg, #7f1d1d 0%, #991b1b 100%);
            border: 1px solid #dc2626;
            border-radius: 8px;
            font-size: 13px;
            color: #fecaca;
          }

          .error-message {
            margin-top: 4px;
            font-size: 11px;
            color: #fca5a5;
          }
        `}</style>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // データタイプに応じて適切なプレビューコンポーネントを表示
  if (data.type === 'slack') {
    return <SlackMessagePreview data={data as SlackMessagePreviewData} />;
  }

  if (data.type === 'github') {
    return <GitHubPRPreview data={data as GitHubPullRequestPreview} />;
  }

  // 将来的に他のサービスのプレビューを追加
  // if (data.type === 'jira') {
  //   return <JiraPreview data={data} />;
  // }

  return null;
};

export default URLPreview;
