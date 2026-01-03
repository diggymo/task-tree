import React, { useMemo } from 'react';
import { useTaskContext } from '../../contexts/TaskContext';
import type { TaskNode as TaskNodeType } from '../../types/task';
import {
  getCompletionStats,
  hasChildren,
  isTaskCompleted,
} from '../../utils/taskOperations';
import URLPreview from '../URLPreview';
import { taskNodeStyles } from './styles';
import { TaskActions } from './TaskActions';
import { TaskChildren } from './TaskChildren';
import { TaskConnector } from './TaskConnector';
import { TaskInput } from './TaskInput';

// 簡素化されたProps（Contextを使用するため）
interface TaskNodeProps {
  task: TaskNodeType;
  depth?: number;
  isFirst?: boolean;
  isLast?: boolean;
}

const TaskNode = React.memo(function TaskNode({
  task,
  depth = 0,
  isFirst = false,
  isLast = false,
}: TaskNodeProps) {
  // Contextから全ての状態とハンドラを取得
  const {
    focusedId,
    draggedId,
    dragOverId,
    dragPosition,
    inputRefs,
    onFocus,
    onTextChange,
    onKeyDown,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDelete,
    onToggleComplete,
    onAddChild,
    onPaste,
    onTouchDragStart,
    onTouchDragMove,
    onTouchDragEnd,
  } = useTaskContext();

  const isFocused = focusedId === task.id;
  const isDragging = draggedId === task.id;
  const isDragOver = dragOverId === task.id;

  // 完了状態を計算
  const isCompleted = isTaskCompleted(task);
  const isParent = hasChildren(task);
  const stats = isParent ? getCompletionStats(task) : null;

  // 親タスクの場合、進捗率に応じた背景グラデーションを計算
  const progressStyle = useMemo(() => {
    if (!isParent || !stats) return undefined;

    const progress =
      stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

    if (progress === 0) return undefined;

    // 右側から緑色に塗る（to left方向のグラデーション）
    // 完了時の背景色と同じ色系統を使用
    const greenColor = isCompleted ? '#166534' : '#15803d';
    return {
      background: `linear-gradient(to left, ${greenColor} ${progress}%, transparent ${progress}%)`,
    };
  }, [isParent, stats, isCompleted]);

  const nodeClassName = [
    'task-node',
    isFocused && 'focused',
    isDragging && 'dragging',
    isDragOver && `drag-over drag-${dragPosition}`,
    isCompleted && 'completed',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="task-branch">
      <div className="task-row">
        {depth > 0 && <TaskConnector isFirst={isFirst} isLast={isLast} />}
        <div
          className={nodeClassName}
          data-task-id={task.id}
          draggable
          onDragStart={(e) => onDragStart(e, task.id)}
          onDragOver={(e) => onDragOver(e, task.id)}
          onDrop={(e) => onDrop(e, task.id)}
          onDragLeave={onDragLeave}
          onTouchMove={onTouchDragMove}
          onTouchEnd={onTouchDragEnd}
          onClick={() => onFocus(task.id)}
        >
          <div
            className="drag-handle"
            onTouchStart={(e) => onTouchDragStart(e, task.id)}
          >
            ⋮⋮
          </div>
          <TaskInput
            taskId={task.id}
            text={task.text}
            inputRefs={inputRefs}
            onTextChange={onTextChange}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onPaste={onPaste}
            style={progressStyle}
          />
          {isFocused && (
            <button
              type="button"
              className="add-child-btn"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(task.id);
              }}
              title="子タスクを追加"
            >
              →
            </button>
          )}
          <TaskActions
            taskId={task.id}
            isCompleted={isCompleted}
            isParent={isParent}
            isFocused={isFocused}
            stats={stats}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
          />
        </div>
        <URLPreview text={task.text} />
        {task.images && task.images.length > 0 && (
          <div className="task-images">
            {task.images.map((image) => (
              <a
                key={image.id}
                href={image.presignedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="task-image-thumbnail"
              >
                <img src={image.presignedUrl} alt="添付画像" loading="lazy" />
              </a>
            ))}
          </div>
        )}
        <TaskChildren
          children={task.children}
          depth={depth}
          TaskNodeComponent={TaskNode}
        />
      </div>
      <style>{taskNodeStyles}</style>
    </div>
  );
});

export default TaskNode;
