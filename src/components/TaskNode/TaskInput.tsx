import React from 'react';

interface TaskInputProps {
  taskId: string;
  text: string;
  inputRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
  onTextChange: (taskId: string, text: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>, taskId: string) => void;
  onFocus: (taskId: string) => void;
  style?: React.CSSProperties;
}

export const TaskInput = React.memo(function TaskInput({
  taskId,
  text,
  inputRefs,
  onTextChange,
  onKeyDown,
  onFocus,
  style
}: TaskInputProps) {
  return (
    <textarea
      ref={el => { if (inputRefs) inputRefs.current[taskId] = el; }}
      value={text}
      onChange={(e) => onTextChange(taskId, e.target.value)}
      onKeyDown={(e) => onKeyDown(e, taskId)}
      onFocus={() => onFocus(taskId)}
      placeholder="タスクを入力..."
      className="task-input"
      rows={1}
      style={style}
    />
  );
});
