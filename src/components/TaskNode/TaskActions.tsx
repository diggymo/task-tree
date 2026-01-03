import React from 'react';

interface TaskActionsProps {
  taskId: string;
  isCompleted: boolean;
  isParent: boolean;
  isFocused: boolean;
  stats: { completed: number; total: number } | null;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export const TaskActions = React.memo(function TaskActions({
  taskId,
  isCompleted,
  isParent,
  isFocused,
  stats,
  onToggleComplete,
  onDelete
}: TaskActionsProps) {
  return (
    <>
      <button
        className={`complete-btn ${isParent ? 'parent-task' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (!isParent) {
            onToggleComplete(taskId);
          }
        }}
        disabled={isParent}
      >
        {isParent ? (
          <span className="progress-text">{stats!.completed}/{stats!.total}</span>
        ) : (
          isCompleted ? '✓' : ''
        )}
      </button>
      {isFocused && (
        <button
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(taskId);
          }}
        >
          ×
        </button>
      )}
    </>
  );
});
