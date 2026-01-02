import { useState, useCallback, useRef } from 'react';
import type { TaskNode, TaskRoot, DragPosition } from '../types/task';
import {
  generateId,
  findTask,
  updateTask,
  addSibling,
  addChild,
  removeTask,
  isDescendant
} from '../utils/taskOperations';

interface UseTaskTreeOptions {
  initialRoot: TaskRoot;
  onDataChange?: (root: TaskRoot) => void;
}

export function useTaskTree({ initialRoot, onDataChange }: UseTaskTreeOptions) {
  const [root, setRoot] = useState<TaskRoot>(initialRoot);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<DragPosition>(null);
  const inputRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const handleFocus = useCallback((taskId: string) => {
    setFocusedId(taskId);
  }, []);

  const handleTextChange = useCallback((taskId: string, text: string) => {
    // 先頭が空白（半角・全角）で始まる場合は子階層に移動
    if (text.length > 0 && (text[0] === ' ' || text[0] === '　')) {
      const newTask: TaskNode = { id: generateId(), text: text.slice(1), children: [] };
      setRoot(prev => {
        const newRoot = addChild(prev, taskId, newTask) as TaskRoot;
        onDataChange?.(newRoot);
        return newRoot;
      });

      setTimeout(() => {
        setFocusedId(newTask.id);
        const input = inputRefs.current[newTask.id];
        if (input) {
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        }
      }, 10);
      return;
    }

    setRoot(prev => {
      const newRoot = updateTask(prev, taskId, { text }) as TaskRoot;
      onDataChange?.(newRoot);
      return newRoot;
    });
  }, [onDataChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>, taskId: string) => {
    const result = findTask(root, taskId);
    if (!result) return;

    const { parent, index } = result;

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

      setTimeout(() => {
        setFocusedId(newTask.id);
        inputRefs.current[newTask.id]?.focus();
      }, 10);
    }

    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      if (!parent || parent.id === 'root') return;

      const parentId = parent.id;
      setFocusedId(parentId);
      setTimeout(() => {
        inputRefs.current[parentId]?.focus();
      }, 10);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const newTask: TaskNode = { id: generateId(), text: '', children: [] };
      setRoot(prev => {
        const newRoot = addChild(prev, taskId, newTask) as TaskRoot;
        onDataChange?.(newRoot);
        return newRoot;
      });

      setTimeout(() => {
        setFocusedId(newTask.id);
        inputRefs.current[newTask.id]?.focus();
      }, 10);
    }

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
        setTimeout(() => {
          setFocusedId(nextFocusId);
          inputRefs.current[nextFocusId]?.focus();
        }, 10);
      }
    }

    if (e.key === 'ArrowUp' && parent) {
      const textarea = e.currentTarget;
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = textarea.value.substring(0, cursorPosition);
      const isFirstLine = !textBeforeCursor.includes('\n');

      if (isFirstLine && index > 0) {
        e.preventDefault();
        const prevSiblingId = parent.children[index - 1].id;
        setFocusedId(prevSiblingId);
        setTimeout(() => {
          inputRefs.current[prevSiblingId]?.focus();
        }, 10);
      }
    }

    if (e.key === 'ArrowDown' && parent) {
      const textarea = e.currentTarget;
      const cursorPosition = textarea.selectionStart;
      const textAfterCursor = textarea.value.substring(cursorPosition);
      const isLastLine = !textAfterCursor.includes('\n');

      if (isLastLine && index < parent.children.length - 1) {
        e.preventDefault();
        const nextSiblingId = parent.children[index + 1].id;
        setFocusedId(nextSiblingId);
        setTimeout(() => {
          inputRefs.current[nextSiblingId]?.focus();
        }, 10);
      }
    }
  }, [root, onDataChange]);

  const handleDelete = useCallback((taskId: string) => {
    const result = findTask(root, taskId);
    if (result?.parent) {
      setRoot(prev => {
        const newRoot = removeTask(prev, taskId) as TaskRoot;
        onDataChange?.(newRoot);
        return newRoot;
      });
      setFocusedId(null);
    }
  }, [root, onDataChange]);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    setDraggedId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedId === taskId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const position: DragPosition = y < rect.height / 3 ? 'before' : y > rect.height * 2 / 3 ? 'after' : 'child';

    setDragOverId(taskId);
    setDragPosition(position);
  }, [draggedId]);

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
    setDragPosition(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      setDragPosition(null);
      return;
    }

    const draggedResult = findTask(root, draggedId);
    if (!draggedResult) return;

    if (isDescendant(draggedResult.node, targetId)) {
      setDraggedId(null);
      setDragOverId(null);
      setDragPosition(null);
      return;
    }

    setRoot(prev => {
      let newRoot = removeTask(prev, draggedId) as TaskRoot;
      const targetResult = findTask(newRoot, targetId);
      if (!targetResult) return prev;

      const draggedNode = draggedResult.node;

      if (dragPosition === 'child') {
        newRoot = addChild(newRoot, targetId, draggedNode) as TaskRoot;
      } else {
        const insertIndex = dragPosition === 'before' ? targetResult.index : targetResult.index + 1;

        const insertIntoParent = (node: TaskNode | TaskRoot): TaskNode | TaskRoot => {
          if (node.id === targetResult.parent?.id) {
            const newChildren = [...node.children];
            newChildren.splice(insertIndex, 0, draggedNode);
            return { ...node, children: newChildren };
          }
          if (node.id === 'root' && !targetResult.parent) {
            const newChildren = [...node.children];
            newChildren.splice(insertIndex, 0, draggedNode);
            return { ...node, children: newChildren };
          }
          return {
            ...node,
            children: node.children.map(child => insertIntoParent(child) as TaskNode)
          };
        };

        newRoot = insertIntoParent(newRoot) as TaskRoot;
      }

      onDataChange?.(newRoot);
      return newRoot;
    });

    setDraggedId(null);
    setDragOverId(null);
    setDragPosition(null);
  }, [draggedId, dragPosition, root, onDataChange]);

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
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
}
