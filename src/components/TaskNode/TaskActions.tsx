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

interface CircularProgressProps {
  completed: number;
  total: number;
  isFullyCompleted: boolean;
}

const CircularProgress = React.memo(function CircularProgress({
  completed,
  total,
  isFullyCompleted
}: CircularProgressProps) {
  const size = 28;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? completed / total : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className={`progress-ring ${isFullyCompleted ? 'completed' : ''}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 背景の円 */}
        <circle
          className="progress-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />
        {/* 進捗の円弧 */}
        <circle
          className="progress-ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="progress-ring-text">{completed}/{total}</span>
    </div>
  );
});

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
      {isParent ? (
        <CircularProgress
          completed={stats!.completed}
          total={stats!.total}
          isFullyCompleted={isCompleted}
        />
      ) : (
        <button
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
