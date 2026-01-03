import { useState, useCallback, useRef } from 'react';
import type { TaskNode, TaskRoot, DragPosition } from '../types/task';
import {
  findTask,
  addChild,
  removeTask,
  isDescendant
} from '../utils/taskOperations';

export interface UseTaskDragDropOptions {
  root: TaskRoot;
  setRoot: React.Dispatch<React.SetStateAction<TaskRoot>>;
  onDataChange?: (root: TaskRoot) => void;
}

export interface UseTaskDragDropReturn {
  draggedId: string | null;
  dragOverId: string | null;
  dragPosition: DragPosition;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  handleTouchDragStart: (e: React.TouchEvent<HTMLDivElement>, taskId: string) => void;
  handleTouchDragMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchDragEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
}

export function useTaskDragDrop({
  root,
  setRoot,
  onDataChange
}: UseTaskDragDropOptions): UseTaskDragDropReturn {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<DragPosition>(null);
  const touchDragIdRef = useRef<string | null>(null);

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
  }, [draggedId, dragPosition, root, setRoot, onDataChange]);

  // Touch event handlers for mobile drag and drop
  const handleTouchDragStart = useCallback((e: React.TouchEvent<HTMLDivElement>, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    touchDragIdRef.current = taskId;
    setDraggedId(taskId);
  }, []);

  const handleTouchDragMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchDragIdRef.current) return;

    const touch = e.touches[0];
    const elementsAtPoint = document.elementsFromPoint(touch.clientX, touch.clientY);

    // Find task-node element under touch point
    const taskNodeElement = elementsAtPoint.find(el =>
      el.classList.contains('task-node') && el.getAttribute('data-task-id')
    );

    if (taskNodeElement) {
      const targetId = taskNodeElement.getAttribute('data-task-id');
      if (targetId && targetId !== touchDragIdRef.current) {
        const rect = taskNodeElement.getBoundingClientRect();
        const y = touch.clientY - rect.top;
        const position: DragPosition = y < rect.height / 3 ? 'before' : y > rect.height * 2 / 3 ? 'after' : 'child';

        setDragOverId(targetId);
        setDragPosition(position);
      }
    } else {
      setDragOverId(null);
      setDragPosition(null);
    }
  }, []);

  const handleTouchDragEnd = useCallback((_e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchDragIdRef.current || !dragOverId || !dragPosition) {
      touchDragIdRef.current = null;
      setDraggedId(null);
      setDragOverId(null);
      setDragPosition(null);
      return;
    }

    const draggedTaskId = touchDragIdRef.current;
    const targetId = dragOverId;

    if (draggedTaskId === targetId) {
      touchDragIdRef.current = null;
      setDraggedId(null);
      setDragOverId(null);
      setDragPosition(null);
      return;
    }

    const draggedResult = findTask(root, draggedTaskId);
    if (!draggedResult) {
      touchDragIdRef.current = null;
      setDraggedId(null);
      setDragOverId(null);
      setDragPosition(null);
      return;
    }

    if (isDescendant(draggedResult.node, targetId)) {
      touchDragIdRef.current = null;
      setDraggedId(null);
      setDragOverId(null);
      setDragPosition(null);
      return;
    }

    setRoot(prev => {
      let newRoot = removeTask(prev, draggedTaskId) as TaskRoot;
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

    touchDragIdRef.current = null;
    setDraggedId(null);
    setDragOverId(null);
    setDragPosition(null);
  }, [dragOverId, dragPosition, root, setRoot, onDataChange]);

  return {
    draggedId,
    dragOverId,
    dragPosition,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleTouchDragStart,
    handleTouchDragMove,
    handleTouchDragEnd
  };
}
