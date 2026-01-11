import { useCallback, useMemo, useState } from 'react';
import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  gradients,
  shadows,
  spacing,
  transitions,
} from '../constants/theme';
import type {
  SavedData,
  SaveStatus,
  TaskNode,
  TaskRoot,
  ViewOffset,
} from '../types/task';
import {
  collectLeafTasks,
  isTaskCompleted,
  updateTask,
} from '../utils/taskOperations';
import SaveIndicator from './SaveIndicator';

interface LeafTaskListViewProps {
  initialData: SavedData;
  onDataChange?: (root: TaskRoot, viewOffset: ViewOffset, zoom: number) => void;
  onViewModeChange?: () => void;
  saveStatus?: SaveStatus;
  onExport?: () => void;
  onImport?: () => void;
}

export default function LeafTaskListView({
  initialData,
  onDataChange,
  onViewModeChange,
  saveStatus = 'saved',
  onExport,
  onImport,
}: LeafTaskListViewProps) {
  const [root, setRoot] = useState<TaskRoot>(initialData.root);

  const leafTasks = useMemo(() => collectLeafTasks(root), [root]);

  const handleToggleComplete = useCallback(
    (taskId: string) => {
      setRoot((prevRoot) => {
        const newRoot = updateTask(prevRoot, taskId, {
          completed: !isTaskCompleted(
            leafTasks.find((t) => t.id === taskId) as TaskNode,
          ),
        }) as TaskRoot;
        onDataChange?.(newRoot, initialData.viewOffset, initialData.zoom);
        return newRoot;
      });
    },
    [leafTasks, onDataChange, initialData.viewOffset, initialData.zoom],
  );

  return (
    <div className="leaf-list-container">
      <div className="header">
        <div className="header-row">
          <h1>末端タスク一覧</h1>
          {onViewModeChange && (
            <button
              type="button"
              className="view-mode-toggle"
              onClick={onViewModeChange}
              title="ツリー表示に切り替え"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                role="img"
                aria-label="ツリー表示"
              >
                <path d="M12 3v18M3 12h18" />
                <circle cx="12" cy="5" r="2" />
                <circle cx="5" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          )}
        </div>
        <div className="task-count">{leafTasks.length} 件のタスク</div>
      </div>

      <div className="list-content">
        {leafTasks.length === 0 ? (
          <div className="empty-state">末端タスクがありません</div>
        ) : (
          <ul className="task-list">
            {leafTasks.map((task) => (
              <LeafTaskItem
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </ul>
        )}
      </div>

      {onExport && onImport && (
        <SaveIndicator
          saveStatus={saveStatus}
          onExport={onExport}
          onImport={onImport}
        />
      )}

      <style>{`
        .leaf-list-container {
          width: 100%;
          height: 100dvh;
          background: ${gradients.containerBackground};
          overflow: hidden;
          position: relative;
          font-family: ${fontFamily};
          display: flex;
          flex-direction: column;
        }

        .header {
          padding: ${spacing['4xl']} ${spacing['6xl']};
          background: ${gradients.headerBackground};
          border-bottom: 1px solid ${colors.border.default};
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

        .view-mode-toggle {
          width: 32px;
          height: 32px;
          border-radius: ${borderRadius.lg};
          border: 1px solid ${colors.border.default};
          background: rgba(51, 65, 85, 0.8);
          color: ${colors.text.light};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: ${transitions.default};
        }

        .view-mode-toggle:hover {
          background: ${colors.primary};
          border-color: ${colors.primary};
        }

        .task-count {
          margin-top: ${spacing.md};
          font-size: ${fontSize.md};
          color: ${colors.text.secondary};
        }

        .list-content {
          flex: 1;
          overflow-y: auto;
          padding: ${spacing['4xl']} ${spacing['6xl']};
        }

        .empty-state {
          text-align: center;
          padding: ${spacing['5xl']};
          color: ${colors.text.muted};
          font-size: ${fontSize.lg};
        }

        .task-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: ${spacing.md};
          max-width: 800px;
        }

        .task-item {
          display: flex;
          align-items: center;
          gap: ${spacing.xl};
          background: ${gradients.taskNode};
          border: 1px solid ${colors.border.default};
          border-radius: ${borderRadius.xl};
          padding: ${spacing.xl} ${spacing['3xl']};
          box-shadow: ${shadows.taskNode};
          transition: ${transitions.default};
        }

        .task-item:hover {
          box-shadow: ${shadows.taskNodeHover};
          border-color: ${colors.border.light};
        }

        .task-item.completed {
          background: ${gradients.taskNodeCompleted};
          border-color: ${colors.success.default};
        }

        .task-item.completed:hover {
          box-shadow: ${shadows.taskNodeCompletedHover};
        }

        .complete-button {
          width: 24px;
          height: 24px;
          border-radius: ${borderRadius.md};
          border: 2px solid ${colors.border.light};
          background: transparent;
          color: ${colors.text.light};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: ${transitions.default};
        }

        .complete-button:hover {
          border-color: ${colors.success.light};
          background: rgba(34, 197, 94, 0.1);
        }

        .task-item.completed .complete-button {
          border-color: ${colors.success.light};
          background: ${colors.success.default};
          color: white;
        }

        .task-text {
          flex: 1;
          font-size: ${fontSize.lg};
          color: ${colors.text.primary};
          white-space: pre-wrap;
          word-break: break-word;
        }

        .task-item.completed .task-text {
          text-decoration: line-through;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}

interface LeafTaskItemProps {
  task: TaskNode;
  onToggleComplete: (taskId: string) => void;
}

function LeafTaskItem({ task, onToggleComplete }: LeafTaskItemProps) {
  const completed = isTaskCompleted(task);

  return (
    <li className={`task-item ${completed ? 'completed' : ''}`}>
      <button
        type="button"
        className="complete-button"
        onClick={() => onToggleComplete(task.id)}
        title={completed ? '未完了にする' : '完了にする'}
      >
        {completed && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            role="img"
            aria-label="完了"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>
      <span className="task-text">{task.text || '(空のタスク)'}</span>
    </li>
  );
}
