import type React from 'react';
import type { SlackMessagePreview as SlackMessagePreviewData } from '../../types/urlPreview';

interface SlackMessagePreviewProps {
  data: SlackMessagePreviewData;
}

const SlackMessagePreview: React.FC<SlackMessagePreviewProps> = ({ data }) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseFloat(timestamp) * 1000);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="slack-preview">
      <div className="slack-preview-header">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          role="img"
          aria-label="Slack"
        >
          <path
            d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
            fill="#E01E5A"
          />
        </svg>
        <span className="slack-preview-title">Slackメッセージ</span>
      </div>
      <div className="slack-preview-body">
        <div className="slack-preview-user">{data.user}</div>
        <div className="slack-preview-text">{data.text}</div>
        <div className="slack-preview-timestamp">
          {formatTimestamp(data.timestamp)}
        </div>
        {data.channel && (
          <div className="slack-preview-channel">#{data.channel}</div>
        )}
      </div>
      <style>{`
        .slack-preview {
          margin-top: 8px;
          background: linear-gradient(145deg, #4a154b 0%, #611f69 100%);
          border: 1px solid #611f69;
          border-radius: 8px;
          padding: 12px;
          font-size: 13px;
          max-width: 100%;
          box-shadow: 0 2px 8px rgba(74, 21, 75, 0.3);
        }

        .slack-preview-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .slack-preview-title {
          font-weight: 600;
          color: #f1f5f9;
          font-size: 12px;
        }

        .slack-preview-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .slack-preview-user {
          font-weight: 600;
          color: #fbbf24;
          font-size: 13px;
        }

        .slack-preview-text {
          color: #e2e8f0;
          line-height: 1.5;
          word-break: break-word;
          white-space: pre-wrap;
        }

        .slack-preview-timestamp {
          color: #94a3b8;
          font-size: 11px;
          margin-top: 4px;
        }

        .slack-preview-channel {
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default SlackMessagePreview;
