export interface TaskNode {
  id: string;
  text: string;
  children: TaskNode[];
  completed?: boolean;
}

export interface TaskRoot {
  id: 'root';
  text: string;
  children: TaskNode[];
}

export interface ViewOffset {
  x: number;
  y: number;
}

export interface SavedData {
  root: TaskRoot;
  viewOffset: ViewOffset;
  zoom: number;
  savedAt: string;
}

export type DragPosition = 'before' | 'after' | 'child' | null;
export type SaveStatus = 'saved' | 'saving' | 'pending' | 'error';

export interface TaskSearchResult {
  node: TaskNode;
  parent: TaskNode | TaskRoot | null;
  index: number;
}

export interface TaskNodeProps {
  task: TaskNode;
  depth?: number;
  isFirst?: boolean;
  isLast?: boolean;
  focusedId: string | null;
  draggedId: string | null;
  dragOverId: string | null;
  dragPosition: DragPosition;
  onFocus: (taskId: string) => void;
  onTextChange: (taskId: string, text: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>, taskId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  inputRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
}

export const initialTasks: TaskRoot = {
  id: 'root',
  text: 'ルート',
  children: [
    {
      id: 'initial-task',
      text: '新しいタスク',
      children: []
    }
  ]
};

export const createInitialData = (): SavedData => ({
  root: initialTasks,
  viewOffset: { x: 0, y: 0 },
  zoom: 1,
  savedAt: new Date().toISOString()
});
