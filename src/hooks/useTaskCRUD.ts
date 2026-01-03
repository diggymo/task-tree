import { useCallback } from 'react';
import type { TaskNode as TaskNodeType, TaskRoot } from '../types/task';
import {
  generateId,
  findTask,
  updateTask,
  addChild,
  removeTask,
  hasChildren
} from '../utils/taskOperations';

export interface UseTaskCRUDOptions {
  root: TaskRoot;
  setRoot: React.Dispatch<React.SetStateAction<TaskRoot>>;
  onDataChange?: (root: TaskRoot) => void;
  focusTask: (taskId: string, setCursorToEnd?: boolean) => void;
}

export interface UseTaskCRUDReturn {
  handleTextChange: (taskId: string, text: string) => void;
  handleDelete: (taskId: string) => void;
  handleToggleComplete: (taskId: string) => void;
  handleAddChild: (taskId: string) => void;
}

export function useTaskCRUD({
  root,
  setRoot,
  onDataChange,
  focusTask
}: UseTaskCRUDOptions): UseTaskCRUDReturn {
  const handleTextChange = useCallback((taskId: string, text: string) => {
    // 先頭が空白（半角・全角）で始まる場合は子階層に移動
    if (text.length > 0 && (text[0] === ' ' || text[0] === '　')) {
      const newTask: TaskNodeType = { id: generateId(), text: text.slice(1), children: [] };
      setRoot(prev => {
        const newRoot = addChild(prev, taskId, newTask) as TaskRoot;
        onDataChange?.(newRoot);
        return newRoot;
      });
      focusTask(newTask.id, true);
      return;
    }

    setRoot(prev => {
      const newRoot = updateTask(prev, taskId, { text }) as TaskRoot;
      onDataChange?.(newRoot);
      return newRoot;
    });
  }, [setRoot, onDataChange, focusTask]);

  const handleDelete = useCallback((taskId: string) => {
    const result = findTask(root, taskId);
    if (result?.parent) {
      setRoot(prev => {
        const newRoot = removeTask(prev, taskId) as TaskRoot;
        onDataChange?.(newRoot);
        return newRoot;
      });
    }
  }, [root, setRoot, onDataChange]);

  const handleToggleComplete = useCallback((taskId: string) => {
    const result = findTask(root, taskId);
    if (result) {
      // 親タスクの場合は何もしない
      if (hasChildren(result.node)) {
        return;
      }

      // 葉タスクのみ完了状態をトグル
      setRoot(prev => {
        const newRoot = updateTask(prev, taskId, { completed: !result.node.completed }) as TaskRoot;
        onDataChange?.(newRoot);
        return newRoot;
      });
    }
  }, [root, setRoot, onDataChange]);

  const handleAddChild = useCallback((taskId: string) => {
    const newTask: TaskNodeType = { id: generateId(), text: '', children: [] };
    setRoot(prev => {
      const newRoot = addChild(prev, taskId, newTask) as TaskRoot;
      onDataChange?.(newRoot);
      return newRoot;
    });
    focusTask(newTask.id);
  }, [setRoot, onDataChange, focusTask]);

  return {
    handleTextChange,
    handleDelete,
    handleToggleComplete,
    handleAddChild
  };
}
