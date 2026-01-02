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
