import React, { createContext, useContext } from 'react';
import type { DragPosition } from '../types/task';

export interface TaskContextValue {
  // 状態
  focusedId: string | null;
  draggedId: string | null;
  dragOverId: string | null;
  dragPosition: DragPosition;
  inputRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>;

  // イベントハンドラ
  onFocus: (taskId: string) => void;
  onTextChange: (taskId: string, text: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>, taskId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onAddChild: (taskId: string) => void;
  // Touch event handlers for mobile drag and drop
  onTouchDragStart: (e: React.TouchEvent<HTMLDivElement>, taskId: string) => void;
  onTouchDragMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchDragEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export const TaskProvider: React.FC<{
  value: TaskContextValue;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = (): TaskContextValue => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
