import type { SavedData } from '../types/task';
import { loadFromAppData } from '../hooks/useFileStorage';

interface LoadingScreenProps {
  onDataLoaded: (data: SavedData | null) => void;
}

export default function LoadingScreen({ onDataLoaded }: LoadingScreenProps) {
  const handleLoadData = async () => {
    const data = await loadFromAppData();
    onDataLoaded(data);
  };

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <h1>TaskTree</h1>
        <p>タスクをツリー構造で管理</p>
        <button onClick={handleLoadData} className="load-button">
          開始する
        </button>
      </div>
      <style>{`
        .loading-screen {
          width: 100%;
          height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .loading-content {
          text-align: center;
        }

        .loading-content h1 {
          font-size: 48px;
          font-weight: 700;
          color: #f8fafc;
          margin: 0 0 16px 0;
          letter-spacing: 0.05em;
        }

        .loading-content p {
          font-size: 16px;
          color: #94a3b8;
          margin: 0 0 32px 0;
        }

        .load-button {
          padding: 16px 48px;
          font-size: 16px;
          font-weight: 500;
          color: white;
          background: linear-gradient(145deg, #3b82f6 0%, #2563eb 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .load-button:hover {
          background: linear-gradient(145deg, #60a5fa 0%, #3b82f6 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
        }

        .load-button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
