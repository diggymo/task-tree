import type { TaskNode, TaskRoot, TaskSearchResult } from '../types/task';

export const generateId = (): string =>
  Math.random().toString(36).substr(2, 9);

export const findTask = (
  node: TaskNode | TaskRoot,
  id: string,
  parent: TaskNode | TaskRoot | null = null,
  index: number = 0
): TaskSearchResult | null => {
  if (node.id === id) {
    return { node: node as TaskNode, parent, index };
  }
  for (let i = 0; i < node.children.length; i++) {
    const result = findTask(node.children[i], id, node, i);
    if (result) return result;
  }
  return null;
};

export const updateTask = (
  node: TaskNode | TaskRoot,
  id: string,
  updates: Partial<TaskNode>
): TaskNode | TaskRoot => {
  if (node.id === id) {
    return { ...node, ...updates };
  }
  return {
    ...node,
    children: node.children.map(child => updateTask(child, id, updates) as TaskNode)
  };
};

export const addSibling = (
  parentNode: TaskNode | TaskRoot,
  afterIndex: number,
  newTask: TaskNode
): TaskNode | TaskRoot => {
  const newChildren = [...parentNode.children];
  newChildren.splice(afterIndex + 1, 0, newTask);
  return { ...parentNode, children: newChildren };
};

export const addChild = (
  node: TaskNode | TaskRoot,
  parentId: string,
  newTask: TaskNode
): TaskNode | TaskRoot => {
  if (node.id === parentId) {
    return { ...node, children: [...node.children, newTask] };
  }
  return {
    ...node,
    children: node.children.map(child => addChild(child, parentId, newTask) as TaskNode)
  };
};

export const removeTask = (
  node: TaskNode | TaskRoot,
  id: string
): TaskNode | TaskRoot => {
  return {
    ...node,
    children: node.children
      .filter(child => child.id !== id)
      .map(child => removeTask(child, id) as TaskNode)
  };
};

export const isDescendant = (node: TaskNode, id: string): boolean => {
  if (node.id === id) return true;
  return node.children.some(child => isDescendant(child, id));
};

export const insertAtIndex = (
  node: TaskNode | TaskRoot,
  targetParent: TaskNode | TaskRoot,
  insertIndex: number,
  taskToInsert: TaskNode
): TaskNode | TaskRoot => {
  if (node.id === targetParent.id) {
    const newChildren = [...node.children];
    newChildren.splice(insertIndex, 0, taskToInsert);
    return { ...node, children: newChildren };
  }
  return {
    ...node,
    children: node.children.map(child =>
      insertAtIndex(child, targetParent, insertIndex, taskToInsert) as TaskNode
    )
  };
};

/**
 * タスクの完了状態を計算する（子タスクから再帰的に計算）
 * - 子タスクがある場合: すべての子が完了していれば true
 * - 子タスクがない場合: task.completed の値を返す
 */
export const isTaskCompleted = (task: TaskNode): boolean => {
  if (task.children.length === 0) {
    // 葉タスク: 保存されている completed 値を返す
    return task.completed ?? false;
  }

  // 親タスク: すべての子が完了していれば true
  return task.children.every(child => isTaskCompleted(child));
};

/**
 * タスクが親タスクかどうかを判定
 */
export const hasChildren = (task: TaskNode): boolean => {
  return task.children.length > 0;
};

/**
 * 完了した子タスクの数と総数を取得
 */
export const getCompletionStats = (task: TaskNode): { completed: number; total: number } => {
  if (task.children.length === 0) {
    return { completed: 0, total: 0 };
  }

  const total = task.children.length;
  const completed = task.children.filter(child => isTaskCompleted(child)).length;

  return { completed, total };
};
