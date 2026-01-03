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
  onDelete,
}: TaskActionsProps) {
  return (
    <>
      {isParent ? (
        <span className={`progress-text ${isCompleted ? 'completed' : ''}`}>
          {stats?.completed}/{stats?.total}
        </span>
      ) : (
        <button
          type="button"
          className="complete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(taskId);
          }}
        >
          {isCompleted ? '✓' : ''}
        </button>
      )}
      {isFocused && (
        <button
          type="button"
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
