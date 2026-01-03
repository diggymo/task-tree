import { useState } from 'react';
import type { SavedData, TaskRoot, ViewOffset, SaveStatus } from '../types/task';
import { useTaskTree } from '../hooks/useTaskTree';
import { useCanvasControls } from '../hooks/useCanvasControls';
import { TaskProvider } from '../contexts/TaskContext';
import TaskNode from './TaskNode';
import ZoomIndicator from './ZoomIndicator';
import SaveIndicator from './SaveIndicator';
import { colors, spacing, borderRadius, fontSize, gradients, grid, fontFamily } from '../constants/theme';

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
  const [showShortcuts, setShowShortcuts] = useState(false);

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

  // TaskContext用の値をまとめる
  const taskContextValue = {
    focusedId: taskTree.focusedId,
    draggedId: taskTree.draggedId,
    dragOverId: taskTree.dragOverId,
    dragPosition: taskTree.dragPosition,
    inputRefs: taskTree.inputRefs,
    onFocus: taskTree.handleFocus,
    onTextChange: taskTree.handleTextChange,
    onKeyDown: taskTree.handleKeyDown,
    onDragStart: taskTree.handleDragStart,
    onDragOver: taskTree.handleDragOver,
    onDragLeave: taskTree.handleDragLeave,
    onDrop: taskTree.handleDrop,
    onDelete: taskTree.handleDelete,
    onToggleComplete: taskTree.handleToggleComplete,
    onAddChild: taskTree.handleAddChild,
    onTouchDragStart: taskTree.handleTouchDragStart,
    onTouchDragMove: taskTree.handleTouchDragMove,
    onTouchDragEnd: taskTree.handleTouchDragEnd
  };

  return (
    <div
      className={`task-tree-container ${canvasControls.isPanning ? 'panning' : ''}`}
      ref={canvasControls.containerRef}
      onMouseDown={canvasControls.handleMouseDown}
      onMouseMove={canvasControls.handleMouseMove}
      onMouseUp={canvasControls.handleMouseUp}
      onMouseLeave={canvasControls.handleMouseUp}
      onTouchStart={canvasControls.handleTouchStart}
      onTouchMove={canvasControls.handleTouchMove}
      onTouchEnd={canvasControls.handleTouchEnd}
      onWheel={canvasControls.handleWheel}
    >
      <div className="header">
        <div className="header-row">
          <h1>タスクツリー</h1>
          <button
            className="help-toggle"
            onClick={() => setShowShortcuts(!showShortcuts)}
            title="操作説明を表示"
          >
            ?
          </button>
        </div>
        {showShortcuts && (
          <div className="shortcuts">
            <span><kbd>Enter</kbd> 兄弟追加</span>
            <span><kbd>Tab</kbd> / <kbd>先頭Space</kbd> 子追加</span>
            <span><kbd>Shift+Tab</kbd> 親へフォーカス</span>
            <span><kbd>Backspace</kbd> 削除（空の場合）</span>
            <span><kbd>↑</kbd><kbd>↓</kbd> 兄弟間移動</span>
            <span><kbd>⌘/Ctrl</kbd>+スクロール 拡大縮小</span>
            <span><kbd>⌘/Ctrl</kbd>+ドラッグ 画面移動</span>
          </div>
        )}
      </div>
      <div
        className="canvas"
        style={{
          transform: `translate(${canvasControls.viewOffset.x}px, ${canvasControls.viewOffset.y}px) scale(${canvasControls.zoom})`
        }}
      >
        <TaskProvider value={taskContextValue}>
          <div className="tree-root">
            {taskTree.root.children.map((task, index) => (
              <TaskNode
                key={task.id}
                task={task}
                depth={0}
                isFirst={index === 0}
                isLast={index === taskTree.root.children.length - 1}
              />
            ))}
          </div>
        </TaskProvider>
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
          height: 100dvh;
          background: ${gradients.containerBackground};
          overflow: hidden;
          position: relative;
          cursor: default;
          font-family: ${fontFamily};
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
          padding: ${spacing['4xl']} ${spacing['6xl']};
          background: ${gradients.headerBackground};
          z-index: 100;
          pointer-events: none;
        }

        .header-row {
          display: flex;
          align-items: center;
          gap: ${spacing.lg};
        }

        .header h1 {
          margin: 0;
          font-size: ${fontSize.xl};
          font-weight: 700;
          color: ${colors.text.lightest};
          letter-spacing: 0.05em;
        }

        .help-toggle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid ${colors.border.default};
          background: rgba(51, 65, 85, 0.8);
          color: ${colors.text.light};
          font-size: ${fontSize.sm};
          font-weight: 600;
          cursor: pointer;
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, border-color 0.2s;
        }

        .help-toggle:hover {
          background: rgba(71, 85, 105, 0.9);
          border-color: ${colors.text.secondary};
        }

        .shortcuts {
          display: flex;
          gap: ${spacing['4xl']};
          flex-wrap: wrap;
          margin-top: ${spacing.xl};
        }

        .shortcuts span {
          font-size: ${fontSize.md};
          color: ${colors.text.secondary};
        }

        .shortcuts kbd {
          display: inline-block;
          padding: ${spacing.xs} ${spacing.md};
          background: rgba(51, 65, 85, 0.8);
          border-radius: ${borderRadius.md};
          font-family: inherit;
          font-size: ${fontSize.sm};
          color: ${colors.text.light};
          margin-right: 6px;
          border: 1px solid ${colors.border.default};
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
            linear-gradient(${grid.lineColor} 1px, transparent 1px),
            linear-gradient(90deg, ${grid.lineColor} 1px, transparent 1px);
          background-size: ${grid.size} ${grid.size};
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
