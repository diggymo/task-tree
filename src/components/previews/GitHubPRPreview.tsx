import type React from 'react';
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
        <svg
          height="16"
          width="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          role="img"
          aria-label="Pull Request"
        >
          <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z" />
        </svg>
        <span className="github-pr-label">Pull Request</span>
        <span className="github-pr-status" style={{ color: status.color }}>
          {status.icon} {status.text}
        </span>
      </div>
      <div className="github-pr-body">
        <div className="github-pr-title">
          #{data.number} {data.title}
        </div>
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
