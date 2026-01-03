import { useState } from 'react';
import type { TaskRoot } from '../types/task';
import { useTaskCRUD } from './useTaskCRUD';
import { useTaskDragDrop } from './useTaskDragDrop';
import { useTaskFocus } from './useTaskFocus';
import { useTaskKeyboard } from './useTaskKeyboard';

interface UseTaskTreeOptions {
  initialRoot: TaskRoot;
  onDataChange?: (root: TaskRoot) => void;
}

export function useTaskTree({ initialRoot, onDataChange }: UseTaskTreeOptions) {
  const [root, setRoot] = useState<TaskRoot>(initialRoot);

  // フォーカス管理
  const { focusedId, inputRefs, setFocusedId, handleFocus, focusTask } =
    useTaskFocus();

  // CRUD操作
  const {
    handleTextChange,
    handleDelete,
    handleToggleComplete,
    handleAddChild,
    handleImageAdd,
  } = useTaskCRUD({
    root,
    setRoot,
    onDataChange,
    focusTask,
  });

  // キーボード操作
  const { handleKeyDown } = useTaskKeyboard({
    root,
    setRoot,
    onDataChange,
    focusTask,
    setFocusedId,
  });

  // ドラッグ&ドロップ
  const {
    draggedId,
    dragOverId,
    dragPosition,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleTouchDragStart,
    handleTouchDragMove,
    handleTouchDragEnd,
  } = useTaskDragDrop({
    root,
    setRoot,
    onDataChange,
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
    handleAddChild,
    handleImageAdd,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleTouchDragStart,
    handleTouchDragMove,
    handleTouchDragEnd,
  };
}
