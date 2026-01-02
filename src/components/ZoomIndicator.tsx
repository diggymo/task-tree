interface ZoomIndicatorProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export default function ZoomIndicator({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset
}: ZoomIndicatorProps) {
  return (
    <div className="zoom-indicator">
      <button onClick={onZoomOut}>−</button>
      <span>{Math.round(zoom * 100)}%</span>
      <button onClick={onZoomIn}>+</button>
      <button onClick={onReset} className="reset">リセット</button>
      <style>{`
        .zoom-indicator {
          position: fixed;
          bottom: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(30, 41, 59, 0.9);
          border: 1px solid #475569;
          border-radius: 8px;
          padding: 8px 12px;
          z-index: 100;
          backdrop-filter: blur(8px);
          font-family: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .zoom-indicator span {
          font-size: 13px;
          color: #e2e8f0;
          min-width: 45px;
          text-align: center;
        }

        .zoom-indicator button {
          width: 28px;
          height: 28px;
          border: 1px solid #475569;
          border-radius: 6px;
          background: #334155;
          color: #e2e8f0;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .zoom-indicator button:hover {
          background: #3b82f6;
          border-color: #3b82f6;
        }

        .zoom-indicator button.reset {
          width: auto;
          padding: 0 10px;
          font-size: 11px;
          margin-left: 4px;
        }
      `}</style>
    </div>
  );
}
