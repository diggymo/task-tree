import { useState } from 'react';
import type { TaskRoot } from '../types/task';
import { useTaskFocus } from './useTaskFocus';
import { useTaskCRUD } from './useTaskCRUD';
import { useTaskKeyboard } from './useTaskKeyboard';
import { useTaskDragDrop } from './useTaskDragDrop';

interface UseTaskTreeOptions {
  initialRoot: TaskRoot;
  onDataChange?: (root: TaskRoot) => void;
}

export function useTaskTree({ initialRoot, onDataChange }: UseTaskTreeOptions) {
  const [root, setRoot] = useState<TaskRoot>(initialRoot);

  // フォーカス管理
  const {
    focusedId,
    inputRefs,
    setFocusedId,
    handleFocus,
    focusTask
  } = useTaskFocus();

  // CRUD操作
  const {
    handleTextChange,
    handleDelete,
    handleToggleComplete
  } = useTaskCRUD({
    root,
    setRoot,
    onDataChange,
    focusTask
  });

  // キーボード操作
  const { handleKeyDown } = useTaskKeyboard({
    root,
    setRoot,
    onDataChange,
    focusTask,
    setFocusedId
  });

  // ドラッグ&ドロップ
  const {
    draggedId,
    dragOverId,
    dragPosition,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useTaskDragDrop({
    root,
    setRoot,
    onDataChange
  });

  return {
    root,
    focusedId,
    draggedId,
    dragOverId,
    dragPosition,
    inputRefs,
    handleFocus,
    handleTextChange,
    handleKeyDown,
    handleDelete,
    handleToggleComplete,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
}
