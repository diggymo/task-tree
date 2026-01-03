import { useCallback } from 'react';
import type { TaskNode, TaskRoot } from '../types/task';
import {
  generateId,
  findTask,
  addSibling,
  addChild,
  removeTask
} from '../utils/taskOperations';

export interface UseTaskKeyboardOptions {
  root: TaskRoot;
  setRoot: React.Dispatch<React.SetStateAction<TaskRoot>>;
  onDataChange?: (root: TaskRoot) => void;
  focusTask: (taskId: string) => void;
  setFocusedId: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface UseTaskKeyboardReturn {
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>, taskId: string) => void;
}

export function useTaskKeyboard({
  root,
  setRoot,
  onDataChange,
  focusTask,
  setFocusedId
}: UseTaskKeyboardOptions): UseTaskKeyboardReturn {
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>, taskId: string) => {
    const result = findTask(root, taskId);
    if (!result) return;

    const { parent, index } = result;

    // Enter: 兄弟タスク追加
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.nativeEvent.isComposing) return;

      e.preventDefault();
      const newTask: TaskNode = { id: generateId(), text: '', children: [] };

      if (parent) {
        setRoot(prev => {
          const updateParent = (node: TaskNode | TaskRoot): TaskNode | TaskRoot => {
            if (node.id === parent.id) {
              return addSibling(node, index, newTask);
            }
            return {
              ...node,
              children: node.children.map(child => updateParent(child) as TaskNode)
            };
          };
          const newRoot = updateParent(prev) as TaskRoot;
          onDataChange?.(newRoot);
          return newRoot;
        });
      } else {
        setRoot(prev => {
          const newRoot = addSibling(prev, index, newTask) as TaskRoot;
          onDataChange?.(newRoot);
          return newRoot;
        });
      }

      focusTask(newTask.id);
    }

    // Shift+Tab: 親へフォーカス
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      if (!parent || parent.id === 'root') return;

      focusTask(parent.id);
      return;
    }

    // Tab: 子タスク追加
    if (e.key === 'Tab') {
      e.preventDefault();
      const newTask: TaskNode = { id: generateId(), text: '', children: [] };
      setRoot(prev => {
        const newRoot = addChild(prev, taskId, newTask) as TaskRoot;
        onDataChange?.(newRoot);
        return newRoot;
      });

      focusTask(newTask.id);
    }

    // Backspace: 空のタスクを削除
    if (e.key === 'Backspace' && e.currentTarget.value === '' && parent) {
      e.preventDefault();
      const siblingIndex = index > 0 ? index - 1 : (parent.children.length > 1 ? 1 : -1);
      const nextFocusId = siblingIndex >= 0 ? parent.children[siblingIndex]?.id : parent.id;

      setRoot(prev => {
        const newRoot = removeTask(prev, taskId) as TaskRoot;
        onDataChange?.(newRoot);
        return newRoot;
      });

      if (nextFocusId && nextFocusId !== 'root') {
        focusTask(nextFocusId);
      } else {
        setFocusedId(null);
      }
    }

    // ArrowUp: 上の兄弟へ移動
    if (e.key === 'ArrowUp' && parent) {
      const textarea = e.currentTarget;
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = textarea.value.substring(0, cursorPosition);
      const isFirstLine = !textBeforeCursor.includes('\n');

      if (isFirstLine && index > 0) {
        e.preventDefault();
        const prevSiblingId = parent.children[index - 1].id;
        focusTask(prevSiblingId);
      }
    }

    // ArrowDown: 下の兄弟へ移動
    if (e.key === 'ArrowDown' && parent) {
      const textarea = e.currentTarget;
      const cursorPosition = textarea.selectionStart;
      const textAfterCursor = textarea.value.substring(cursorPosition);
      const isLastLine = !textAfterCursor.includes('\n');

      if (isLastLine && index < parent.children.length - 1) {
        e.preventDefault();
        const nextSiblingId = parent.children[index + 1].id;
        focusTask(nextSiblingId);
      }
    }
  }, [root, setRoot, onDataChange, focusTask, setFocusedId]);

  return {
    handleKeyDown
  };
}
