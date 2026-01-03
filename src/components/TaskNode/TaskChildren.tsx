import React from 'react';
import type { TaskNode as TaskNodeType } from '../../types/task';

// 簡素化されたProps（Contextを使用するため）
interface TaskChildrenProps {
  children: TaskNodeType[];
  depth: number;
  TaskNodeComponent: React.ComponentType<{
    task: TaskNodeType;
    depth: number;
    isFirst: boolean;
    isLast: boolean;
  }>;
}

export const TaskChildren = React.memo(function TaskChildren({
  children,
  depth,
  TaskNodeComponent,
}: TaskChildrenProps) {
  if (children.length === 0) return null;

  return (
    <div className="children-container">
      {children.map((child, index) => (
        <TaskNodeComponent
          key={child.id}
          task={child}
          depth={depth + 1}
          isFirst={index === 0}
          isLast={index === children.length - 1}
        />
      ))}
    </div>
  );
});
