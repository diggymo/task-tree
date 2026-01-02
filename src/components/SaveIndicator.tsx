import type { SaveStatus } from '../types/task';

interface SaveIndicatorProps {
  saveStatus: SaveStatus;
  onExport: () => void;
  onImport: () => void;
}

export default function SaveIndicator({
  saveStatus,
  onExport,
  onImport
}: SaveIndicatorProps) {
  return (
    <div className={`save-indicator ${saveStatus}`}>
      {saveStatus === 'saved' && <><span className="icon">✓</span> 保存済み</>}
      {saveStatus === 'pending' && <><span className="icon">●</span> 未保存</>}
      {saveStatus === 'saving' && <><span className="icon spinning">⟳</span> 保存中...</>}
      {saveStatus === 'error' && <><span className="icon">!</span> エラー</>}
      <div className="save-actions">
        <button
          className="export-btn"
          onClick={onExport}
          title="JSONとしてエクスポート"
        >
          ↓
        </button>
        <button
          className="import-btn"
          onClick={onImport}
          title="JSONをインポート"
        >
          ↑
        </button>
      </div>
      <style>{`
        .save-indicator {
          position: fixed;
          bottom: 20px;
          left: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(30, 41, 59, 0.9);
          border: 1px solid #475569;
          border-radius: 8px;
          padding: 8px 14px;
          z-index: 100;
          backdrop-filter: blur(8px);
          font-size: 12px;
          transition: all 0.3s;
          font-family: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .save-indicator.saved {
          color: #4ade80;
          border-color: rgba(74, 222, 128, 0.3);
        }

        .save-indicator.pending {
          color: #fbbf24;
          border-color: rgba(251, 191, 36, 0.3);
        }

        .save-indicator.saving {
          color: #60a5fa;
          border-color: rgba(96, 165, 250, 0.3);
        }

        .save-indicator.error {
          color: #f87171;
          border-color: rgba(248, 113, 113, 0.3);
        }

        .save-indicator .icon {
          display: inline-block;
        }

        .save-indicator .icon.spinning {
          animation: spin 1s linear infinite;
        }

        .save-actions {
          display: flex;
          gap: 4px;
          margin-left: 10px;
          padding-left: 10px;
          border-left: 1px solid #475569;
        }

        .save-actions button {
          width: 24px;
          height: 24px;
          border: 1px solid #475569;
          border-radius: 4px;
          background: #334155;
          color: #e2e8f0;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .save-actions button:hover {
          background: #3b82f6;
          border-color: #3b82f6;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
