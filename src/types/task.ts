export interface TaskImage {
  id: string;
  s3Key: string;
  presignedUrl: string;
  uploadedAt: string;
}

export interface TaskNode {
  id: string;
  text: string;
  children: TaskNode[];
  completed?: boolean;
  images?: TaskImage[];
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
export type ViewMode = 'tree' | 'list';

export interface TaskSearchResult {
  node: TaskNode;
  parent: TaskNode | TaskRoot | null;
  index: number;
}

export const initialTasks: TaskRoot = {
  id: 'root',
  text: 'ルート',
  children: [
    {
      id: 'initial-task',
      text: '新しいタスク',
      children: [],
    },
  ],
};

export const createInitialData = (): SavedData => ({
  root: initialTasks,
  viewOffset: { x: 0, y: 0 },
  zoom: 1,
  savedAt: new Date().toISOString(),
});
