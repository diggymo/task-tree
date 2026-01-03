import React from 'react';
import type { TaskNode as TaskNodeType } from '../../types/task';
import { useTaskContext } from '../../contexts/TaskContext';
import URLPreview from '../URLPreview';
import { isTaskCompleted, hasChildren, getCompletionStats } from '../../utils/taskOperations';
import { TaskConnector } from './TaskConnector';
import { TaskInput } from './TaskInput';
import { TaskActions } from './TaskActions';
import { TaskChildren } from './TaskChildren';
import { taskNodeStyles } from './styles';

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
  isLast = false
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
    onTouchDragStart,
    onTouchDragMove,
    onTouchDragEnd
  } = useTaskContext();

  const isFocused = focusedId === task.id;
  const isDragging = draggedId === task.id;
  const isDragOver = dragOverId === task.id;

  // 完了状態を計算
  const isCompleted = isTaskCompleted(task);
  const isParent = hasChildren(task);
  const stats = isParent ? getCompletionStats(task) : null;

  const nodeClassName = [
    'task-node',
    isFocused && 'focused',
    isDragging && 'dragging',
    isDragOver && `drag-over drag-${dragPosition}`,
    isCompleted && 'completed'
  ].filter(Boolean).join(' ');

  return (
    <div className="task-branch">
      <div className="task-row">
        {depth > 0 && (
          <TaskConnector isFirst={isFirst} isLast={isLast} />
        )}
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
          >⋮⋮</div>
          <TaskInput
            taskId={task.id}
            text={task.text}
            inputRefs={inputRefs}
            onTextChange={onTextChange}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
          />
          {isFocused && (
            <button
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
