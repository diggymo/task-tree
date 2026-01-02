import type { SavedData } from '../types/task';

interface RestoreDialogProps {
  savedData: SavedData;
  onRestore: () => void;
  onStartFresh: () => void;
}

export default function RestoreDialog({ savedData, onRestore, onStartFresh }: RestoreDialogProps) {
  return (
    <div className="restore-dialog-overlay">
      <div className="restore-dialog">
        <h2>保存されたデータがあります</h2>
        <p>前回のセッションからタスクを復元しますか？</p>
        {savedData.savedAt && (
          <p className="saved-time">
            保存日時: {new Date(savedData.savedAt).toLocaleString('ja-JP')}
          </p>
        )}
        <div className="dialog-buttons">
          <button onClick={onRestore} className="btn-restore">復元する</button>
          <button onClick={onStartFresh} className="btn-fresh">新規作成</button>
        </div>
      </div>
      <style>{`
        .restore-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
          z-index: 1000;
        }

        .restore-dialog {
          background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
          border: 1px solid #475569;
          border-radius: 16px;
          padding: 32px 40px;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }

        .restore-dialog h2 {
          margin: 0 0 16px 0;
          color: #f1f5f9;
          font-size: 20px;
          font-weight: 700;
        }

        .restore-dialog p {
          margin: 0 0 12px 0;
          color: #94a3b8;
          font-size: 14px;
        }

        .restore-dialog .saved-time {
          color: #64748b;
          font-size: 12px;
          margin-bottom: 24px;
        }

        .dialog-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .dialog-buttons button {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .btn-restore {
          background: linear-gradient(145deg, #3b82f6 0%, #2563eb 100%);
          border: none;
          color: white;
        }

        .btn-restore:hover {
          background: linear-gradient(145deg, #60a5fa 0%, #3b82f6 100%);
          transform: translateY(-1px);
        }

        .btn-fresh {
          background: transparent;
          border: 1px solid #475569;
          color: #94a3b8;
        }

        .btn-fresh:hover {
          border-color: #64748b;
          color: #e2e8f0;
        }
      `}</style>
    </div>
  );
}
