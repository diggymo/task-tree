import React from 'react';
import type { TaskNodeProps } from '../types/task';
import URLPreview from './URLPreview';

const TaskNode = React.memo(function TaskNode({
  task,
  depth = 0,
  isFirst = false,
  isLast = false,
  focusedId,
  draggedId,
  dragOverId,
  dragPosition,
  onFocus,
  onTextChange,
  onKeyDown,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDelete,
  onToggleComplete,
  inputRefs
}: TaskNodeProps) {
  const isFocused = focusedId === task.id;
  const isDragging = draggedId === task.id;
  const isDragOver = dragOverId === task.id;

  return (
    <div className="task-branch">
      <div className="task-row">
        {depth > 0 && (
          <div className="connector">
            <svg width="32" height="52" className="connector-svg">
              {!isFirst && (
                <line x1="0" y1="0" x2="0" y2="26" stroke="#64748b" strokeWidth="2" />
              )}
              {!isLast && (
                <line x1="0" y1="26" x2="0" y2="52" stroke="#64748b" strokeWidth="2" />
              )}
              <line x1="0" y1="26" x2="32" y2="26" stroke="#64748b" strokeWidth="2" />
              <circle cx="32" cy="26" r="3" fill="#3b82f6" />
            </svg>
          </div>
        )}
        <div
          className={`task-node ${isFocused ? 'focused' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? `drag-over drag-${dragPosition}` : ''} ${task.completed ? 'completed' : ''}`}
          draggable
          onDragStart={(e) => onDragStart(e, task.id)}
          onDragOver={(e) => onDragOver(e, task.id)}
          onDrop={(e) => onDrop(e, task.id)}
          onDragLeave={onDragLeave}
          onClick={() => onFocus(task.id)}
        >
          <div className="drag-handle">⋮⋮</div>
          <textarea
            ref={el => { if (inputRefs) inputRefs.current[task.id] = el; }}
            value={task.text}
            onChange={(e) => onTextChange(task.id, e.target.value)}
            onKeyDown={(e) => onKeyDown(e, task.id)}
            onFocus={() => onFocus(task.id)}
            placeholder="タスクを入力..."
            className="task-input"
            rows={1}
          />
          <button
            className="complete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task.id);
            }}
          >
            {task.completed ? '✓' : ''}
          </button>
          {isFocused && (
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            >
              ×
            </button>
          )}
        </div>
        <URLPreview text={task.text} />
        {task.children.length > 0 && (
          <div className="children-container">
            {task.children.map((child, index) => (
              <TaskNode
                key={child.id}
                task={child}
                depth={depth + 1}
                isFirst={index === 0}
                isLast={index === task.children.length - 1}
                focusedId={focusedId}
                draggedId={draggedId}
                dragOverId={dragOverId}
                dragPosition={dragPosition}
                onFocus={onFocus}
                onTextChange={onTextChange}
                onKeyDown={onKeyDown}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
                inputRefs={inputRefs}
              />
            ))}
          </div>
        )}
      </div>
      <style>{`
        .task-branch {
          display: flex;
          align-items: flex-start;
        }

        .task-row {
          display: flex;
          align-items: flex-start;
          min-height: 52px;
        }

        .connector {
          display: flex;
          align-items: center;
          width: 32px;
          height: 52px;
        }

        .connector-svg {
          overflow: visible;
        }

        .children-container {
          display: flex;
          flex-direction: column;
          margin-left: 16px;
          position: relative;
        }

        .task-node {
          display: flex;
          align-items: flex-start;
          background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
          border: 1px solid #475569;
          border-radius: 12px;
          padding: 10px 14px;
          min-width: 200px;
          max-width: 320px;
          min-height: 44px;
          margin-top: 4px;
          box-sizing: border-box;
          position: relative;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .task-node:hover {
          border-color: #60a5fa;
          box-shadow: 0 4px 20px rgba(96, 165, 250, 0.2),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .task-node.focused {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3),
                      0 4px 20px rgba(59, 130, 246, 0.3);
        }

        .task-node.completed {
          background: linear-gradient(145deg, #166534 0%, #15803d 100%);
          border-color: #22c55e;
        }

        .task-node.completed:hover {
          border-color: #4ade80;
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.2),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .task-node.completed.focused {
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3),
                      0 4px 20px rgba(34, 197, 94, 0.3);
        }

        .task-node.dragging {
          opacity: 0.5;
          transform: scale(0.95);
        }

        .task-node.drag-over.drag-before::before {
          content: '';
          position: absolute;
          top: -6px;
          left: 0;
          right: 0;
          height: 3px;
          background: #3b82f6;
          border-radius: 2px;
        }

        .task-node.drag-over.drag-after::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 0;
          right: 0;
          height: 3px;
          background: #3b82f6;
          border-radius: 2px;
        }

        .task-node.drag-over.drag-child {
          background: linear-gradient(145deg, #1e3a5f 0%, #2d4a6f 100%);
          border-color: #3b82f6;
        }

        .drag-handle {
          cursor: grab;
          color: #64748b;
          font-size: 12px;
          padding-right: 8px;
          padding-top: 4px;
          user-select: none;
          letter-spacing: -2px;
          transition: color 0.2s;
        }

        .drag-handle:hover {
          color: #94a3b8;
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .task-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          color: #f1f5f9;
          font-family: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
          min-width: 0;
          resize: none;
          overflow: hidden;
          line-height: 1.5;
          padding: 2px 0;
          field-sizing: content;
        }

        .task-input::placeholder {
          color: #64748b;
        }

        .delete-btn {
          position: absolute;
          right: -10px;
          top: -10px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(145deg, #ef4444 0%, #dc2626 100%);
          border: 2px solid #1e293b;
          color: white;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        }

        .delete-btn:hover {
          background: linear-gradient(145deg, #f87171 0%, #ef4444 100%);
          transform: scale(1.1);
        }

        .complete-btn {
          width: 20px;
          height: 20px;
          min-width: 20px;
          border-radius: 4px;
          background: transparent;
          border: 2px solid #64748b;
          color: white;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          margin-left: 8px;
          margin-top: 2px;
        }

        .complete-btn:hover {
          border-color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
        }

        .task-node.completed .complete-btn {
          background: #22c55e;
          border-color: #22c55e;
        }
      `}</style>
    </div>
  );
});

export default TaskNode;
