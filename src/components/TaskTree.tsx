import type { SavedData, TaskRoot, ViewOffset, SaveStatus } from '../types/task';
import { useTaskTree } from '../hooks/useTaskTree';
import { useCanvasControls } from '../hooks/useCanvasControls';
import TaskNode from './TaskNode';
import ZoomIndicator from './ZoomIndicator';
import SaveIndicator from './SaveIndicator';

interface TaskTreeProps {
  initialData: SavedData;
  onDataChange?: (root: TaskRoot, viewOffset: ViewOffset, zoom: number) => void;
  saveStatus?: SaveStatus;
  onExport?: () => void;
  onImport?: () => void;
}

export default function TaskTree({
  initialData,
  onDataChange,
  saveStatus = 'saved',
  onExport,
  onImport
}: TaskTreeProps) {
  const handleRootChange = (root: TaskRoot) => {
    onDataChange?.(root, canvasControls.viewOffset, canvasControls.zoom);
  };

  const handleViewChange = (viewOffset: ViewOffset, zoom: number) => {
    onDataChange?.(taskTree.root, viewOffset, zoom);
  };

  const taskTree = useTaskTree({
    initialRoot: initialData.root,
    onDataChange: handleRootChange
  });

  const canvasControls = useCanvasControls({
    initialViewOffset: initialData.viewOffset,
    initialZoom: initialData.zoom,
    onViewChange: handleViewChange
  });

  return (
    <div
      className={`task-tree-container ${canvasControls.isPanning ? 'panning' : ''}`}
      ref={canvasControls.containerRef}
      onMouseDown={canvasControls.handleMouseDown}
      onMouseMove={canvasControls.handleMouseMove}
      onMouseUp={canvasControls.handleMouseUp}
      onMouseLeave={canvasControls.handleMouseUp}
      onWheel={canvasControls.handleWheel}
    >
      <div className="header">
        <h1>タスクツリー</h1>
        <div className="shortcuts">
          <span><kbd>Enter</kbd> 兄弟追加</span>
          <span><kbd>Tab</kbd> / <kbd>先頭Space</kbd> 子追加</span>
          <span><kbd>Shift+Tab</kbd> 親へフォーカス</span>
          <span><kbd>Backspace</kbd> 削除（空の場合）</span>
          <span><kbd>↑</kbd><kbd>↓</kbd> 兄弟間移動</span>
          <span><kbd>⌘/Ctrl</kbd>+スクロール 拡大縮小</span>
          <span><kbd>⌘/Ctrl</kbd>+ドラッグ 画面移動</span>
        </div>
      </div>
      <div
        className="canvas"
        style={{
          transform: `translate(${canvasControls.viewOffset.x}px, ${canvasControls.viewOffset.y}px) scale(${canvasControls.zoom})`
        }}
      >
        <div className="tree-root">
          {taskTree.root.children.map((task, index) => (
            <TaskNode
              key={task.id}
              task={task}
              depth={0}
              isFirst={index === 0}
              isLast={index === taskTree.root.children.length - 1}
              focusedId={taskTree.focusedId}
              draggedId={taskTree.draggedId}
              dragOverId={taskTree.dragOverId}
              dragPosition={taskTree.dragPosition}
              onFocus={taskTree.handleFocus}
              onTextChange={taskTree.handleTextChange}
              onKeyDown={taskTree.handleKeyDown}
              onDragStart={taskTree.handleDragStart}
              onDragOver={taskTree.handleDragOver}
              onDragLeave={taskTree.handleDragLeave}
              onDrop={taskTree.handleDrop}
              onDelete={taskTree.handleDelete}
              inputRefs={taskTree.inputRefs}
            />
          ))}
        </div>
      </div>

      <ZoomIndicator
        zoom={canvasControls.zoom}
        onZoomIn={canvasControls.handleZoomIn}
        onZoomOut={canvasControls.handleZoomOut}
        onReset={canvasControls.handleReset}
      />

      {onExport && onImport && (
        <SaveIndicator
          saveStatus={saveStatus}
          onExport={onExport}
          onImport={onImport}
        />
      )}

      <style>{`
        .task-tree-container {
          width: 100%;
          height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          overflow: hidden;
          position: relative;
          cursor: default;
          font-family: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .task-tree-container:active {
          cursor: default;
        }

        .task-tree-container.panning {
          cursor: grabbing;
          user-select: none;
        }

        .task-tree-container.panning * {
          cursor: grabbing !important;
          user-select: none !important;
        }

        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          padding: 20px 30px;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0) 100%);
          z-index: 100;
          pointer-events: none;
        }

        .header h1 {
          margin: 0 0 12px 0;
          font-size: 24px;
          font-weight: 700;
          color: #f8fafc;
          letter-spacing: 0.05em;
        }

        .shortcuts {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .shortcuts span {
          font-size: 12px;
          color: #94a3b8;
        }

        .shortcuts kbd {
          display: inline-block;
          padding: 2px 8px;
          background: rgba(51, 65, 85, 0.8);
          border-radius: 4px;
          font-family: inherit;
          font-size: 11px;
          color: #e2e8f0;
          margin-right: 6px;
          border: 1px solid #475569;
        }

        .canvas {
          position: absolute;
          top: 0;
          left: 0;
          padding: 120px 60px 60px 60px;
          min-width: 100%;
          min-height: 100%;
          transform-origin: top left;
        }

        .tree-root {
          display: flex;
          flex-direction: column;
        }

        /* グリッド背景 */
        .task-tree-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image:
            linear-gradient(rgba(51, 65, 85, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(51, 65, 85, 0.3) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        /* グロー効果 */
        .task-tree-container::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 30%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
